const express = require('express');
const db = require('../database');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/overview', (req, res, next) => {
  try {
    const totalOvensStmt = db.prepare(`SELECT COUNT(*) as count FROM ovens`);
    const activeOvensStmt = db.prepare(`SELECT COUNT(*) as count FROM ovens WHERE status = 'active'`);
    const maintenanceOvensStmt = db.prepare(`SELECT COUNT(*) as count FROM ovens WHERE status = 'maintenance'`);
    const decommissionedOvensStmt = db.prepare(`SELECT COUNT(*) as count FROM ovens WHERE status = 'decommissioned'`);
    const totalRecipesStmt = db.prepare(`SELECT COUNT(*) as count FROM recipes`);
    
    const batches30Stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as success
      FROM batches 
      WHERE produced_at >= datetime('now', '-30 days')
    `);
    
    const avgDeviation7Stmt = db.prepare(`
      SELECT ROUND(AVG(ABS(deviation)), 1) as avg_deviation
      FROM calibration_records
      WHERE calibrated_at >= datetime('now', '-7 days')
    `);
    
    const total_ovens = totalOvensStmt.get().count;
    const active_ovens = activeOvensStmt.get().count;
    const maintenance_ovens = maintenanceOvensStmt.get().count;
    const decommissioned_ovens = decommissionedOvensStmt.get().count;
    const total_recipes = totalRecipesStmt.get().count;
    
    const batches30 = batches30Stmt.get();
    const total_batches = batches30.total;
    const success_rate = total_batches > 0 
      ? Number(((batches30.success / total_batches) * 100).toFixed(1)) 
      : 0.0;
    
    const avgDeviation7 = avgDeviation7Stmt.get();
    const avg_deviation = avgDeviation7.avg_deviation || 0.0;
    
    res.json(success({
      total_ovens,
      active_ovens,
      maintenance_ovens,
      decommissioned_ovens,
      total_recipes,
      total_batches,
      success_rate,
      avg_deviation
    }));
  } catch (err) {
    next(err);
  }
});

router.get('/deviation-trend', (req, res, next) => {
  try {
    const { oven_id, days = 30 } = req.query;
    
    let whereClause = 'WHERE calibrated_at >= datetime(\'now\', ?)';
    const params = [`-${days} days`];
    
    if (oven_id) {
      whereClause += ' AND oven_id = ?';
      params.push(oven_id);
    }
    
    const stmt = db.prepare(`
      SELECT 
        DATE(calibrated_at) as date,
        ROUND(AVG(deviation), 1) as avg_deviation,
        COUNT(*) as count
      FROM calibration_records
      ${whereClause}
      GROUP BY DATE(calibrated_at)
      ORDER BY date ASC
    `);
    
    const data = stmt.all(...params);
    
    res.json(success(data));
  } catch (err) {
    next(err);
  }
});

router.get('/maintenance-alerts', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.id as oven_id,
        o.model,
        o.serial_number,
        o.status,
        o.last_maintenance_date,
        o.created_at,
        (julianday('now') - julianday(COALESCE(o.last_maintenance_date, o.created_at))) as last_maintenance_days,
        (
          SELECT ROUND(AVG(ABS(deviation)), 1)
          FROM (
            SELECT deviation
            FROM calibration_records
            WHERE oven_id = o.id
            ORDER BY calibrated_at DESC
            LIMIT 3
          )
        ) as avg_recent_deviation,
        (
          SELECT COUNT(*)
          FROM calibration_records
          WHERE oven_id = o.id
            AND ABS(deviation) > 10
            AND calibrated_at >= datetime('now', '-7 days')
        ) as high_deviation_count,
        (
          SELECT COUNT(*)
          FROM batches
          WHERE oven_id = o.id
            AND result = 'failed'
            AND produced_at >= datetime('now', '-30 days')
        ) as recent_failure_count
      FROM ovens o
      WHERE o.status = 'active'
    `);
    
    const ovens = stmt.all();
    
    const alerts = ovens.map(oven => {
      const alert_types = [];
      const suggestions = [];
      
      if (oven.avg_recent_deviation !== null && oven.avg_recent_deviation > 15) {
        alert_types.push('high_deviation');
        suggestions.push(`最近3次校准平均偏差${oven.avg_recent_deviation}度，超出正常范围`);
      }
      
      if (oven.high_deviation_count > 3) {
        alert_types.push('frequent_high_deviation');
        suggestions.push(`最近7天有${oven.high_deviation_count}次偏差超过10度`);
      }
      
      if (oven.last_maintenance_days > 90) {
        alert_types.push('overdue_maintenance');
        suggestions.push(`距离上次维护${Math.floor(oven.last_maintenance_days)}天，已超过90天`);
      }
      
      if (oven.recent_failure_count >= 5) {
        alert_types.push('frequent_failures');
        suggestions.push(`最近30天失败${oven.recent_failure_count}批次`);
      }
      
      if (alert_types.length === 0) return null;
      
      return {
        oven_id: oven.oven_id,
        model: oven.model,
        alert_type: alert_types,
        last_maintenance_days: Math.floor(oven.last_maintenance_days),
        avg_recent_deviation: oven.avg_recent_deviation || 0,
        recent_failure_count: oven.recent_failure_count,
        suggestion: suggestions.join('；') + '，建议立即安排维护检修'
      };
    }).filter(Boolean);
    
    res.json(success(alerts));
  } catch (err) {
    next(err);
  }
});

