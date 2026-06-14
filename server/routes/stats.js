import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();
const db = getDb();

// 获取所有提醒（超期/温度不符/库存不足）
router.get('/alerts', (req, res) => {
  const alerts = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);

  // 当前开封中记录
  const activeOpens = db.prepare(`
    SELECT o.*, i.name, i.opened_days, i.storage_temp_min, i.storage_temp_max,
           i.low_stock_threshold, i.unit, i.batch, i.brand
    FROM open_records o
    JOIN ingredients i ON o.ingredient_id = i.id
    WHERE o.is_discarded = 0
  `).all();

  activeOpens.forEach((o) => {
    const daysOpened = daysBetween(today, o.open_date);
    const daysLeft = o.opened_days - daysOpened;

    if (daysLeft < 0) {
      alerts.push({
        id: `exp_${o.id}`,
        type: 'expired',
        level: 'danger',
        title: `⚠️ ${o.name} 开封超期`,
        description: `已开封 ${Math.abs(daysLeft)} 天，超过开封后可用 ${o.opened_days} 天。批次：${o.batch}`,
        ingredientId: o.ingredient_id,
        openRecordId: o.id,
        timestamp: nowStr,
        acknowledged: false,
      });
    } else if (daysLeft <= 1) {
      alerts.push({
        id: `warn_${o.id}`,
        type: 'expired',
        level: 'warning',
        title: `⏰ ${o.name} 即将过期`,
        description: `剩余 ${daysLeft} 天保质期，请尽快使用。批次：${o.batch}`,
        ingredientId: o.ingredient_id,
        openRecordId: o.id,
        timestamp: nowStr,
        acknowledged: false,
      });
    }

    if (o.actual_temp !== null && (o.actual_temp < o.storage_temp_min || o.actual_temp > o.storage_temp_max)) {
      alerts.push({
        id: `temp_${o.id}`,
        type: 'temp',
        level: 'danger',
        title: `🌡️ ${o.name} 储存温度不符`,
        description: `当前温度 ${o.actual_temp}°C，要求范围 ${o.storage_temp_min}~${o.storage_temp_max}°C。存放位置：${o.freezer_location}`,
        ingredientId: o.ingredient_id,
        openRecordId: o.id,
        timestamp: nowStr,
        acknowledged: false,
      });
    }

    if (o.remaining_weight <= o.low_stock_threshold && o.remaining_weight > 0) {
      alerts.push({
        id: `stock_${o.id}`,
        type: 'lowStock',
        level: 'warning',
        title: `📦 ${o.name} 剩余量不足`,
        description: `剩余 ${o.remaining_weight}${o.unit}，低于阈值 ${o.low_stock_threshold}${o.unit}`,
        ingredientId: o.ingredient_id,
        openRecordId: o.id,
        timestamp: nowStr,
        acknowledged: false,
      });
    }
  });

  // 原料总库存告急
  const ingredients = db.prepare('SELECT * FROM ingredients').all();
  ingredients.forEach((ing) => {
    const active = activeOpens.filter((o) => o.ingredient_id === ing.id);
    const totalRemaining = active.reduce((s, o) => s + o.remaining_weight, 0);
    if (active.length === 0 || totalRemaining <= ing.low_stock_threshold) {
      const hasAlert = alerts.some((a) => a.ingredientId === ing.id && a.type === 'lowStock');
      if (!hasAlert) {
        alerts.push({
          id: `gstock_${ing.id}`,
          type: 'lowStock',
          level: 'warning',
          title: `📦 ${ing.name} 库存告急`,
          description: `总库存约 ${totalRemaining}${ing.unit}，低于阈值 ${ing.low_stock_threshold}${ing.unit}，建议尽快采购`,
          ingredientId: ing.id,
          timestamp: nowStr,
          acknowledged: false,
        });
      }
    }
  });

  res.json({ code: 0, data: alerts });
});

