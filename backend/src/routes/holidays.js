const express = require('express');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

router.get('/', (req, res) => {
  try {
    const { year } = req.query;
    const conditions = [];
    const params = [];

    if (year) {
      conditions.push('date LIKE ?');
      params.push(`${year}-%`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const list = db.prepare(`
      SELECT * FROM holidays ${whereSql} ORDER BY date ASC
    `).all(...params);

    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', (req, res) => {
  try {
    const { date, name } = req.body;

    if (!date || !name) {
      return res.status(400).json(error('缺少必要字段'));
    }

    const existing = db.prepare('SELECT * FROM holidays WHERE date = ?').get(date);
    if (existing) {
      return res.status(400).json(error('该日期已设置为节假日'));
    }

    const stmt = db.prepare(`
      INSERT INTO holidays (date, name) VALUES (?, ?)
    `);
    const result = stmt.run(date, name);

    const holiday = db.prepare('SELECT * FROM holidays WHERE id = ?').get(result.lastInsertRowid);
    res.json(success(holiday, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM holidays WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('节假日不存在'));
    }

    db.prepare('DELETE FROM holidays WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
