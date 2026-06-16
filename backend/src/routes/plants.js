const express = require('express');
const dayjs = require('dayjs');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

router.get('/', (req, res) => {
  try {
    const { location, group_name, status, page = 1, pageSize = 10 } = req.query;
    const conditions = [];
    const params = [];

    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }
    if (group_name) {
      conditions.push('group_name = ?');
      params.push(group_name);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM plants ${whereSql}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * pageSize;
    const listStmt = db.prepare(`
      SELECT * FROM plants ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?
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

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
    if (!plant) {
      return res.status(404).json(error('植物不存在'));
    }
    res.json(success(plant));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', (req, res) => {
  try {
    const { name, species, location, pot_size, sun_sensitivity = 'medium', group_name, status = 'healthy', water_interval_days = 7, notes } = req.body;

    if (!name || !species || !location || !pot_size || !group_name) {
      return res.status(400).json(error('缺少必要字段'));
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const stmt = db.prepare(`
      INSERT INTO plants (name, species, location, pot_size, sun_sensitivity, group_name, status, water_interval_days, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, species, location, pot_size, sun_sensitivity, group_name, status, water_interval_days, notes, now, now);

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(result.lastInsertRowid);
    res.json(success(plant, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, location, pot_size, sun_sensitivity, group_name, status, water_interval_days, notes } = req.body;

    const existing = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('植物不存在'));
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const stmt = db.prepare(`
      UPDATE plants SET
        name = ?, species = ?, location = ?, pot_size = ?, sun_sensitivity = ?,
        group_name = ?, status = ?, water_interval_days = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      name || existing.name,
      species || existing.species,
      location || existing.location,
      pot_size || existing.pot_size,
      sun_sensitivity || existing.sun_sensitivity,
      group_name || existing.group_name,
      status || existing.status,
      water_interval_days != null ? water_interval_days : existing.water_interval_days,
      notes != null ? notes : existing.notes,
      now,
      id
    );

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
    res.json(success(plant, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('植物不存在'));
    }

    db.prepare('DELETE FROM plants WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
