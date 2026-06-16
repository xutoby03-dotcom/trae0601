import { Router, Request, Response } from 'express';
import { runQuery, runOne, runExecute, runTransaction } from '../db';
import type { Inspection, CompletionRecord, ApiResponse } from '../../shared/types';

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

const rowToCompletionRecord = (row: Record<string, unknown>): CompletionRecord => ({
  id: row.id as string,
  reservationId: row.reservation_id as string,
  protectionMatReturned: Boolean(row.protection_mat_returned),
  wallDamage: row.wall_damage as CompletionRecord['wallDamage'],
  wallDamageDescription: row.wall_damage_description as string | undefined,
  depositStatus: row.deposit_status as CompletionRecord['depositStatus'],
  depositAmount: row.deposit_amount as number | undefined,
  completedAt: row.completed_at as string,
  needsInspection: Boolean(row.needs_inspection),
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
      `SELECT i.*, r.building, r.floor, r.unit, r.needs_protection_mat,
              cr.protection_mat_returned, cr.wall_damage, cr.wall_damage_description,
              cr.deposit_status, cr.deposit_amount
       FROM inspections i 
       LEFT JOIN reservations r ON i.reservation_id = r.id 
       LEFT JOIN completion_records cr ON cr.reservation_id = i.reservation_id
       WHERE i.status = ? 
       ORDER BY i.created_at ASC`,
      ['pending']
    );
    
    const inspections = rows.map(row => ({
      ...rowToInspection(row),
      building: row.building as string,
      needsProtectionMat: Boolean(row.needs_protection_mat),
      protectionMatReturned: row.protection_mat_returned !== null ? Boolean(row.protection_mat_returned) : undefined,
      wallDamage: row.wall_damage as string | undefined,
      wallDamageDescription: row.wall_damage_description as string | undefined,
      depositStatus: row.deposit_status as string | undefined,
      depositAmount: row.deposit_amount as number | undefined,
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

interface CompleteInspectionBody {
  wallDamage: 'none' | 'minor' | 'major';
  wallDamageDescription?: string;
  protectionMatReturned: boolean;
  depositStatus: 'collected' | 'refunded' | 'deducted';
  notes?: string;
}

router.put('/:id/complete', (req: Request<{ id: string }, unknown, CompleteInspectionBody>, res: Response<ApiResponse<{ inspection: Inspection; completion: CompletionRecord }>>) => {
  try {
    const { id } = req.params;
    const { wallDamage, wallDamageDescription, protectionMatReturned, depositStatus, notes } = req.body;
    
    const inspectionRow = runOne<Record<string, unknown>>(
      'SELECT * FROM inspections WHERE id = ?',
      [id]
    );
    
    if (!inspectionRow) {
      res.status(404).json({ success: false, error: '巡检记录不存在' });
      return;
    }
    
    if (inspectionRow.status === 'completed') {
      res.status(400).json({ success: false, error: '该巡检已完成' });
      return;
    }
    
    const reservationId = inspectionRow.reservation_id as string;
    
    runTransaction(() => {
      const updateFields: string[] = ['status = ?'];
      const updateParams: unknown[] = ['completed'];
      
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateParams.push(notes);
      }
      updateParams.push(id);
      runExecute(`UPDATE inspections SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
      
      const completionRow = runOne<Record<string, unknown>>(
        'SELECT * FROM completion_records WHERE reservation_id = ?',
        [reservationId]
      );
      
      if (completionRow) {
        const completionUpdates: string[] = [];
        const completionParams: unknown[] = [];
        
        completionUpdates.push('wall_damage = ?');
        completionParams.push(wallDamage);
        
        completionUpdates.push('wall_damage_description = ?');
        completionParams.push(wallDamageDescription || null);
        
        completionUpdates.push('protection_mat_returned = ?');
        completionParams.push(protectionMatReturned ? 1 : 0);
        
        completionUpdates.push('deposit_status = ?');
        completionParams.push(depositStatus);
        
        completionUpdates.push('needs_inspection = ?');
        completionParams.push(0);
        
        completionParams.push(reservationId);
        runExecute(
          `UPDATE completion_records SET ${completionUpdates.join(', ')} WHERE reservation_id = ?`,
          completionParams
        );
      }
    });
    
    const updatedInspection = rowToInspection(
      runOne<Record<string, unknown>>('SELECT * FROM inspections WHERE id = ?', [id])!
    );
    
    const updatedCompletion = rowToCompletionRecord(
      runOne<Record<string, unknown>>('SELECT * FROM completion_records WHERE reservation_id = ?', [reservationId])!
    );
    
    res.json({ 
      success: true, 
      data: { inspection: updatedInspection, completion: updatedCompletion },
      message: '巡检完成'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
