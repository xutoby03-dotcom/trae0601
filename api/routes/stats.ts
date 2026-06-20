import { Router } from 'express';
import { db } from '../db.js';
import type { HotProduct, DeptConsumption, ProfitStats, DebtRanking, RestockSuggestion } from '../../shared/types.js';

const router = Router();

router.get('/hot-products', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const { month } = req.query;

  let sql = `
    SELECT p.id as product_id, p.name as product_name,
           SUM(t.quantity) as total_quantity,
           SUM(t.total_amount) as total_amount
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', t.created_at) = ?';
    params.push(month);
  }

  sql += `
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT ?
  `;
  params.push(limit);

  const rows = db.prepare(sql).all(...params) as any[];
  const result: HotProduct[] = rows.map(row => ({
    productId: row.product_id,
    productName: row.product_name,
    totalQuantity: row.total_quantity,
    totalAmount: row.total_amount,
  }));

  res.json(result);
});

router.get('/dept-consumption', (req, res) => {
  const { month } = req.query;

  let sql = `
    SELECT d.id as department_id, d.name as department_name,
           SUM(t.total_amount) as total_amount,
           COUNT(DISTINCT t.id) as transaction_count
    FROM transactions t
    LEFT JOIN departments d ON t.department_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (month) {
    sql += ' AND strftime(\'%Y-%m\', t.created_at) = ?';
    params.push(month);
  }

  sql += `
    GROUP BY d.id, d.name
    ORDER BY total_amount DESC
  `;

  const rows = db.prepare(sql).all(...params) as any[];
  const result: DeptConsumption[] = rows.map(row => ({
    departmentId: row.department_id,
    departmentName: row.department_name,
    totalAmount: row.total_amount,
    transactionCount: row.transaction_count,
  }));

  res.json(result);
});

router.get('/profit', (req, res) => {
  const { month } = req.query;

  const monthlyDataRows = db.prepare(`
    SELECT strftime('%Y-%m', t.created_at) as month,
           SUM(t.total_amount) as revenue,
           SUM(t.quantity * p.cost_price) as cost,
           SUM(t.total_amount) - SUM(t.quantity * p.cost_price) as profit
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    GROUP BY strftime('%Y-%m', t.created_at)
    ORDER BY month DESC
    LIMIT 6
  `).all() as any[];

  let whereSql = 'WHERE 1=1';
  const params: any[] = [];
  if (month) {
    whereSql += ' AND strftime(\'%Y-%m\', t.created_at) = ?';
    params.push(month);
  }

  const totalRow = db.prepare(`
    SELECT SUM(t.total_amount) as total_revenue,
           SUM(t.quantity * p.cost_price) as total_cost
    FROM transactions t
    LEFT JOIN products p ON t.product_id = p.id
    ${whereSql}
  `).get(...params) as any;

  const totalRevenue = totalRow?.total_revenue || 0;
  const totalCost = totalRow?.total_cost || 0;
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const result: ProfitStats = {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    monthlyData: monthlyDataRows.map(row => ({
      month: row.month,
      revenue: row.revenue || 0,
      cost: row.cost || 0,
      profit: row.profit || 0,
    })).reverse(),
  };

  res.json(result);
});

router.get('/debt-ranking', (req, res) => {
  const rows = db.prepare(`
    SELECT e.id as employee_id, e.name as employee_name,
           d.name as department_name,
           SUM(b.unpaid_amount) as total_debt,
           COUNT(b.id) as bill_count
    FROM bills b
    LEFT JOIN employees e ON b.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE b.status IN ('pending', 'partial')
      AND b.unpaid_amount > 0
    GROUP BY e.id, e.name, d.name
    ORDER BY total_debt DESC
  `).all() as any[];

  const result: DebtRanking[] = rows.map(row => ({
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    departmentName: row.department_name,
    totalDebt: row.total_debt,
    billCount: row.bill_count,
  }));

  res.json(result);
});

router.get('/restock-suggestions', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id as product_id, p.name as product_name,
           p.stock as current_stock,
           COALESCE(AVG(monthly_sales.quantity), 0) as avg_monthly_sales,
           CASE 
             WHEN COALESCE(AVG(monthly_sales.quantity), 0) = 0 THEN 10
             ELSE MAX(0, CAST(COALESCE(AVG(monthly_sales.quantity), 0) * 1.5 - p.stock AS INTEGER))
           END as suggested_quantity
    FROM products p
    LEFT JOIN (
      SELECT product_id, 
             strftime('%Y-%m', created_at) as month,
             SUM(quantity) as quantity
      FROM transactions
      WHERE created_at >= date('now', '-3 months')
      GROUP BY product_id, strftime('%Y-%m', created_at)
    ) monthly_sales ON p.id = monthly_sales.product_id
    WHERE p.status = 'active'
    GROUP BY p.id, p.name, p.stock
    HAVING p.stock < 10 OR suggested_quantity > 0
    ORDER BY suggested_quantity DESC, p.stock ASC
  `).all() as any[];

  const result: RestockSuggestion[] = rows.map(row => ({
    productId: row.product_id,
    productName: row.product_name,
    currentStock: row.current_stock,
    avgMonthlySales: Math.round(row.avg_monthly_sales * 100) / 100,
    suggestedQuantity: row.suggested_quantity,
  })).filter(r => r.suggestedQuantity > 0);

  res.json(result);
});

export default router;
