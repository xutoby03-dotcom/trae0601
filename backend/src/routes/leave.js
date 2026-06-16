const express = require('express');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

const findAutoSubstitute = (employeeId, leaveDate) => {
  const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
  if (!employee) return null;

  const teammates = db.prepare(`
    SELECT * FROM employees
    WHERE group_name = ? AND id != ? AND is_active = 1
    ORDER BY id ASC
  `).all(employee.group_name, employeeId);

  if (teammates.length === 0) return null;

  const approvedLeaves = db.prepare(`
    SELECT employee_id FROM leave_requests
    WHERE leave_date = ? AND status = 'approved'
  `).all(leaveDate).map(l => l.employee_id);

  const available = teammates.filter(t => !approvedLeaves.includes(t.id));
  return available.length > 0 ? available[0] : null;
};

router.get('/', (req, res) => {
  try {
    const { employee_id, status, leave_date, page = 1, pageSize = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (employee_id) {
      conditions.push('lr.employee_id = ?');
      params.push(employee_id);
    }
    if (status) {
      conditions.push('lr.status = ?');
      params.push(status);
    }
    if (leave_date) {
      conditions.push('lr.leave_date = ?');
      params.push(leave_date);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM leave_requests lr ${whereSql}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * pageSize;
    const listStmt = db.prepare(`
      SELECT lr.*,
        e.name as employee_name, e.group_name,
        s.name as substitute_employee_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees s ON lr.substitute_employee_id = s.id
      ${whereSql}
      ORDER BY lr.leave_date DESC, lr.id DESC
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
    const { employee_id, leave_date, substitute_employee_id, status = 'pending', notes } = req.body;

    if (!employee_id || !leave_date) {
      return res.status(400).json(error('缺少必要字段'));
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json(error('员工不存在'));
    }

    let finalSubstituteId = substitute_employee_id;

    if (!finalSubstituteId) {
      const autoSub = findAutoSubstitute(employee_id, leave_date);
      if (autoSub) {
        finalSubstituteId = autoSub.id;
      }
    } else {
      const sub = db.prepare('SELECT * FROM employees WHERE id = ?').get(finalSubstituteId);
      if (!sub) {
        return res.status(404).json(error('替代员工不存在'));
      }
    }

    const existing = db.prepare(`
      SELECT * FROM leave_requests WHERE employee_id = ? AND leave_date = ?
    `).get(employee_id, leave_date);

    if (existing) {
      return res.status(400).json(error('该员工该日期已有请假记录'));
    }

    const stmt = db.prepare(`
      INSERT INTO leave_requests (employee_id, leave_date, substitute_employee_id, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(employee_id, leave_date, finalSubstituteId || null, status, notes || null);

    const leave = db.prepare(`
      SELECT lr.*,
        e.name as employee_name, e.group_name,
        s.name as substitute_employee_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees s ON lr.substitute_employee_id = s.id
      WHERE lr.id = ?
    `).get(result.lastInsertRowid);

    res.json(success(leave, '提交成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { leave_date, substitute_employee_id, status, notes } = req.body;

    const existing = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('请假记录不存在'));
    }

    let finalSubstituteId = substitute_employee_id;

    if (substitute_employee_id === undefined && existing.substitute_employee_id) {
      finalSubstituteId = existing.substitute_employee_id;
    }

    if (substitute_employee_id !== null && substitute_employee_id !== undefined) {
      const sub = db.prepare('SELECT * FROM employees WHERE id = ?').get(finalSubstituteId);
      if (!sub) {
        return res.status(404).json(error('替代员工不存在'));
      }
    }

    const stmt = db.prepare(`
      UPDATE leave_requests SET
        leave_date = ?, substitute_employee_id = ?, status = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run(
      leave_date || existing.leave_date,
      finalSubstituteId !== undefined ? finalSubstituteId : existing.substitute_employee_id,
      status || existing.status,
      notes != null ? notes : existing.notes,
      id
    );

    const leave = db.prepare(`
      SELECT lr.*,
        e.name as employee_name, e.group_name,
        s.name as substitute_employee_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees s ON lr.substitute_employee_id = s.id
      WHERE lr.id = ?
    `).get(id);

    res.json(success(leave, '更新成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('请假记录不存在'));
    }

    db.prepare('DELETE FROM leave_requests WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/auto-substitute/:employeeId/:date', (req, res) => {
  try {
    const { employeeId, date } = req.params;

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    if (!employee) {
      return res.status(404).json(error('员工不存在'));
    }

    const substitute = findAutoSubstitute(employeeId, date);

    if (!substitute) {
      return res.json(success(null, '未找到合适的替代人'));
    }

    res.json(success(substitute, '找到替代人'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
