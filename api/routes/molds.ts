import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { Mold, MoldType, MoldMaterial, MoldStatus } from '../../shared/types.js';

const router = Router();

function rowToMold(row: any): Mold {
  return {
    id: row.id,
    name: row.name,
    type: row.type as MoldType,
    size: row.size,
    material: row.material as MoldMaterial,
    quantity: row.quantity,
    availableQuantity: row.available_quantity,
    applicableProducts: row.applicable_products ? row.applicable_products.split('、') : [],
    purchaseDate: row.purchase_date,
    photoUrl: row.photo_url,
    status: row.status as MoldStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    remark: row.remark,
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { type, size, material, status } = req.query;

    let sql = 'SELECT * FROM molds WHERE 1=1';
    const params: any[] = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (size) {
      sql += ' AND size LIKE ?';
      params.push(`%${size}%`);
    }
    if (material) {
      sql += ' AND material = ?';
      params.push(material);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];
    const molds = rows.map(rowToMold);
    res.json(molds);
  } catch (error) {
    console.error('Get molds error:', error);
    res.status(500).json({ error: '获取模具列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM molds WHERE id = ?').get(req.params.id) as any;

    if (!row) {
      return res.status(404).json({ error: '模具不存在' });
    }

    res.json(rowToMold(row));
  } catch (error) {
    console.error('Get mold error:', error);
    res.status(500).json({ error: '获取模具信息失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, size, material, quantity, applicableProducts, purchaseDate, photoUrl, remark } = req.body;

    if (!name || !type || !size || !material) {
      return res.status(400).json({ error: '名称、类型、尺寸、材质不能为空' });
    }

    const db = getDb();
    const id = uuidv4();
    const applicableProductsStr = Array.isArray(applicableProducts) ? applicableProducts.join('、') : '';

    db.prepare(
      `INSERT INTO molds (
        id, name, type, size, material, quantity, available_quantity,
        applicable_products, purchase_date, photo_url, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, name, type, size, material,
      quantity || 1, quantity || 1,
      applicableProductsStr, purchaseDate || '', photoUrl || '', remark || ''
    );

    const row = db.prepare('SELECT * FROM molds WHERE id = ?').get(id) as any;
    res.status(201).json(rowToMold(row));
  } catch (error) {
    console.error('Create mold error:', error);
    res.status(500).json({ error: '创建模具失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, type, size, material, quantity, applicableProducts, purchaseDate, photoUrl, status, remark } = req.body;
    const { id } = req.params;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM molds WHERE id = ?').get(id) as any;

    if (!existing) {
      return res.status(404).json({ error: '模具不存在' });
    }

    const applicableProductsStr = Array.isArray(applicableProducts)
      ? applicableProducts.join('、')
      : existing.applicable_products;

    db.prepare(
      `UPDATE molds SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        size = COALESCE(?, size),
        material = COALESCE(?, material),
        quantity = COALESCE(?, quantity),
        applicable_products = COALESCE(?, applicable_products),
        purchase_date = COALESCE(?, purchase_date),
        photo_url = COALESCE(?, photo_url),
        status = COALESCE(?, status),
        remark = COALESCE(?, remark),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(
      name ?? null, type ?? null, size ?? null, material ?? null,
      quantity ?? null, applicableProductsStr ?? null, purchaseDate ?? null,
      photoUrl ?? null, status ?? null, remark ?? null, id
    );

    const row = db.prepare('SELECT * FROM molds WHERE id = ?').get(id) as any;
    res.json(rowToMold(row));
  } catch (error) {
    console.error('Update mold error:', error);
    res.status(500).json({ error: '更新模具信息失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM molds WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: '模具不存在' });
    }

    const borrowCount = db.prepare(
      'SELECT COUNT(*) as count FROM borrow_records WHERE mold_id = ? AND status IN (?, ?, ?)'
    ).get(id, 'borrowed', 'overdue', 'exception') as any;

    if (borrowCount.count > 0) {
      return res.status(400).json({ error: '该模具存在未归还的借用记录，无法删除' });
    }

    db.prepare('DELETE FROM molds WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete mold error:', error);
    res.status(500).json({ error: '删除模具失败' });
  }
});

export default router;
