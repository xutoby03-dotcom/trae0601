const express = require('express');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

router.get('/', (req, res) => {
  try {
    const { group_name } = req.query;
    const conditions = [];
    const params = [];

    if (group_name) {
      conditions.push('group_name = ?');
      params.push(group_name);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const stmt = db.prepare(`SELECT * FROM employees ${whereSql} ORDER BY id ASC`);
    const list = stmt.all(...params);

    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json(error('员工不存在'));
    }
    res.json(success(employee));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', (req, res) => {
  try {
    const { name, group_name, email, is_active = 1 } = req.body;

    if (!name || !group_name) {
      return res.status(400).json(error('缺少必要字段'));
    }

    const stmt = db.prepare(`
      INSERT INTO employees (name, group_name, email, is_active)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name, group_name, email || null, is_active);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.json(success(employee, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, group_name, email, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('员工不存在'));
    }

    const stmt = db.prepare(`
      UPDATE employees SET
        name = ?, group_name = ?, email = ?, is_active = ?
      WHERE id = ?
    `);
    stmt.run(
      name || existing.name,
      group_name || existing.group_name,
      email != null ? email : existing.email,
      is_active != null ? is_active : existing.is_active,
      id
    );

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json(success(employee, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('员工不存在'));
    }

    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
