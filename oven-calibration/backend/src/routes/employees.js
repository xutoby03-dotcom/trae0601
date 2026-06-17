const express = require('express');
const db = require('../database');
const { success, pagination } = require('../utils/response');

const router = express.Router();

const VALID_ROLES = ['master', 'apprentice', 'manager'];

router.get('/', (req, res, next) => {
  try {
    const { page = 1, page_size = 10, role } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    let whereClause = '';
    const params = [];

    if (role && VALID_ROLES.includes(role)) {
      whereClause = 'WHERE role = ?';
      params.push(role);
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM employees ${whereClause}`
    );
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(
      `SELECT id, name, role, phone, created_at 
       FROM employees ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
    );
    const list = listStmt.all(...params, pageSizeNum, offset);

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(
      `SELECT id, name, role, phone, created_at 
       FROM employees WHERE id = ?`
    );
    const employee = stmt.get(id);

    if (!employee) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '员工不存在',
      });
    }

    res.json(success(employee));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { name, role, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '员工姓名不能为空',
      });
    }

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '角色必须是 master、apprentice 或 manager',
      });
    }

    const stmt = db.prepare(
      'INSERT INTO employees (name, role, phone) VALUES (?, ?, ?)'
    );
    const info = stmt.run(name.trim(), role, phone || null);

    const selectStmt = db.prepare(
      'SELECT id, name, role, phone, created_at FROM employees WHERE id = ?'
    );
    const employee = selectStmt.get(info.lastInsertRowid);

    res.status(201).json(success(employee, '创建成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, phone } = req.body;

    const checkStmt = db.prepare('SELECT id FROM employees WHERE id = ?');
    const exists = checkStmt.get(id);

    if (!exists) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '员工不存在',
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '员工姓名不能为空',
      });
    }

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '角色必须是 master、apprentice 或 manager',
      });
    }

    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(name.trim());
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateParams.push(role);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateParams.push(phone || null);
    }

    updateParams.push(id);

    const stmt = db.prepare(
      `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`
    );
    stmt.run(...updateParams);

    const selectStmt = db.prepare(
      'SELECT id, name, role, phone, created_at FROM employees WHERE id = ?'
    );
    const employee = selectStmt.get(id);

    res.json(success(employee, '更新成功'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM employees WHERE id = ?');
    const exists = checkStmt.get(id);

    if (!exists) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '员工不存在',
      });
    }

    const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
    stmt.run(id);

    res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
