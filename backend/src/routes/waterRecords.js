const express = require('express');
const dayjs = require('dayjs');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

router.get('/', (req, res) => {
  try {
    const { plant_id, start_date, end_date, page = 1, pageSize = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (plant_id) {
      conditions.push('wr.plant_id = ?');
      params.push(plant_id);
    }
    if (start_date) {
      conditions.push('wr.record_date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('wr.record_date <= ?');
      params.push(end_date);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM water_records wr ${whereSql}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * pageSize;
    const listStmt = db.prepare(`
      SELECT wr.*, p.name as plant_name, e.name as employee_name
      FROM water_records wr
      JOIN plants p ON wr.plant_id = p.id
      JOIN employees e ON wr.employee_id = e.id
      ${whereSql}
      ORDER BY wr.record_date DESC, wr.id DESC
      LIMIT ? OFFSET ?
    `);
    const list = listStmt.all(...params, pageSize, offset);

    res.json(success({
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', (req, res) => {
  try {
    const {
      plant_id, employee_id, record_date,
      soil_moisture, leaf_status, water_amount,
      rotated = 0, skipped = 0, skip_reason, notes
    } = req.body;

    if (!plant_id || !employee_id) {
      return res.status(400).json(error('缺少必要字段'));
    }

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plant_id);
    if (!plant) {
      return res.status(404).json(error('植物不存在'));
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json(error('员工不存在'));
    }

    const dateStr = record_date || dayjs().format('YYYY-MM-DD');

    if (skipped === 1 || skipped === true) {
      const stmt = db.prepare(`
        INSERT INTO water_records (plant_id, employee_id, record_date, soil_moisture, leaf_status, water_amount, rotated, skipped, skip_reason, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        plant_id, employee_id, dateStr,
        soil_moisture || null,
        leaf_status || null,
        water_amount || null,
        rotated ? 1 : 0,
        1,
        skip_reason || null,
        notes || null
      );

      const record = db.prepare(`
        SELECT wr.*, p.name as plant_name, e.name as employee_name
        FROM water_records wr
        JOIN plants p ON wr.plant_id = p.id
        JOIN employees e ON wr.employee_id = e.id
        WHERE wr.id = ?
      `).get(result.lastInsertRowid);

      return res.json(success(record, '已记录跳过'));
    }

    if (!soil_moisture || !leaf_status) {
      return res.status(400).json(error('非跳过记录必须填写土壤湿度和叶片状态'));
    }

    const stmt = db.prepare(`
      INSERT INTO water_records (plant_id, employee_id, record_date, soil_moisture, leaf_status, water_amount, rotated, skipped, skip_reason, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      plant_id, employee_id, dateStr,
      soil_moisture,
      leaf_status,
      water_amount || null,
      rotated ? 1 : 0,
      0,
      null,
      notes || null
    );

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    db.prepare('UPDATE plants SET last_watered_at = ?, updated_at = ? WHERE id = ?').run(dateStr, now, plant_id);

    const record = db.prepare(`
      SELECT wr.*, p.name as plant_name, e.name as employee_name
      FROM water_records wr
      JOIN plants p ON wr.plant_id = p.id
      JOIN employees e ON wr.employee_id = e.id
      WHERE wr.id = ?
    `).get(result.lastInsertRowid);

    res.json(success(record, '记录成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/plant/:plantId', (req, res) => {
  try {
    const { plantId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const countStmt = db.prepare('SELECT COUNT(*) as total FROM water_records WHERE plant_id = ?');
    const { total } = countStmt.get(plantId);

    const offset = (page - 1) * pageSize;
    const listStmt = db.prepare(`
      SELECT wr.*, e.name as employee_name
      FROM water_records wr
      JOIN employees e ON wr.employee_id = e.id
      WHERE wr.plant_id = ?
      ORDER BY wr.record_date DESC, wr.id DESC
      LIMIT ? OFFSET ?
    `);
    const list = listStmt.all(plantId, pageSize, offset);

    res.json(success({
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
