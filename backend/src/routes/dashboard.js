const express = require('express');
const dayjs = require('dayjs');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

router.get('/summary', (req, res) => {
  try {
    const totalPlants = db.prepare('SELECT COUNT(*) as count FROM plants').get().count;

    const statusStats = db.prepare(`
      SELECT status, COUNT(*) as count FROM plants
      GROUP BY status
    `).all();

    const statusDistribution = {};
    statusStats.forEach(s => {
      statusDistribution[s.status] = s.count;
    });

    const today = dayjs().format('YYYY-MM-DD');
    const weekday = dayjs().day() === 0 ? 7 : dayjs().day();

    const todayHoliday = db.prepare('SELECT * FROM holidays WHERE date = ?').get(today);
    let todayTasks = 0;
    let completedTasks = 0;

    if (!todayHoliday) {
      todayTasks = db.prepare(`
        SELECT COUNT(*) as count FROM duty_schedule WHERE weekday = ?
      `).get(weekday).count;

      completedTasks = db.prepare(`
        SELECT COUNT(DISTINCT wr.plant_id) as count
        FROM water_records wr
        WHERE wr.record_date = ? AND wr.skipped = 0
      `).get(today).count;
    }

    const completionRate = todayTasks > 0 ? Number(((completedTasks / todayTasks) * 100).toFixed(1)) : 0;

    res.json(success({
      total_plants: totalPlants,
      status_distribution: statusDistribution,
      today_tasks: todayTasks,
      completed_tasks: completedTasks,
      completion_rate: completionRate
    }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/water-risk', (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');

    const allPlants = db.prepare(`
      SELECT p.*,
        julianday(?) - julianday(COALESCE(p.last_watered_at, p.created_at)) as days_since_water
      FROM plants p
      WHERE p.status != 'dead'
      ORDER BY days_since_water DESC
    `).all(today);

    const riskPlants = allPlants.map(p => {
      const interval = p.water_interval_days || 7;
      const daysSince = p.days_since_water || 0;
      const diff = daysSince - interval;

      let risk_level = 'normal';
      if (diff >= 2) {
        risk_level = 'overdue_high';
      } else if (diff >= 0) {
        risk_level = 'overdue_low';
      } else if (diff >= -1) {
        risk_level = 'upcoming';
      }

      return {
        ...p,
        days_since_water: Math.round(daysSince),
        water_interval_days: interval,
        days_overdue: Math.round(diff),
        risk_level
      };
    }).filter(p => p.risk_level !== 'normal');

    const overwateredPlants = allPlants.filter(p => {
      const daysSince = p.days_since_water || 0;
      return daysSince < 1;
    }).map(p => ({
      ...p,
      days_since_water: Math.round(p.days_since_water || 0),
      risk_level: 'overwatered'
    }));

    const result = {
      water_risk: riskPlants,
      overwatered: overwateredPlants
    };

    res.json(success(result));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/completion-rate', (req, res) => {
  try {
    const { type = 'group' } = req.query;
    const today = dayjs().format('YYYY-MM-DD');
    const weekday = dayjs().day() === 0 ? 7 : dayjs().day();

    const isHolidayToday = !!db.prepare('SELECT * FROM holidays WHERE date = ?').get(today);

    if (type === 'location') {
      const locations = db.prepare(`
        SELECT DISTINCT location FROM plants WHERE status != 'dead'
      `).all().map(p => p.location);

      const result = locations.map(loc => {
        const totalTasks = isHolidayToday ? 0 : db.prepare(`
          SELECT COUNT(*) as count FROM duty_schedule ds
          JOIN plants p ON ds.plant_id = p.id
          WHERE p.location = ? AND ds.weekday = ?
        `).get(loc, weekday).count;

        const completedTasks = db.prepare(`
          SELECT COUNT(DISTINCT wr.plant_id) as count
          FROM water_records wr
          JOIN plants p ON wr.plant_id = p.id
          WHERE p.location = ? AND wr.record_date = ? AND wr.skipped = 0
        `).get(loc, today).count;

        return {
          name: loc,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate: totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0
        };
      });

      return res.json(success(result));
    }

    const groups = db.prepare(`
      SELECT DISTINCT group_name FROM plants WHERE status != 'dead'
    `).all().map(p => p.group_name);

    const result = groups.map(group => {
      const totalTasks = isHolidayToday ? 0 : db.prepare(`
        SELECT COUNT(*) as count FROM duty_schedule ds
        JOIN plants p ON ds.plant_id = p.id
        WHERE p.group_name = ? AND ds.weekday = ?
      `).get(group, weekday).count;

      const completedTasks = db.prepare(`
        SELECT COUNT(DISTINCT wr.plant_id) as count
        FROM water_records wr
        JOIN plants p ON wr.plant_id = p.id
        WHERE p.group_name = ? AND wr.record_date = ? AND wr.skipped = 0
      `).get(group, today).count;

      return {
        name: group,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_rate: totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0
      };
    });

    res.json(success(result));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/worst-corners', (req, res) => {
  try {
    const locations = db.prepare(`
      SELECT
        location,
        COUNT(*) as total_count,
        SUM(CASE WHEN status IN ('warning', 'sick', 'dead') THEN 1 ELSE 0 END) as unhealthy_count
      FROM plants
      GROUP BY location
      HAVING total_count > 0
      ORDER BY (CAST(unhealthy_count AS FLOAT) / total_count) DESC, unhealthy_count DESC
    `).all();

    const result = locations.map(loc => ({
      location: loc.location,
      total_count: loc.total_count,
      unhealthy_count: loc.unhealthy_count,
      unhealthy_ratio: Number(((loc.unhealthy_count / loc.total_count) * 100).toFixed(1))
    }));

    res.json(success(result));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/weekly-stats', (req, res) => {
  try {
    const today = dayjs();
    const stats = [];

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const weekday = date.day() === 0 ? 7 : date.day();

      const isHoliday = !!db.prepare('SELECT * FROM holidays WHERE date = ?').get(dateStr);

      const totalTasks = isHoliday ? 0 : db.prepare(`
        SELECT COUNT(*) as count FROM duty_schedule WHERE weekday = ?
      `).get(weekday).count;

      const waterRecords = db.prepare(`
        SELECT COUNT(*) as count,
          SUM(CASE WHEN skipped = 0 THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN skipped = 1 THEN 1 ELSE 0 END) as skipped_count
        FROM water_records WHERE record_date = ?
      `).get(dateStr);

      stats.push({
        date: dateStr,
        weekday: weekday,
        is_holiday: isHoliday,
        total_tasks: totalTasks,
        completed_count: waterRecords.completed_count || 0,
        skipped_count: waterRecords.skipped_count || 0,
        completion_rate: totalTasks > 0
          ? Number((((waterRecords.completed_count || 0) / totalTasks) * 100).toFixed(1))
          : 0
      });
    }

    res.json(success(stats));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
