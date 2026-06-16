const express = require('express');
const dayjs = require('dayjs');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

const isHoliday = (dateStr) => {
  const holiday = db.prepare('SELECT * FROM holidays WHERE date = ?').get(dateStr);
  return !!holiday;
};

const getSubstituteEmployee = (employeeId, dateStr) => {
  const leave = db.prepare(`
    SELECT * FROM leave_requests
    WHERE employee_id = ? AND leave_date = ? AND status = 'approved'
  `).get(employeeId, dateStr);

  if (!leave) {
    return null;
  }

  if (leave.substitute_employee_id) {
    return db.prepare('SELECT * FROM employees WHERE id = ?').get(leave.substitute_employee_id);
  }

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
  `).all(dateStr).map(l => l.employee_id);

  const available = teammates.filter(t => !approvedLeaves.includes(t.id));
  return available.length > 0 ? available[0] : null;
};

router.get('/schedule', (req, res) => {
  try {
    const { plant_id, weekday } = req.query;
    const conditions = [];
    const params = [];

    if (plant_id) {
      conditions.push('ds.plant_id = ?');
      params.push(plant_id);
    }
    if (weekday) {
      conditions.push('ds.weekday = ?');
      params.push(weekday);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const stmt = db.prepare(`
      SELECT ds.*, p.name as plant_name, e.name as employee_name, e.group_name
      FROM duty_schedule ds
      JOIN plants p ON ds.plant_id = p.id
      JOIN employees e ON ds.employee_id = e.id
      ${whereSql}
      ORDER BY ds.weekday ASC, ds.plant_id ASC
    `);
    const list = stmt.all(...params);

    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/today', (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const weekday = dayjs().day() === 0 ? 7 : dayjs().day();

    if (isHoliday(today)) {
      return res.json(success([], '今日节假日，无轮值任务'));
    }

    const schedules = db.prepare(`
      SELECT ds.*, p.name as plant_name, p.location, p.water_interval_days, p.last_watered_at,
             e.id as employee_id, e.name as employee_name, e.group_name
      FROM duty_schedule ds
      JOIN plants p ON ds.plant_id = p.id
      JOIN employees e ON ds.employee_id = e.id
      WHERE ds.weekday = ?
      ORDER BY ds.plant_id ASC
    `).all(weekday);

    const tasks = schedules.map(s => {
      const substitute = getSubstituteEmployee(s.employee_id, today);
      let finalEmployee = s.employee_name;
      let finalEmployeeId = s.employee_id;
      let hasSubstitute = false;

      if (substitute) {
        finalEmployee = substitute.name;
        finalEmployeeId = substitute.id;
        hasSubstitute = true;
      }

      const todayRecord = db.prepare(`
        SELECT * FROM water_records
        WHERE plant_id = ? AND record_date = ?
      `).get(s.plant_id, today);

      const isCompleted = !!todayRecord;

      return {
        id: s.id,
        plant_id: s.plant_id,
        plant_name: s.plant_name,
        location: s.location,
        employee_id: finalEmployeeId,
        employee_name: finalEmployee,
        group_name: s.group_name,
        weekday: s.weekday,
        has_substitute: hasSubstitute,
        original_employee_name: hasSubstitute ? s.employee_name : null,
        is_completed: isCompleted,
        water_record: todayRecord || null
      };
    });

    res.json(success(tasks));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/plants/:plantId', (req, res) => {
  try {
    const { plantId } = req.params;
    const list = db.prepare(`
      SELECT ds.*, e.name as employee_name, e.group_name
      FROM duty_schedule ds
      JOIN employees e ON ds.employee_id = e.id
      WHERE ds.plant_id = ?
      ORDER BY ds.weekday ASC
    `).all(plantId);

    res.json(success(list));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/schedule', (req, res) => {
  try {
    const { plant_id, employee_id, weekday } = req.body;

    if (!plant_id || !employee_id || !weekday) {
      return res.status(400).json(error('缺少必要字段'));
    }

    if (weekday < 1 || weekday > 7) {
      return res.status(400).json(error('weekday 必须在 1-7 之间'));
    }

    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(plant_id);
    if (!plant) {
      return res.status(404).json(error('植物不存在'));
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json(error('员工不存在'));
    }

    const existing = db.prepare(`
      SELECT * FROM duty_schedule WHERE plant_id = ? AND weekday = ?
    `).get(plant_id, weekday);

    if (existing) {
      return res.status(400).json(error('该植物该工作日已有轮值安排'));
    }

    const stmt = db.prepare(`
      INSERT INTO duty_schedule (plant_id, employee_id, weekday)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(plant_id, employee_id, weekday);

    const schedule = db.prepare(`
      SELECT ds.*, p.name as plant_name, e.name as employee_name
      FROM duty_schedule ds
      JOIN plants p ON ds.plant_id = p.id
      JOIN employees e ON ds.employee_id = e.id
      WHERE ds.id = ?
    `).get(result.lastInsertRowid);

    res.json(success(schedule, '创建成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/schedule/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM duty_schedule WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('轮值记录不存在'));
    }

    db.prepare('DELETE FROM duty_schedule WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.get('/upcoming-holiday-plants', (req, res) => {
  try {
    const today = dayjs();
    const todayStr = today.format('YYYY-MM-DD');

    const upcomingHoliday = db.prepare(`
      SELECT * FROM holidays
      WHERE date > ?
      ORDER BY date ASC
      LIMIT 1
    `).get(todayStr);

    if (!upcomingHoliday) {
      return res.json(success([], '暂无即将到来的节假日'));
    }

    const holidayDate = dayjs(upcomingHoliday.date);
    const daysUntilHoliday = holidayDate.diff(today, 'day');

    const plants = db.prepare(`
      SELECT p.*,
        julianday(?) - julianday(COALESCE(p.last_watered_at, p.created_at)) as days_since_water
      FROM plants p
      WHERE p.status != 'dead'
        AND (julianday(?) - julianday(COALESCE(p.last_watered_at, p.created_at))) >= p.water_interval_days
      ORDER BY days_since_water DESC
    `).all(upcomingHoliday.date, upcomingHoliday.date);

    res.json(success({
      holiday: upcomingHoliday,
      days_until_holiday: daysUntilHoliday,
      plants: plants
    }));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
