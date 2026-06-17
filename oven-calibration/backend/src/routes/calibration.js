const express = require('express');
const db = require('../database');
const { success, pagination, mapRowToNested } = require('../utils/response');

const router = express.Router();

function generateTempSuggestion(deviation, topHeat, bottomHeat) {
  const suggestions = [];
  const absDeviation = Math.abs(deviation);

  if (topHeat !== undefined && topHeat !== null && bottomHeat !== undefined && bottomHeat !== null) {
    const topBottomDiff = topHeat - bottomHeat;
    const absTopBottomDiff = Math.abs(topBottomDiff);
    if (absTopBottomDiff > 10) {
      if (topBottomDiff > 0) {
        suggestions.push(`上火偏高${topBottomDiff}度，建议降低上火${topBottomDiff}度`);
      } else {
        suggestions.push(`下火偏高${absTopBottomDiff}度，建议降低下火${absTopBottomDiff}度`);
      }
    }
  }

  if (absDeviation > 10) {
    if (deviation < 0) {
      suggestions.push(`实际比设定低${absDeviation}度，建议设定温度增加${absDeviation}度`);
    } else {
      suggestions.push(`实际比设定高${absDeviation}度，建议设定温度降低${absDeviation}度`);
    }
  }

  if (suggestions.length === 0) {
    return '温度正常，无需调整';
  }

  return suggestions.join('；');
}

