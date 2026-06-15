import { Router, Request, Response } from 'express';
import { runQuery, runOne, runExecute } from '../db';
import type { Inspection, ApiResponse } from '../../shared/types';

const router = Router();

const rowToInspection = (row: Record<string, unknown>): Inspection => ({
  id: row.id as string,
  reservationId: row.reservation_id as string,
  floor: row.floor as number,
  unit: row.unit as string,
  status: row.status as Inspection['status'],
  notes: row.notes as string | undefined,
  createdAt: row.created_at as string,
});

router.get('/', (req: Request, res: Response<ApiResponse<Inspection[]>>) => {
  try {
    const { status } = req.query;
    
    let sql = 'SELECT * FROM inspections WHERE 1=1';
    const params: unknown[] = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = runQuery<Record<string, unknown>>(sql, params);
    const inspections = rows.map(rowToInspection);
    
    res.json({ success: true, data: inspections });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/pending', (req: Request, res: Response<ApiResponse<Inspection[]>>) => {
  try {
    const rows = runQuery<Record<string, unknown>>(
      `SELECT i.*, r.building, r.floor, r.unit 
       FROM inspections i 
       LEFT JOIN reservations r ON i.reservation_id = r.id 
       WHERE i.status = ? 
       ORDER BY i.created_at ASC`,
      ['pending']
    );
    
    const inspections = rows.map(row => ({
      ...rowToInspection(row),
      building: row.building as string,
    }));
    
    res.json({ success: true, data: inspections as unknown as Inspection[] });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', (req: Request<{ id: string }, unknown, Partial<Inspection>>, res: Response<ApiResponse<Inspection>>) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const existing = runOne('SELECT id FROM inspections WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '巡检记录不存在' });
      return;
    }
    
    const updates: string[] = [];
    const params: unknown[] = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    
    if (updates.length > 0) {
      params.push(id);
      runExecute(`UPDATE inspections SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM inspections WHERE id = ?', [id]);
    const inspection = rowToInspection(row!);
    
    res.json({ success: true, data: inspection });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
