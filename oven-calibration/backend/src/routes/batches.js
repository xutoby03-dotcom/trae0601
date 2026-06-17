const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { success, pagination, mapRowToNested } = require('../utils/response');

const router = express.Router();

const VALID_RESULTS = ['success', 'failed'];

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `batch_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function addPhotoUrl(batch) {
  if (batch && batch.photo_path) {
    const filename = path.basename(batch.photo_path);
    batch.photo_url = `/uploads/${filename}`;
  } else if (batch) {
    batch.photo_url = null;
  }
  return batch;
}

router.get('/', (req, res, next) => {
  try {
    const { page = 1, page_size = 10, recipe_id, oven_id, result, start_date, end_date } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    const whereClauses = [];
    const params = [];

    if (recipe_id) {
      whereClauses.push('b.recipe_id = ?');
      params.push(recipe_id);
    }
    if (oven_id) {
      whereClauses.push('b.oven_id = ?');
      params.push(oven_id);
    }
    if (result && VALID_RESULTS.includes(result)) {
      whereClauses.push('b.result = ?');
      params.push(result);
    }
    if (start_date) {
      whereClauses.push('b.produced_at >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereClauses.push('b.produced_at <= ?');
      params.push(end_date);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countStmt = db.prepare(
      `SELECT COUNT(*) as total FROM batches b ${whereClause}`
    );
    const { total } = countStmt.get(...params);

    const listStmt = db.prepare(`
      SELECT 
        b.id,
        b.recipe_id,
        b.oven_id,
        b.layer_used,
        b.actual_temp,
        b.result,
        b.failure_reason,
        b.photo_path,
        b.produced_at,
        b.created_at,
        r.name AS recipe_name,
        o.model AS oven_model
      FROM batches b
      LEFT JOIN recipes r ON b.recipe_id = r.id
      LEFT JOIN ovens o ON b.oven_id = o.id
      ${whereClause}
      ORDER BY b.produced_at DESC
      LIMIT ? OFFSET ?
    `);

    const list = listStmt.all(...params, pageSizeNum, offset).map(addPhotoUrl);

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
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
        data: null,
        message: '烤箱不存在',
      });
    }

    const countStmt = db.prepare(
      'SELECT COUNT(*) as total FROM batches WHERE oven_id = ?'
    );
    const { total } = countStmt.get(oven_id);

    const listStmt = db.prepare(`
      SELECT 
        b.id,
        b.recipe_id,
        b.oven_id,
        b.layer_used,
        b.actual_temp,
        b.result,
        b.failure_reason,
        b.photo_path,
        b.produced_at,
        b.created_at,
        r.name AS recipe_name,
        o.model AS oven_model
      FROM batches b
      LEFT JOIN recipes r ON b.recipe_id = r.id
      LEFT JOIN ovens o ON b.oven_id = o.id
      WHERE b.oven_id = ?
      ORDER BY b.produced_at DESC
      LIMIT ? OFFSET ?
    `);

    const list = listStmt.all(oven_id, pageSizeNum, offset).map(addPhotoUrl);

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const batchStmt = db.prepare(`
      SELECT 
        b.id,
        b.recipe_id,
        b.oven_id,
        b.layer_used,
        b.actual_temp,
        b.result,
        b.failure_reason,
        b.photo_path,
        b.produced_at,
        b.created_at,
        r.name AS recipe_name,
        r.temp_compensation AS recipe_temp_compensation,
        o.model AS oven_model,
        o.serial_number AS oven_serial_number
      FROM batches b
      LEFT JOIN recipes r ON b.recipe_id = r.id
      LEFT JOIN ovens o ON b.oven_id = o.id
      WHERE b.id = ?
    `);
    const batch = batchStmt.get(id);

    if (!batch) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '批次不存在',
      });
    }

    addPhotoUrl(batch);

    res.json(success(batch));
  } catch (err) {
    next(err);
  }
});

router.post('/', upload.single('photo'), (req, res, next) => {
  try {
    const {
      recipe_id,
      oven_id,
      layer_used,
      actual_temp,
      result,
      failure_reason,
      produced_at,
    } = req.body;

    if (!recipe_id) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '配方ID不能为空',
      });
    }

    if (!oven_id) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '烤箱ID不能为空',
      });
    }

    if (!layer_used && layer_used !== 0) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '使用层数不能为空',
      });
    }

    if (!result || !VALID_RESULTS.includes(result)) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '结果必须是 success 或 failed',
      });
    }

    if (result === 'failed' && (!failure_reason || !failure_reason.trim())) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '失败批次必须填写失败原因',
      });
    }

    const recipeCheck = db.prepare('SELECT id FROM recipes WHERE id = ?').get(recipe_id);
    if (!recipeCheck) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '配方不存在',
      });
    }

    const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(oven_id);
    if (!ovenCheck) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '烤箱不存在',
      });
    }

    const photo_path = req.file ? req.file.filename : null;

    const stmt = db.prepare(`
      INSERT INTO batches (
        recipe_id, oven_id, layer_used, actual_temp, result, failure_reason, photo_path, produced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      recipe_id,
      oven_id,
      layer_used,
      actual_temp || null,
      result,
      result === 'failed' ? failure_reason.trim() : null,
      photo_path,
      produced_at || null
    );

    const selectStmt = db.prepare(`
      SELECT id, recipe_id, oven_id, layer_used, actual_temp, result, failure_reason,
             photo_path, produced_at, created_at
      FROM batches WHERE id = ?
    `);
    const batch = selectStmt.get(info.lastInsertRowid);
    addPhotoUrl(batch);

    res.status(201).json(success(batch, '创建成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', upload.single('photo'), (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      recipe_id,
      oven_id,
      layer_used,
      actual_temp,
      result,
      failure_reason,
      produced_at,
    } = req.body;

    const checkStmt = db.prepare('SELECT id, photo_path FROM batches WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '批次不存在',
      });
    }

    if (result !== undefined && !VALID_RESULTS.includes(result)) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '结果必须是 success 或 failed',
      });
    }

    if (recipe_id !== undefined) {
      const recipeCheck = db.prepare('SELECT id FROM recipes WHERE id = ?').get(recipe_id);
      if (!recipeCheck) {
        return res.status(400).json({
          code: -1,
          data: null,
          message: '配方不存在',
        });
      }
    }

    if (oven_id !== undefined) {
      const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(oven_id);
      if (!ovenCheck) {
        return res.status(400).json({
          code: -1,
          data: null,
          message: '烤箱不存在',
        });
      }
    }

    const updateFields = [];
    const updateParams = [];

    if (recipe_id !== undefined) {
      updateFields.push('recipe_id = ?');
      updateParams.push(recipe_id);
    }
    if (oven_id !== undefined) {
      updateFields.push('oven_id = ?');
      updateParams.push(oven_id);
    }
    if (layer_used !== undefined) {
      updateFields.push('layer_used = ?');
      updateParams.push(layer_used);
    }
    if (actual_temp !== undefined) {
      updateFields.push('actual_temp = ?');
      updateParams.push(actual_temp || null);
    }
    if (result !== undefined) {
      updateFields.push('result = ?');
      updateParams.push(result);
    }
    if (failure_reason !== undefined) {
      updateFields.push('failure_reason = ?');
      updateParams.push(failure_reason ? failure_reason.trim() : null);
    }
    if (produced_at !== undefined) {
      updateFields.push('produced_at = ?');
      updateParams.push(produced_at || null);
    }

    if (req.file) {
      if (checkStmt.photo_path) {
        const oldPhotoPath = path.join(uploadsDir, checkStmt.photo_path);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateFields.push('photo_path = ?');
      updateParams.push(req.file.filename);
    }

    const stmt = db.prepare(
      `UPDATE batches SET ${updateFields.join(', ')} WHERE id = ?`
    );
    stmt.run(...updateParams, id);

    const selectStmt = db.prepare(`
      SELECT id, recipe_id, oven_id, layer_used, actual_temp, result, failure_reason,
             photo_path, produced_at, created_at
      FROM batches WHERE id = ?
    `);
    const batch = selectStmt.get(id);
    addPhotoUrl(batch);

    res.json(success(batch, '更新成功'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id, photo_path FROM batches WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '批次不存在',
      });
    }

    if (checkStmt.photo_path) {
      const photoPath = path.join(uploadsDir, checkStmt.photo_path);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    const stmt = db.prepare('DELETE FROM batches WHERE id = ?');
    stmt.run(id);

    res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
