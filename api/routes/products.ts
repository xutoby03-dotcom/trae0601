import { Router } from 'express';
import { db } from '../db.js';
import type { Product, ProductCreate, ProductAlerts } from '../../shared/types.js';

const router = Router();

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    spec: row.spec,
    flavor: row.flavor,
    costPrice: row.cost_price,
    salePrice: row.sale_price,
    expiryDate: row.expiry_date,
    shelfPosition: row.shelf_position,
    photo: row.photo,
    stock: row.stock,
    status: row.status,
    barcode: row.barcode,
    createdAt: row.created_at,
  };
}

function calculateStatusByExpiry(expiryDate: string | undefined | null, currentStatus: string): string {
  if (!expiryDate) return currentStatus;
  if (currentStatus === 'offline' || currentStatus === 'damaged') return currentStatus;
  const today = new Date().toISOString().split('T')[0];
  if (expiryDate < today) return 'expired';
  return currentStatus === 'expired' ? 'active' : currentStatus;
}

router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params) as any[];
  res.json(rows.map(mapProduct));
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  const query = `%${q || ''}%`;
  const rows = db.prepare(`
    SELECT * FROM products 
    WHERE status = 'active'
    AND (name LIKE ? OR barcode LIKE ? OR flavor LIKE ?)
    ORDER BY name
  `).all(query, query, query) as any[];
  res.json(rows.map(mapProduct));
});

router.get('/alerts', (req, res) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysStr = thirtyDaysLater.toISOString().split('T')[0];

  const lowStockRows = db.prepare(`
    SELECT * FROM products 
    WHERE status = 'active' AND stock < 5
    ORDER BY stock ASC
  `).all() as any[];

  const expiringRows = db.prepare(`
    SELECT * FROM products 
    WHERE status = 'active' 
    AND expiry_date >= ? 
    AND expiry_date <= ?
    ORDER BY expiry_date ASC
  `).all(todayStr, thirtyDaysStr) as any[];

  const expiredRows = db.prepare(`
    SELECT * FROM products 
    WHERE status = 'expired'
    ORDER BY expiry_date ASC
  `).all() as any[];

  const alerts: ProductAlerts = {
    lowStock: lowStockRows.map(mapProduct),
    expiring: expiringRows.map(mapProduct),
    expired: expiredRows.map(mapProduct),
  };

  res.json(alerts);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    return res.status(404).json({ error: '商品不存在' });
  }
  res.json(mapProduct(row));
});

router.post('/', (req, res) => {
  const data: ProductCreate = req.body;
  const initialStatus = calculateStatusByExpiry(data.expiryDate, 'active');
  const info = db.prepare(`
    INSERT INTO products (name, spec, flavor, cost_price, sale_price, expiry_date, shelf_position, photo, stock, barcode, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.name,
    data.spec,
    data.flavor,
    data.costPrice,
    data.salePrice,
    data.expiryDate,
    data.shelfPosition,
    data.photo,
    data.stock,
    data.barcode,
    initialStatus,
  );
  
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid) as any;
  res.status(201).json(mapProduct(row));
});

router.put('/:id', (req, res) => {
  const data: Partial<ProductCreate> = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    return res.status(404).json({ error: '商品不存在' });
  }

  let finalStatus: string | null = (req.body as any).status ?? null;
  const newExpiryDate = data.expiryDate ?? existing.expiry_date;
  const baseStatus = finalStatus ?? existing.status;

  if (!finalStatus || (finalStatus !== 'offline' && finalStatus !== 'damaged')) {
    finalStatus = calculateStatusByExpiry(newExpiryDate, baseStatus);
  }

  db.prepare(`
    UPDATE products 
    SET name = COALESCE(?, name),
        spec = COALESCE(?, spec),
        flavor = COALESCE(?, flavor),
        cost_price = COALESCE(?, cost_price),
        sale_price = COALESCE(?, sale_price),
        expiry_date = COALESCE(?, expiry_date),
        shelf_position = COALESCE(?, shelf_position),
        photo = COALESCE(?, photo),
        stock = COALESCE(?, stock),
        barcode = COALESCE(?, barcode),
        status = ?
    WHERE id = ?
  `).run(
    data.name ?? null,
    data.spec ?? null,
    data.flavor ?? null,
    data.costPrice ?? null,
    data.salePrice ?? null,
    data.expiryDate ?? null,
    data.shelfPosition ?? null,
    data.photo ?? null,
    data.stock ?? null,
    data.barcode ?? null,
    finalStatus,
    req.params.id,
  );

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  res.json(mapProduct(row));
});

router.post('/:id/restock', (req, res) => {
  const { quantity } = req.body;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    return res.status(404).json({ error: '商品不存在' });
  }

  db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, req.params.id);
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  res.json(mapProduct(row));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: '商品不存在' });
  }
  res.json({ success: true });
});

export default router;
