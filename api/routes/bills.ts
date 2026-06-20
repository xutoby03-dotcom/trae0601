import { Router } from 'express';
import { db } from '../db.js';
import type { Bill, BillDetail } from '../../shared/types.js';

const router = Router();

function mapBill(row: any): Bill {
  return {
    id: row.id,
    employeeId: row.employee_id,
    month: row.month,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    unpaidAmount: row.unpaid_amount,
    status: row.status,
    remark: row.remark,
    createdAt: row.created_at,
    employee: row.employee_name ? {
      id: row.employee_id,
      name: row.employee_name,
      departmentId: row.department_id,
      department: row.department_name ? {
        id: row.department_id,
        name: row.department_name,
      } : undefined,
    } : undefined,
  };
}

router.get('/', (req, res) => {
  const { month, employeeId } = req.query;
  let sql = `
    SELECT b.*, 
           e.name as employee_name, e.department_id,
           d.name as department_name
    FROM bills b
    LEFT JOIN employees e ON b.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND b.month = ?';
    params.push(month);
  }

  if (employeeId) {
    sql += ' AND b.employee_id = ?';
    params.push(employeeId);
  }

  sql += ' ORDER BY b.month DESC, b.total_amount DESC';
  const rows = db.prepare(sql).all(...params) as any[];
  res.json(rows.map(mapBill));
});

router.get('/:id', (req, res) => {
  const billRow = db.prepare(`
    SELECT b.*, 
           e.name as employee_name, e.department_id,
           d.name as department_name
    FROM bills b
    LEFT JOIN employees e ON b.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE b.id = ?
  `).get(req.params.id) as any;

  if (!billRow) {
    return res.status(404).json({ error: '账单不存在' });
  }

  const transRows = db.prepare(`
    SELECT t.*, 
           p.name as product_name, p.spec as product_spec, p.flavor as product_flavor, p.photo as product_photo
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    WHERE t.bill_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.id) as any[];

  const bill: BillDetail = {
    ...mapBill(billRow),
    transactions: transRows.map(row => ({
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
      product: {
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
      },
    })),
  };

  res.json(bill);
});

router.post('/generate', (req, res) => {
  const { month } = req.body;
  if (!month) {
    return res.status(400).json({ error: '请指定月份' });
  }

  const tx = db.transaction(() => {
    const existingBills = db.prepare('SELECT id FROM bills WHERE month = ?').all(month) as any[];
    if (existingBills.length > 0) {
      throw new Error(`${month} 月账单已生成`);
    }

    const pendingTrans = db.prepare(`
      SELECT employee_id, department_id, 
             SUM(total_amount) as total_amount,
             GROUP_CONCAT(id) as trans_ids
      FROM transactions 
      WHERE payment_type = 'monthly' 
        AND payment_status = 'pending'
        AND bill_id IS NULL
        AND strftime('%Y-%m', created_at) = ?
      GROUP BY employee_id
    `).all(month) as any[];

    const bills: Bill[] = [];
    const insertBill = db.prepare(`
      INSERT INTO bills (employee_id, month, total_amount, paid_amount, unpaid_amount, status)
      VALUES (?, ?, ?, 0, ?, 'pending')
    `);

    const updateTrans = db.prepare('UPDATE transactions SET bill_id = ? WHERE id = ?');

    for (const pt of pendingTrans) {
      const info = insertBill.run(pt.employee_id, month, pt.total_amount, pt.total_amount);
      const transIds = pt.trans_ids.split(',');
      for (const tid of transIds) {
        updateTrans.run(info.lastInsertRowid, tid);
      }

      const row = db.prepare(`
        SELECT b.*, 
               e.name as employee_name, e.department_id,
               d.name as department_name
        FROM bills b
        LEFT JOIN employees e ON b.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE b.id = ?
      `).get(info.lastInsertRowid) as any;
      bills.push(mapBill(row));
    }

    return bills;
  });

  try {
    const bills = tx();
    res.status(201).json(bills);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', (req, res) => {
  const { status, remark } = req.body;
  const existing = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    return res.status(404).json({ error: '账单不存在' });
  }

  const tx = db.transaction(() => {
    let paidAmount = existing.paid_amount;
    let unpaidAmount = existing.unpaid_amount;

    if (status === 'paid') {
      paidAmount = existing.total_amount;
      unpaidAmount = 0;
      db.prepare(`
        UPDATE transactions 
        SET payment_status = 'paid' 
        WHERE bill_id = ? AND payment_status = 'pending'
      `).run(req.params.id);
    } else if (status === 'waived') {
      paidAmount = existing.total_amount;
      unpaidAmount = 0;
      db.prepare(`
        UPDATE transactions 
        SET payment_status = 'waived' 
        WHERE bill_id = ? AND payment_status = 'pending'
      `).run(req.params.id);
    }

    db.prepare(`
      UPDATE bills 
      SET status = ?, 
          paid_amount = ?, 
          unpaid_amount = ?,
          remark = COALESCE(?, remark)
      WHERE id = ?
    `).run(status, paidAmount, unpaidAmount, remark ?? null, req.params.id);
  });

  tx();

  const row = db.prepare(`
    SELECT b.*, 
           e.name as employee_name, e.department_id,
           d.name as department_name
    FROM bills b
    LEFT JOIN employees e ON b.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE b.id = ?
  `).get(req.params.id);

  res.json(mapBill(row));
});

export default router;