// 临期清单
router.get('/expiring-soon', (req, res) => {
  const days = Number(req.query.days || 7);
  const today = new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT o.*, i.name, i.brand, i.batch, i.opened_days, i.unit
    FROM open_records o
    JOIN ingredients i ON o.ingredient_id = i.id
    WHERE o.is_discarded = 0
    ORDER BY o.open_date DESC
  `).all();

  const result = rows
    .map((o) => {
      const daysOpened = daysBetween(today, o.open_date);
      const daysLeft = o.opened_days - daysOpened;
      return { ...o, daysLeft };
    })
    .filter((o) => o.daysLeft <= days)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .map((o) => ({
      id: o.id,
      ingredientId: o.ingredient_id,
      operator: o.operator,
      openDate: o.open_date,
      remainingWeight: o.remaining_weight,
      sealingMethod: o.sealing_method,
      freezerLocation: o.freezer_location,
      actualTemp: o.actual_temp,
      daysLeft: o.daysLeft,
      ingredient: {
        id: o.ingredient_id,
        name: o.name,
        brand: o.brand,
        batch: o.batch,
        openedDays: o.opened_days,
        unit: o.unit,
      },
    }));

  res.json({ code: 0, data: result });
});

// 报废原因统计
router.get('/discard-stats', (req, res) => {
  const rows = db.prepare(`
    SELECT discard_reason as reason, COUNT(*) as count, SUM(remaining_weight) as weight
    FROM open_records
    WHERE is_discarded = 1 AND discard_reason IS NOT NULL
    GROUP BY discard_reason
    ORDER BY count DESC
  `).all();

  res.json({
    code: 0,
    data: rows.map((r) => ({
      reason: r.reason,
      count: r.count,
      weight: Number(r.weight.toFixed(2)),
    })),
  });
});

// 采购建议
router.get('/purchase-suggestions', (req, res) => {
  const daysForAvg = 14;
  const startDate = new Date(Date.now() - (daysForAvg - 1) * 24 * 3600 * 1000).toISOString().split('T')[0];

  const ingredients = db.prepare('SELECT * FROM ingredients').all();
  const suggestions = [];

  ingredients.forEach((ing) => {
    const activeOpens = db.prepare(
      'SELECT remaining_weight FROM open_records WHERE ingredient_id = ? AND is_discarded = 0'
    ).all(ing.id);
    const currentStock = activeOpens.reduce((s, r) => s + r.remaining_weight, 0);

    const usages = db.prepare(
      'SELECT amount FROM usage_records WHERE ingredient_id = ? AND usage_date >= ?'
    ).all(ing.id, startDate);
    const totalUsed = usages.reduce((s, u) => s + u.amount, 0);
    const avgDailyUsage = totalUsed / daysForAvg;

    const daysLeft = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : 999;

    let urgency = 'low';
    if (daysLeft <= 3 || currentStock <= ing.low_stock_threshold) urgency = 'high';
    else if (daysLeft <= 7) urgency = 'medium';

    const suggestedQuantity = Math.max(
      ing.total_weight,
      Math.ceil((avgDailyUsage * 14) / ing.total_weight) * ing.total_weight
    );

    suggestions.push({
      ingredientId: ing.id,
      ingredientName: ing.name,
      brand: ing.brand,
      currentStock,
      unit: ing.unit,
      avgDailyUsage: Number(avgDailyUsage.toFixed(2)),
      daysLeft,
      suggestedQuantity,
      urgency,
    });
  });

  const order = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => order[a.urgency] - order[b.urgency]);

  res.json({ code: 0, data: suggestions });
});

// 原料损耗率
router.get('/loss-rates', (req, res) => {
  const ingredients = db.prepare('SELECT * FROM ingredients').all();
  const result = [];

  ingredients.forEach((ing) => {
    const opens = db.prepare('SELECT id, remaining_weight, is_discarded FROM open_records WHERE ingredient_id = ?').all(ing.id);

    let totalOpened = 0;
    let totalDiscarded = 0;

    opens.forEach((o) => {
      const used = db.prepare('SELECT SUM(amount) as s FROM usage_records WHERE open_record_id = ?').get(o.id).s || 0;
      totalOpened += used + o.remaining_weight;
      if (o.is_discarded) totalDiscarded += o.remaining_weight;
    });

    result.push({
      id: ing.id,
      name: ing.name,
      totalDiscarded: Number(totalDiscarded.toFixed(2)),
      totalOpened: Number(totalOpened.toFixed(2)),
      lossRate: totalOpened > 0 ? Number(((totalDiscarded / totalOpened) * 100).toFixed(2)) : 0,
    });
  });

  result.sort((a, b) => b.lossRate - a.lossRate);
  res.json({ code: 0, data: result.slice(0, 10) });
});

// 每日用量
router.get('/daily-usage', (req, res) => {
  const days = Number(req.query.days || 14);
  const startDate = new Date(Date.now() - (days - 1) * 24 * 3600 * 1000).toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT usage_date as date, ingredient_id, ingredient_name, SUM(amount) as total_used, unit
    FROM (
      SELECT u.usage_date, u.ingredient_id, i.name as ingredient_name, u.amount, i.unit
      FROM usage_records u
      JOIN ingredients i ON u.ingredient_id = i.id
      WHERE u.usage_date >= ?
    )
    GROUP BY usage_date, ingredient_id, ingredient_name, unit
    ORDER BY usage_date DESC
  `).all(startDate);

  res.json({
    code: 0,
    data: rows.map((r) => ({
      date: r.date,
      ingredientId: r.ingredient_id,
      ingredientName: r.ingredient_name,
      totalUsed: r.total_used,
      unit: r.unit,
    })),
  });
});

// 仪表盘概览
router.get('/overview', (req, res) => {
  const ingredientCount = db.prepare('SELECT COUNT(*) as c FROM ingredients').get().c;
  const activeOpenCount = db.prepare('SELECT COUNT(*) as c FROM open_records WHERE is_discarded = 0').get().c;
  const discardedCount = db.prepare('SELECT COUNT(*) as c FROM open_records WHERE is_discarded = 1').get().c;
  const today = new Date().toISOString().split('T')[0];
  const todayUsages = db.prepare('SELECT COUNT(*) as c FROM usage_records WHERE usage_date = ?').get(today).c;
  const todayTypes = db.prepare('SELECT COUNT(DISTINCT ingredient_id) as c FROM usage_records WHERE usage_date = ?').get(today).c;

  // 整体损耗率
  const totalOpened = db.prepare(`
    SELECT COALESCE(SUM(u.amount), 0) + COALESCE(SUM(o.remaining_weight), 0) as total
    FROM open_records o
    LEFT JOIN usage_records u ON u.open_record_id = o.id
  `).get().total;

  const totalDiscarded = db.prepare(
    'SELECT COALESCE(SUM(remaining_weight), 0) as total FROM open_records WHERE is_discarded = 1'
  ).get().total;

  res.json({
    code: 0,
    data: {
      ingredientCount,
      activeOpenCount,
      discardedCount,
      todayUsageCount: todayUsages,
      todayUsageTypes: todayTypes,
      overallLossRate: totalOpened > 0 ? Number(((totalDiscarded / totalOpened) * 100).toFixed(2)) : 0,
    },
  });
});

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d1 - d2) / (24 * 3600 * 1000));
}

export default router;
