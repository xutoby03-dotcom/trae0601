import { Router } from 'express';
import { db } from '../db.js';
import type { Employee } from '../../shared/types.js';

const router = Router();

function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    departmentId: row.department_id,
    avatar: row.avatar,
    department: row.department_name ? {
      id: row.department_id,
      name: row.department_name,
    } : undefined,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.name
  `).all() as any[];
  res.json(rows.map(mapEmployee));
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(req.params.id) as any;
  
  if (!row) {
    return res.status(404).json({ error: '员工不存在' });
  }
  res.json(mapEmployee(row));
});

router.post('/', (req, res) => {
  const { name, departmentId, avatar } = req.body;
  const info = db.prepare(`
    INSERT INTO employees (name, department_id, avatar)
    VALUES (?, ?, ?)
  `).run(name, departmentId, avatar || null);
  
  const row = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(info.lastInsertRowid) as any;
  
  res.status(201).json(mapEmployee(row));
});

router.put('/:id', (req, res) => {
  const { name, departmentId, avatar } = req.body;
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    return res.status(404).json({ error: '员工不存在' });
  }

  db.prepare(`
    UPDATE employees 
    SET name = COALESCE(?, name),
        department_id = COALESCE(?, department_id),
        avatar = COALESCE(?, avatar)
    WHERE id = ?
  `).run(name ?? null, departmentId ?? null, avatar ?? null, req.params.id);

  const row = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(req.params.id) as any;
  
  res.json(mapEmployee(row));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: '员工不存在' });
  }
  res.json({ success: true });
});

router.get('/departments/list', (req, res) => {
  const rows = db.prepare('SELECT * FROM departments ORDER BY name').all() as any[];
  res.json(rows.map(row => ({ id: row.id, name: row.name })));
});

export default router;