router.get('/', (req, res, next) => {
  try {
    const { page = 1, page_size = 10, oven_id, layer_number, start_date, end_date } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    const whereConditions = [];
    const params = [];

    if (oven_id) {
      whereConditions.push('cr.oven_id = ?');
      params.push(parseInt(oven_id));
    }

    if (layer_number) {
      whereConditions.push('cr.layer_number = ?');
      params.push(parseInt(layer_number));
    }

    if (start_date) {
      whereConditions.push('cr.calibrated_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push('cr.calibrated_at <= ?');
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM calibration_records cr ${whereClause}`
    );
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.employee_id,
        cr.calibrated_at,
        cr.notes,
        cr.created_at,
        o.model AS oven_model,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN ovens o ON cr.oven_id = o.id
      LEFT JOIN employees e ON cr.employee_id = e.id
      ${whereClause}
      ORDER BY cr.calibrated_at DESC
      LIMIT ? OFFSET ?
    `);

    const list = listStmt.all(...params, pageSizeNum, offset);

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.employee_id,
        cr.calibrated_at,
        cr.notes,
        cr.created_at,
        o.model AS oven_model,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN ovens o ON cr.oven_id = o.id
      LEFT JOIN employees e ON cr.employee_id = e.id
      WHERE cr.id = ?
    `);

    const record = stmt.get(id);

    if (!record) {
      return res.status(404).json({
        code: -1,
        message: '校准记录不存在',
      });
    }

    res.json(success(record));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const {
      oven_id,
      layer_number,
      set_temp,
      actual_temp,
      top_heat,
      bottom_heat,
      preheat_minutes,
      test_point,
      employee_id,
      calibrated_at,
      notes,
    } = req.body;

    if (!oven_id) {
      return res.status(400).json({
        code: -1,
        message: '烤箱ID不能为空',
      });
    }

    if (!layer_number) {
      return res.status(400).json({
        code: -1,
        message: '层号不能为空',
      });
    }

    if (set_temp === undefined || set_temp === null) {
      return res.status(400).json({
        code: -1,
        message: '设定温度不能为空',
      });
    }

    if (actual_temp === undefined || actual_temp === null) {
      return res.status(400).json({
        code: -1,
        message: '实际温度不能为空',
      });
    }

    if (top_heat === undefined || top_heat === null) {
      return res.status(400).json({
        code: -1,
        message: '上火温度不能为空',
      });
    }

    if (bottom_heat === undefined || bottom_heat === null) {
      return res.status(400).json({
        code: -1,
        message: '下火温度不能为空',
      });
    }

    if (!preheat_minutes) {
      return res.status(400).json({
        code: -1,
        message: '预热时间不能为空',
      });
    }

    if (!test_point || !test_point.trim()) {
      return res.status(400).json({
        code: -1,
        message: '测试点不能为空',
      });
    }

    if (!employee_id) {
      return res.status(400).json({
        code: -1,
        message: '员工ID不能为空',
      });
    }

    if (!calibrated_at) {
      return res.status(400).json({
        code: -1,
        message: '校准时间不能为空',
      });
    }

    const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(oven_id);
    if (!ovenCheck) {
      return res.status(400).json({
        code: -1,
        message: '烤箱不存在',
      });
    }

    const empCheck = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
    if (!empCheck) {
      return res.status(400).json({
        code: -1,
        message: '员工不存在',
      });
    }

    const deviation = actual_temp - set_temp;
    const temp_suggestion = generateTempSuggestion(deviation, top_heat, bottom_heat);

    const insertStmt = db.prepare(`
      INSERT INTO calibration_records (
        oven_id, layer_number, set_temp, actual_temp, top_heat, bottom_heat,
        preheat_minutes, test_point, deviation, temp_suggestion, employee_id,
        calibrated_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = insertStmt.run(
      oven_id,
      layer_number,
      set_temp,
      actual_temp,
      top_heat,
      bottom_heat,
      preheat_minutes,
      test_point.trim(),
      deviation,
      temp_suggestion,
      employee_id,
      calibrated_at,
      notes || null
    );

    const selectStmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.employee_id,
        cr.calibrated_at,
        cr.notes,
        cr.created_at,
        o.model AS oven_model,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN ovens o ON cr.oven_id = o.id
      LEFT JOIN employees e ON cr.employee_id = e.id
      WHERE cr.id = ?
    `);

    const record = selectStmt.get(info.lastInsertRowid);

    res.status(201).json(success(record, '创建成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      oven_id,
      layer_number,
      set_temp,
      actual_temp,
      top_heat,
      bottom_heat,
      preheat_minutes,
      test_point,
      employee_id,
      calibrated_at,
      notes,
    } = req.body;

    const checkStmt = db.prepare('SELECT id FROM calibration_records WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        message: '校准记录不存在',
      });
    }

    const currentStmt = db.prepare(`
      SELECT oven_id, layer_number, set_temp, actual_temp, top_heat, bottom_heat,
             preheat_minutes, test_point, employee_id, calibrated_at, notes
      FROM calibration_records WHERE id = ?
    `);
    const current = currentStmt.get(id);

    const newOvenId = oven_id !== undefined ? oven_id : current.oven_id;
    const newLayerNumber = layer_number !== undefined ? layer_number : current.layer_number;
    const newSetTemp = set_temp !== undefined ? set_temp : current.set_temp;
    const newActualTemp = actual_temp !== undefined ? actual_temp : current.actual_temp;
    const newTopHeat = top_heat !== undefined ? top_heat : current.top_heat;
    const newBottomHeat = bottom_heat !== undefined ? bottom_heat : current.bottom_heat;
    const newPreheatMinutes = preheat_minutes !== undefined ? preheat_minutes : current.preheat_minutes;
    const newTestPoint = test_point !== undefined ? test_point.trim() : current.test_point;
    const newEmployeeId = employee_id !== undefined ? employee_id : current.employee_id;
    const newCalibratedAt = calibrated_at !== undefined ? calibrated_at : current.calibrated_at;
    const newNotes = notes !== undefined ? (notes || null) : current.notes;

    if (oven_id !== undefined) {
      const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(newOvenId);
      if (!ovenCheck) {
        return res.status(400).json({
          code: -1,
          message: '烤箱不存在',
        });
      }
    }

    if (employee_id !== undefined) {
      const empCheck = db.prepare('SELECT id FROM employees WHERE id = ?').get(newEmployeeId);
      if (!empCheck) {
        return res.status(400).json({
          code: -1,
          message: '员工不存在',
        });
      }
    }

    const deviation = newActualTemp - newSetTemp;
    const temp_suggestion = generateTempSuggestion(deviation, newTopHeat, newBottomHeat);

    const updateStmt = db.prepare(`
      UPDATE calibration_records SET
        oven_id = ?,
        layer_number = ?,
        set_temp = ?,
        actual_temp = ?,
        top_heat = ?,
        bottom_heat = ?,
        preheat_minutes = ?,
        test_point = ?,
        deviation = ?,
        temp_suggestion = ?,
        employee_id = ?,
        calibrated_at = ?,
        notes = ?
      WHERE id = ?
    `);

    updateStmt.run(
      newOvenId,
      newLayerNumber,
      newSetTemp,
      newActualTemp,
      newTopHeat,
      newBottomHeat,
      newPreheatMinutes,
      newTestPoint,
      deviation,
      temp_suggestion,
      newEmployeeId,
      newCalibratedAt,
      newNotes,
      id
    );

    const selectStmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.employee_id,
        cr.calibrated_at,
        cr.notes,
        cr.created_at,
        o.model AS oven_model,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN ovens o ON cr.oven_id = o.id
      LEFT JOIN employees e ON cr.employee_id = e.id
      WHERE cr.id = ?
    `);

    const record = selectStmt.get(id);

    res.json(success(record, '更新成功'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM calibration_records WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        message: '校准记录不存在',
      });
    }

    const stmt = db.prepare('DELETE FROM calibration_records WHERE id = ?');
    stmt.run(id);

    res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
});

router.get('/oven/:oven_id', (req, res, next) => {
  try {
    const { oven_id } = req.params;
    const { page = 1, page_size = 10 } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(oven_id);
    if (!ovenCheck) {
      return res.status(404).json({
        code: -1,
        message: '烤箱不存在',
      });
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM calibration_records WHERE oven_id = ?`
    );
    const { total } = countStmt.get(oven_id);

    const listStmt = db.prepare(`
      SELECT 
        cr.id,
        cr.oven_id,
        cr.layer_number,
        cr.set_temp,
        cr.actual_temp,
        cr.top_heat,
        cr.bottom_heat,
        cr.preheat_minutes,
        cr.test_point,
        cr.deviation,
        cr.temp_suggestion,
        cr.employee_id,
        cr.calibrated_at,
        cr.notes,
        cr.created_at,
        o.model AS oven_model,
        e.name AS employee_name
      FROM calibration_records cr
      LEFT JOIN ovens o ON cr.oven_id = o.id
      LEFT JOIN employees e ON cr.employee_id = e.id
      WHERE cr.oven_id = ?
      ORDER BY cr.calibrated_at DESC
      LIMIT ? OFFSET ?
    `);

    const list = listStmt.all(oven_id, pageSizeNum, offset);

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
