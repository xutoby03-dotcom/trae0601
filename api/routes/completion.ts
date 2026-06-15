import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, runOne, runExecute, runTransaction } from '../db';
import type { CompletionRecord, Inspection, ApiResponse } from '../../shared/types';

const router = Router();

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

const rowToInspection = (row: Record<string, unknown>): Inspection => ({
  id: row.id as string,
  reservationId: row.reservation_id as string,
  floor: row.floor as number,
  unit: row.unit as string,
  status: row.status as Inspection['status'],
  notes: row.notes as string | undefined,
  createdAt: row.created_at as string,
});

router.get('/:reservationId', (req: Request, res: Response<ApiResponse<CompletionRecord>>) => {
  try {
    const { reservationId } = req.params;
    const row = runOne<Record<string, unknown>>(
      'SELECT * FROM completion_records WHERE reservation_id = ?',
      [reservationId]
    );
    
    if (!row) {
      res.status(404).json({ success: false, error: '完成记录不存在' });
      return;
    }
    
    const record = rowToCompletionRecord(row);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', (req: Request<unknown, unknown, Omit<CompletionRecord, 'id' | 'completedAt'>>, res: Response<ApiResponse<{ completion: CompletionRecord; inspection?: Inspection }>>) => {
  try {
    const {
      reservationId,
      protectionMatReturned,
      wallDamage,
      wallDamageDescription,
      depositStatus,
      depositAmount,
      needsInspection
    } = req.body;
    
    const reservation = runOne<Record<string, unknown>>(
      'SELECT * FROM reservations WHERE id = ?',
      [reservationId]
    );
    
    if (!reservation) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }
    
    const existingRecord = runOne(
      'SELECT id FROM completion_records WHERE reservation_id = ?',
      [reservationId]
    );
    
    if (existingRecord) {
      res.status(409).json({ success: false, error: '该预约已有完成记录' });
      return;
    }
    
    const completionId = uuidv4();
    let inspection: Inspection | undefined;
    
    runTransaction(() => {
      runExecute(
        `INSERT INTO completion_records (
          id, reservation_id, protection_mat_returned, wall_damage,
          wall_damage_description, deposit_status, deposit_amount, needs_inspection
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          completionId, reservationId,
          protectionMatReturned ? 1 : 0,
          wallDamage,
          wallDamageDescription || null,
          depositStatus,
          depositAmount || null,
          needsInspection ? 1 : 0
        ]
      );
      
      runExecute(
        'UPDATE reservations SET status = ? WHERE id = ?',
        ['completed', reservationId]
      );
      
      if (needsInspection || wallDamage !== 'none') {
        const inspectionId = uuidv4();
        runExecute(
          `INSERT INTO inspections (
            id, reservation_id, floor, unit, status
          ) VALUES (?, ?, ?, ?, ?)`,
          [inspectionId, reservationId, reservation.floor, reservation.unit, 'pending']
        );
        
        const inspectionRow = runOne<Record<string, unknown>>(
          'SELECT * FROM inspections WHERE id = ?',
          [inspectionId]
        );
        inspection = rowToInspection(inspectionRow!);
      }
    });
    
    const completionRow = runOne<Record<string, unknown>>(
      'SELECT * FROM completion_records WHERE id = ?',
      [completionId]
    );
    const completion = rowToCompletionRecord(completionRow!);
    
    res.status(201).json({ success: true, data: { completion, inspection } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
