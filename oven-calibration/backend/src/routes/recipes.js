const express = require('express');
const db = require('../database');
const { success, error, pagination, mapRowToNested } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const { page = 1, page_size = 10 } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    const countStmt = db.prepare('SELECT COUNT(*) as total FROM recipes');
    const { total } = countStmt.get();

    const listStmt = db.prepare(`
      SELECT 
        r.id,
        r.name,
        r.recommended_oven_id,
        r.recommended_layer,
        r.temp_compensation,
        r.description,
        r.created_at,
        r.updated_at,
        o.id AS oven_id_,
        o.model AS oven_model,
        o.serial_number AS oven_serial_number,
        o.status AS oven_status
      FROM recipes r
      LEFT JOIN ovens o ON r.recommended_oven_id = o.id
      ORDER BY r.id DESC
      LIMIT ? OFFSET ?
    `);

    const rawList = listStmt.all(pageSizeNum, offset);
    const list = rawList.map(row => {
      const result = mapRowToNested(row, ['oven']);
      if (result.oven && result.oven.id === null) {
        result.oven = null;
      }
      return result;
    });

    res.json(success(pagination(list, total, pageNum, pageSizeNum)));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const recipeStmt = db.prepare(`
      SELECT 
        r.id,
        r.name,
        r.recommended_oven_id,
        r.recommended_layer,
        r.temp_compensation,
        r.description,
        r.created_at,
        r.updated_at,
        o.id AS oven_id_,
        o.model AS oven_model,
        o.serial_number AS oven_serial_number,
        o.total_layers AS oven_total_layers,
        o.probe_position AS oven_probe_position,
        o.common_temp_zone_low AS oven_common_temp_zone_low,
        o.common_temp_zone_high AS oven_common_temp_zone_high,
        o.status AS oven_status
      FROM recipes r
      LEFT JOIN ovens o ON r.recommended_oven_id = o.id
      WHERE r.id = ?
    `);
    const rawRecipe = recipeStmt.get(id);

    if (!rawRecipe) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '配方不存在',
      });
    }

    const recipe = mapRowToNested(rawRecipe, ['oven']);
    if (recipe.oven && recipe.oven.id === null) {
      recipe.oven = null;
    }

    const batchesStmt = db.prepare(`
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
        o.model AS oven_model,
        r.name AS recipe_name
      FROM batches b
      LEFT JOIN ovens o ON b.oven_id = o.id
      LEFT JOIN recipes r ON b.recipe_id = r.id
      WHERE b.recipe_id = ?
      ORDER BY b.produced_at DESC
      LIMIT 20
    `);
    const recent_batches = batchesStmt.all(id).map(batch => ({
      ...batch,
      photo_url: batch.photo_path ? `/uploads/${batch.photo_path}` : null,
    }));

    const failedCountStmt = db.prepare(`
      SELECT COUNT(*) as failed_count
      FROM batches
      WHERE recipe_id = ? AND result = 'failed'
    `);
    const { failed_count } = failedCountStmt.get(id);

    const result = {
      ...recipe,
      recent_batches,
      failed_batches_count: failed_count,
    };

    res.json(success(result));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const {
      name,
      recommended_oven_id,
      recommended_layer,
      temp_compensation = 0,
      description,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '配方名称不能为空',
      });
    }

    if (temp_compensation === undefined || temp_compensation === null) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '温度补偿值不能为空',
      });
    }

    if (recommended_oven_id) {
      const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(recommended_oven_id);
      if (!ovenCheck) {
        return res.status(400).json({
          code: -1,
          data: null,
          message: '推荐烤箱不存在',
        });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO recipes (
        name, recommended_oven_id, recommended_layer, temp_compensation, description
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name.trim(),
      recommended_oven_id || null,
      recommended_layer || null,
      temp_compensation,
      description || null
    );

    const selectStmt = db.prepare(`
      SELECT id, name, recommended_oven_id, recommended_layer, temp_compensation, description,
             created_at, updated_at
      FROM recipes WHERE id = ?
    `);
    const recipe = selectStmt.get(info.lastInsertRowid);

    res.status(201).json(success(recipe, '创建成功'));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      recommended_oven_id,
      recommended_layer,
      temp_compensation,
      description,
    } = req.body;

    const checkStmt = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '配方不存在',
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '配方名称不能为空',
      });
    }

    if (recommended_oven_id !== undefined && recommended_oven_id !== null) {
      const ovenCheck = db.prepare('SELECT id FROM ovens WHERE id = ?').get(recommended_oven_id);
      if (!ovenCheck) {
        return res.status(400).json({
          code: -1,
          data: null,
          message: '推荐烤箱不存在',
        });
      }
    }

    const updateFields = [];
    const updateParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateParams.push(name.trim());
    }
    if (recommended_oven_id !== undefined) {
      updateFields.push('recommended_oven_id = ?');
      updateParams.push(recommended_oven_id || null);
    }
    if (recommended_layer !== undefined) {
      updateFields.push('recommended_layer = ?');
      updateParams.push(recommended_layer || null);
    }
    if (temp_compensation !== undefined) {
      updateFields.push('temp_compensation = ?');
      updateParams.push(temp_compensation);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description || null);
    }

    updateFields.push('updated_at = datetime(\'now\')');
    updateParams.push(id);

    const stmt = db.prepare(
      `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ?`
    );
    stmt.run(...updateParams);

    const selectStmt = db.prepare(`
      SELECT id, name, recommended_oven_id, recommended_layer, temp_compensation, description,
             created_at, updated_at
      FROM recipes WHERE id = ?
    `);
    const recipe = selectStmt.get(id);

    res.json(success(recipe, '更新成功'));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT id FROM recipes WHERE id = ?').get(id);
    if (!checkStmt) {
      return res.status(404).json({
        code: -1,
        data: null,
        message: '配方不存在',
      });
    }

    const batchCheckStmt = db.prepare('SELECT COUNT(*) as count FROM batches WHERE recipe_id = ?').get(id);
    if (batchCheckStmt.count > 0) {
      return res.status(400).json({
        code: -1,
        data: null,
        message: '该配方有关联的批次记录，无法删除',
      });
    }

    const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
    stmt.run(id);

    res.json(success(null, '删除成功'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