router.get('/affected-products', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        r.id as recipe_id,
        r.name as recipe_name,
        COUNT(b.id) as total_batches,
        SUM(CASE WHEN b.result = 'failed' THEN 1 ELSE 0 END) as failed_batches,
        ROUND(
          CASE WHEN COUNT(b.id) > 0 
            THEN (SUM(CASE WHEN b.result = 'failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(b.id)) 
            ELSE 0 
          END, 
          1
        ) as failure_rate
      FROM recipes r
      LEFT JOIN batches b ON r.id = b.recipe_id 
        AND b.produced_at >= datetime('now', '-30 days')
      GROUP BY r.id, r.name
      ORDER BY failure_rate DESC
      LIMIT 10
    `);
    
    const products = stmt.all();
    
    const ovenStmt = db.prepare(`
      SELECT 
        o.id as oven_id,
        o.model,
        COUNT(b.id) as failed_count
      FROM batches b
      JOIN ovens o ON b.oven_id = o.id
      WHERE b.recipe_id = ?
        AND b.result = 'failed'
        AND b.produced_at >= datetime('now', '-30 days')
      GROUP BY o.id, o.model
      ORDER BY failed_count DESC
    `);
    
    const result = products.map(product => ({
      recipe_id: product.recipe_id,
      recipe_name: product.recipe_name,
      total_batches: product.total_batches,
      failed_batches: product.failed_batches,
      failure_rate: product.failure_rate,
      affected_ovens: ovenStmt.all(product.recipe_id)
    }));
    
    res.json(success(result));
  } catch (err) {
    next(err);
  }
});

router.get('/decommission-candidates', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.id as oven_id,
        o.model,
        o.serial_number,
        o.status,
        o.created_at,
        (julianday('now') - julianday(o.created_at)) / 365.25 as years_in_use,
        (
          SELECT ROUND(AVG(ABS(deviation)), 1)
          FROM (
            SELECT deviation
            FROM calibration_records
            WHERE oven_id = o.id
            ORDER BY calibrated_at DESC
            LIMIT 10
          )
        ) as avg_deviation,
        (
          SELECT 
            CASE WHEN COUNT(*) > 0 
              THEN ROUND(SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)
              ELSE 0 
            END
          FROM batches
          WHERE oven_id = o.id
            AND produced_at >= datetime('now', '-30 days')
        ) as failure_rate,
        (
          SELECT COUNT(*)
          FROM batches b
          WHERE b.oven_id = o.id
            AND b.result = 'failed'
            AND b.produced_at >= datetime('now', '-30 days')
        ) as recent_failure_count,
        (
          SELECT COUNT(*)
          FROM batches
          WHERE oven_id = o.id
            AND produced_at >= datetime('now', '-30 days')
        ) as recent_total_count,
        (
          SELECT COUNT(*)
          FROM calibration_records
          WHERE oven_id = o.id
            AND ABS(deviation) > 10
            AND calibrated_at >= datetime('now', '-30 days')
        ) as high_deviation_count_30
      FROM ovens o
      WHERE o.status != 'decommissioned'
    `);
    
    const ovens = stmt.all();
    
    const candidates = ovens.map(oven => {
      const reasons = [];
      let maintenance_count = 0;
      
      if (oven.avg_deviation !== null && oven.avg_deviation > 20) {
        reasons.push(`最近10次校准平均偏差${oven.avg_deviation}度，超过20度`);
      }
      
      if (oven.failure_rate > 40) {
        reasons.push(`最近30天失败率${oven.failure_rate}%，超过40%`);
      }
      
      if (oven.recent_failure_count >= 5) {
        maintenance_count++;
        reasons.push(`最近30天失败${oven.recent_failure_count}批次`);
      }
      
      if (oven.avg_deviation !== null && oven.avg_deviation > 15) {
        maintenance_count++;
      }
      
      if (oven.years_in_use > 5) {
        reasons.push(`已使用${oven.years_in_use.toFixed(1)}年，超过5年`);
      }
      
      if (reasons.length < 2) return null;
      
      return {
        oven_id: oven.oven_id,
        model: oven.model,
        serial_number: oven.serial_number,
        reasons,
        avg_deviation: oven.avg_deviation || 0,
        failure_rate: oven.failure_rate,
        maintenance_count,
        recent_failure_count: oven.recent_failure_count,
        high_deviation_count_30: oven.high_deviation_count_30 || 0,
        recommendation: `该烤箱存在${reasons.length}项问题：${reasons.join('；')}，建议考虑停用更换`
      };
    }).filter(Boolean).sort((a, b) => {
      if (b.recent_failure_count !== a.recent_failure_count) {
        return b.recent_failure_count - a.recent_failure_count;
      }
      return b.high_deviation_count_30 - a.high_deviation_count_30;
    });
    
    res.json(success(candidates));
  } catch (err) {
    next(err);
  }
});

router.get('/layer-performance', (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        o.id as oven_id,
        o.model,
        cr.layer_number,
        ROUND(AVG(ABS(cr.deviation)), 1) as avg_deviation,
        COUNT(DISTINCT b.id) as batch_count,
        ROUND(
          CASE WHEN COUNT(DISTINCT b.id) > 0 
            THEN (SUM(CASE WHEN b.result = 'failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT b.id)) 
            ELSE 0 
          END, 
          1
        ) as failure_rate
      FROM ovens o
      JOIN calibration_records cr ON o.id = cr.oven_id
        AND cr.calibrated_at >= datetime('now', '-30 days')
      LEFT JOIN batches b ON o.id = b.oven_id 
        AND cr.layer_number = b.layer_used
        AND b.produced_at >= datetime('now', '-30 days')
      WHERE o.status = 'active'
      GROUP BY o.id, o.model, cr.layer_number
      ORDER BY o.id, cr.layer_number
    `);
    
    const data = stmt.all();
    
    res.json(success(data));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
