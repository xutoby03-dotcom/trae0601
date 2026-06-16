const express = require('express');
const dayjs = require('dayjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

const router = express.Router();

const success = (data, message = '') => ({ code: 0, data, message });
const error = (message) => ({ code: -1, message });

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `pest_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件'));
    }
  }
});

router.get('/', (req, res) => {
  try {
    const { plant_id, resolved, page = 1, pageSize = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (plant_id) {
      conditions.push('pr.plant_id = ?');
      params.push(plant_id);
    }
    if (resolved !== undefined) {
      conditions.push('pr.resolved = ?');
      params.push(resolved === 'true' || resolved === '1' ? 1 : 0);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM pest_reports pr ${whereSql}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * pageSize;
    const listStmt = db.prepare(`
      SELECT pr.*, p.name as plant_name, p.location, e.name as employee_name
      FROM pest_reports pr
      JOIN plants p ON pr.plant_id = p.id
      JOIN employees e ON pr.employee_id = e.id
      ${whereSql}
      ORDER BY pr.created_at DESC, pr.id DESC
      LIMIT ? OFFSET ?
    `);
    const list = listStmt.all(...params, pageSize, offset).map(item => ({
      ...item,
      photo_url: item.photo_path ? `/uploads/${item.photo_path}` : null
    }));

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
    const report = db.prepare(`
      SELECT pr.*, p.name as plant_name, p.location, e.name as employee_name
      FROM pest_reports pr
      JOIN plants p ON pr.plant_id = p.id
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.id = ?
    `).get(id);

    if (!report) {
      return res.status(404).json(error('上报记录不存在'));
    }

    report.photo_url = report.photo_path ? `/uploads/${report.photo_path}` : null;
    res.json(success(report));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.post('/', upload.single('photo'), (req, res) => {
  try {
    const { plant_id, employee_id, report_date, description, severity = 'low' } = req.body;

    if (!plant_id || !employee_id || !description) {
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

    const dateStr = report_date || dayjs().format('YYYY-MM-DD');
    const photoPath = req.file ? req.file.filename : null;

    const stmt = db.prepare(`
      INSERT INTO pest_reports (plant_id, employee_id, report_date, description, photo_path, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(plant_id, employee_id, dateStr, description, photoPath, severity);

    const report = db.prepare(`
      SELECT pr.*, p.name as plant_name, p.location, e.name as employee_name
      FROM pest_reports pr
      JOIN plants p ON pr.plant_id = p.id
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.id = ?
    `).get(result.lastInsertRowid);

    report.photo_url = report.photo_path ? `/uploads/${report.photo_path}` : null;

    res.json(success(report, '上报成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.put('/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const { resolved_notes } = req.body;

    const existing = db.prepare('SELECT * FROM pest_reports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('上报记录不存在'));
    }

    db.prepare(`
      UPDATE pest_reports SET resolved = 1, resolved_notes = ?
      WHERE id = ?
    `).run(resolved_notes || null, id);

    const report = db.prepare(`
      SELECT pr.*, p.name as plant_name, p.location, e.name as employee_name
      FROM pest_reports pr
      JOIN plants p ON pr.plant_id = p.id
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.id = ?
    `).get(id);

    report.photo_url = report.photo_path ? `/uploads/${report.photo_path}` : null;
    res.json(success(report, '已标记为已解决'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM pest_reports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json(error('上报记录不存在'));
    }

    if (existing.photo_path) {
      const photoFullPath = path.join(uploadsDir, existing.photo_path);
      if (fs.existsSync(photoFullPath)) {
        fs.unlinkSync(photoFullPath);
      }
    }

    db.prepare('DELETE FROM pest_reports WHERE id = ?').run(id);
    res.json(success(null, '删除成功'));
  } catch (err) {
    res.status(500).json(error(err.message));
  }
});

module.exports = router;
