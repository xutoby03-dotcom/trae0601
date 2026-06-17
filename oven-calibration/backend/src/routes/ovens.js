const express = require('express');
const db = require('../database');
const { success, pagination, mapRowToNested } = require('../utils/response');

const router = express.Router();

const VALID_STATUSES = ['active', 'maintenance', 'decommissioned'];

router.get('/', (req, res, next) => {
  try {
    const { page = 1, page_size = 10, status } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    let whereClause = '';
    const params = [];

    if (status && VALID_STATUSES.includes(status)) {
      whereClause = 'WHERE o.status = ?';
      params.push(status);
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM ovens o ${whereClause}`
    );
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(`
      SELECT 
        o.id,
        o.model,
        o.serial_number,
        o.total_layers,
        o.probe_position,
        o.common_temp_zone_low,
        o.common_temp_zone_high,
        o.employee_id,
        o.status,
        o.last_maintenance_date,
        o.created_at,
        o.updated_at,
        e.id AS employee_id_,
        e.name AS employee_name,
        e.role AS employee_role,
        cr.id AS latest_calibration_id,
        cr.deviation AS latest_calibration_deviation,
        cr.calibrated_at AS latest_calibration_at
      FROM ovens o
      LEFT JOIN employees e ON o.employee_id = e.id
      LEFT JOIN (
        SELECT 
          cr1.*
        FROM calibration_records cr1
        INNER JOIN (
          SELECT oven_id, MAX(calibrated_at) as max_calibrated_at
          FROM calibration_records
          GROUP BY oven_id
        ) cr2 ON cr1.oven_id = cr2.oven_id AND cr1.calibrated_at = cr2.max_calibrated_at
      ) cr ON o.id = cr.oven_id
      ${whereClause}
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
    `);

    const rawList = listStmt.all(...params, pageSizeNum, offset);

    const list = rawList.map(row => {
      const result = mapRowToNested(row, ['employee']);
      
      if (result.latest_calibration_id !== null) {
        result.latest_calibration = {
          id: result.latest_calibration_id,
          deviation: result.latest_calibration_deviation,
          calibrated_at: result.latest_calibration_at,
        };
      } else {
        result.latest_calibration = null;
      }
      
      delete result.latest_calibration_id;
      delete result.latest_calibration_deviation;
      delete result.latest_calibration_at;
      
      return result;
    });

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const ovenStmt = db.prepare(`
      SELECT 
        o.id,
        o.model,
        o.serial_number,
        o.total_layers,
        o.probe_position,
        o.common_temp_zone_low,
        o.common_temp_zone_high,
        o.employee_id,
        o.status,
        o.last_maintenance_date,
        o.created_at,
        o.updated_at,
        e.id AS employee_id_,
        e.name AS employee_name,
        e.role AS employee_role,
        e.phone AS employee_phone
      FROM ovens o
      LEFT JOIN employees e ON o.employee_id = e.id
      WHERE o.id = ?
    `);
    const rawOven = ovenStmt.get(id);

    if (!rawOven) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '烤箱不存在',
      });
    }

    const oven = mapRowToNested(rawOven, ['employee']);

    const calibrationStmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.employee_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.calibrated_at,
        cr.notes,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN employees e ON cr.employee_id = e.id
      WHERE cr.oven_id = ?
      ORDER BY cr.calibrated_at DESC
      LIMIT 10
    `);
    const calibration_history = calibrationStmt.all(id);

    const recipeCountStmt = db.prepare(`
      SELECT COUNT(*) as recipe_count
      FROM recipes
      WHERE recommended_oven_id = ?
    `);
    const { recipe_count } = recipeCountStmt.get(id);

    const failedBatchesStmt = db.prepare(`
      SELECT COUNT(*) as failed_batches_count
      FROM batches
      WHERE oven_id = ?
        AND result = 'failed'
        AND produced_at >= datetime('now', '-30 days')
    `);
    const { failed_batches_count } = failedBatchesStmt.get(id);

    const result = {
      ...oven,
      calibration_history,
      recipe_count,
      failed_batches_last_30_days: failed_batches_count,
    };

    res.json(success(result));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const {
      model,
      serial_number,
      total_layers,
      probe_position,
      common_temp_zone_low,
      common_temp_zone_high,
      employee_id,
      status = 'active',
    } = req.body;

    if (!model || !model.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '烤箱型号不能为空',
      });
    }

    if (!serial_number || !serial_number.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '序列号不能为空',
      });
    }

    if (!total_layers || total_layers <= 0) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '层数必须大于0',
      });
    }

    if (!probe_position || !probe_position.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '探针位置不能为空',
      });
    }

    if (common_temp_zone_low === undefined || common_temp_zone_high === undefined) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '温度区间不能为空',
      });
    }

    if (common_temp_zone_low >= common_temp_zone_high) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '温度下限必须小于上限',
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '状态必须是 active、maintenance 或 decommissioned',
      });
    }

    if (employee_id) {
      const empCheck = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
      if (!empCheck) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '负责人不存在',
        });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO ovens (
        model, serial_number, total_layers, probe_position,
        common_temp_zone_low, common_temp_zone_high, employee_id, status,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const info = stmt.run(
      model.trim(),
      serial_number.trim(),
      total_layers,
      probe_position.trim(),
      common_temp_zone_low,
      common_temp_zone_high,
      employee_id || null,
      status
    );

    const selectStmt = db.prepare(`
      SELECT id, model, serial_number, total_layers, probe_position,
             common_temp_zone_low, common_temp_zone_high, employee_id, status,
             last_maintenance_date, created_at, updated_at
      FROM ovens WHERE id = ?
    `);
    const oven = selectStmt.get(info.lastInsertRowid);

    res.status(201).json(success(oven, '创建成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      model,
      serial_number,
      total_layers,
      probe_position,
      common_temp_zone_low,
      common_temp_zone_high,
      employee_id,
      status,
    } = req.body;

    const checkStmt = db.prepare('SELECT id FROM ovens WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '烤箱不存在',
      });
    }

    if (model !== undefined && !model.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '烤箱型号不能为空',
      });
    }

    if (serial_number !== undefined && !serial_number.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '序列号不能为空',
      });
    }

    if (total_layers !== undefined && total_layers <= 0) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '层数必须大于0',
      });
    }

    if (probe_position !== undefined && !probe_position.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '探针位置不能为空',
      });
    }

    const hasTempLow = common_temp_zone_low !== undefined;
    const hasTempHigh = common_temp_zone_high !== undefined;
    
    if (hasTempLow && hasTempHigh && common_temp_zone_low >= common_temp_zone_high) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '温度下限必须小于上限',
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '状态必须是 active、maintenance 或 decommissioned',
      });
    }

    if (employee_id !== undefined && employee_id !== null) {
      const empCheck = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
      if (!empCheck) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '负责人不存在',
        });
      }
    }

    const updateFields = [];
    const updateParams = [];

    if (model !== undefined) {
      updateFields.push('model = ?');
      updateParams.push(model.trim());
    }
    if (serial_number !== undefined) {
      updateFields.push('serial_number = ?');
      updateParams.push(serial_number.trim());
    }
    if (total_layers !== undefined) {
      updateFields.push('total_layers = ?');
      updateParams.push(total_layers);
    }
    if (probe_position !== undefined) {
      updateFields.push('probe_position = ?');
      updateParams.push(probe_position.trim());
    }
    if (common_temp_zone_low !== undefined) {
      updateFields.push('common_temp_zone_low = ?');
      updateParams.push(common_temp_zone_low);
    }
    if (common_temp_zone_high !== undefined) {
      updateFields.push('common_temp_zone_high = ?');
      updateParams.push(common_temp_zone_high);
    }
    if (employee_id !== undefined) {
      updateFields.push('employee_id = ?');
      updateParams.push(employee_id || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    updateFields.push('updated_at = datetime(\'now\')');
    updateParams.push(id);

    const stmt = db.prepare(
      `UPDATE ovens SET ${updateFields.join(', ')} WHERE id = ?`
    );
    stmt.run(...updateParams);

    const selectStmt = db.prepare(`
      SELECT id, model, serial_number, total_layers, probe_position,
             common_temp_zone_low, common_temp_zone_high, employee_id, status,
             last_maintenance_date, created_at, updated_at
      FROM ovens WHERE id = ?
    `);
    const oven = selectStmt.get(id);

    res.json(success(oven, '更新成功'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM ovens WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '烤箱不存在',
      });
    }

    const stmt = db.prepare('DELETE FROM ovens WHERE id = ?');
    stmt.run(id);

    res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const checkStmt = db.prepare('SELECT id FROM ovens WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '烤箱不存在',
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '状态必须是 active、maintenance 或 decommissioned',
      });
    }

    const stmt = db.prepare(`
      UPDATE ovens SET status = ?, updated_at = datetime('now') WHERE id = ?
    `);
    stmt.run(status, id);

    const selectStmt = db.prepare(`
      SELECT id, model, serial_number, status, updated_at
      FROM ovens WHERE id = ?
    `);
    const oven = selectStmt.get(id);

    res.json(success(oven, '状态更新成功'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
