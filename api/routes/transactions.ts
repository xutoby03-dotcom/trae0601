import { Router } from 'express';
import { db } from '../db.js';
import type { Transaction, TransactionCreate } from '../../shared/types.js';

const router = Router();

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    productId: row.product_id,
    employeeId: row.employee_id,
    departmentId: row.department_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalAmount: row.total_amount,
    paymentType: row.payment_type,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    remark: row.remark,
    product: row.product_name ? {
      id: row.product_id,
      name: row.product_name,
      spec: row.product_spec,
      flavor: row.product_flavor,
      costPrice: 0,
      salePrice: row.unit_price,
      expiryDate: '',
      shelfPosition: '',
      photo: row.product_photo,
      stock: 0,
      status: 'active',
      barcode: '',
      createdAt: '',
    } : undefined,
    employee: row.employee_name ? {
      id: row.employee_id,
      name: row.employee_name,
      departmentId: row.department_id,
    } : undefined,
  };
}

router.get('/', (req, res) => {
  const { employeeId, month } = req.query;
  let sql = `
    SELECT t.*, 
           p.name as product_name, p.spec as product_spec, p.flavor as product_flavor, p.photo as product_photo,
           e.name as employee_name
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    LEFT JOIN employees e ON t.employee_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (employeeId) {
    sql += ' AND t.employee_id = ?';
    params.push(employeeId);
  }

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', t.created_at) = ?';
    params.push(month);
  }

  sql += ' ORDER BY t.created_at DESC LIMIT 100';
  const rows = db.prepare(sql).all(...params) as any[];
  res.json(rows.map(mapTransaction));
});

router.post('/', (req, res) => {
  const data: TransactionCreate = req.body;
  const { items, employeeId, departmentId, paymentType, remark } = data;

  const insertTrans = db.prepare(`
    INSERT INTO transactions (product_id, employee_id, department_id, quantity, unit_price, total_amount, payment_type, payment_status, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
  const updateProductStatus = db.prepare('UPDATE products SET status = ? WHERE id = ?');

  const transactions: Transaction[] = [];
  const paymentStatus = paymentType === 'instant' ? 'paid' : 'pending';
  const today = new Date().toISOString().split('T')[0];

  const precheckProducts: any[] = [];
  for (const item of items) {
    let product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
    if (!product) {
      return res.status(400).json({ error: `商品ID ${item.productId} 不存在` });
    }

    if (product.status !== 'damaged' && product.status !== 'offline') {
      if (product.expiry_date && product.expiry_date < today) {
        if (product.status !== 'expired') {
          updateProductStatus.run('expired', product.id);
          product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
        }
        return res.status(400).json({ error: `商品「${product.name}」已过期，无法取货` });
      }
    }

    if (product.status === 'expired') {
      return res.status(400).json({ error: `商品「${product.name}」已过期，无法取货` });
    }
    if (product.status === 'damaged') {
      return res.status(400).json({ error: `商品「${product.name}」已破损，无法取货` });
    }
    if (product.status !== 'active') {
      return res.status(400).json({ error: `商品「${product.name}」已下架，无法取货` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `商品「${product.name}」库存不足` });
    }

    precheckProducts.push(product);
  }

  const tx = db.transaction(() => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = precheckProducts[i];

      const unitPrice = product.sale_price;
      const totalAmount = unitPrice * item.quantity;

      const info = insertTrans.run(
        item.productId,
        employeeId,
        departmentId,
        item.quantity,
        unitPrice,
        totalAmount,
        paymentType,
        paymentStatus,
        remark || null,
      );

      updateStock.run(item.quantity, item.productId);

      const row = db.prepare(`
        SELECT t.*, 
               p.name as product_name, p.spec as product_spec, p.flavor as product_flavor, p.photo as product_photo,
               e.name as employee_name
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN employees e ON t.employee_id = e.id
        WHERE t.id = ?
      `).get(info.lastInsertRowid) as any;

      transactions.push(mapTransaction(row));
    }
  });

  try {
    tx();
    res.status(201).json(transactions);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(existing.quantity, existing.product_id);
    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  });

  tx();
  res.json({ success: true });
});

export default router;
