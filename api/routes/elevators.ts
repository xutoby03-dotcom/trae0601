import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, runOne, runExecute } from '../db';
import type { Elevator, Maintenance, ApiResponse } from '../../shared/types';

const router = Router();

const rowToElevator = (row: Record<string, unknown>): Elevator => ({
  id: row.id as string,
  name: row.name as string,
  building: row.building as string,
  unit: row.unit as string,
  maxLoad: row.max_load as number,
  allowsProtectionMat: Boolean(row.allows_protection_mat),
  status: row.status as 'active' | 'maintenance' | 'disabled',
  createdAt: row.created_at as string,
});

const rowToMaintenance = (row: Record<string, unknown>): Maintenance => ({
  id: row.id as string,
  elevatorId: row.elevator_id as string,
  date: row.date as string,
  startTime: row.start_time as string,
  endTime: row.end_time as string,
  description: row.description as string,
});

router.get('/', (req: Request, res: Response<ApiResponse<Elevator[]>>) => {
  try {
    const rows = runQuery<Record<string, unknown>>('SELECT * FROM elevators ORDER BY building, unit, name');
    const elevators = rows.map(rowToElevator);
    res.json({ success: true, data: elevators });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', (req: Request, res: Response<ApiResponse<Elevator>>) => {
  try {
    const { id } = req.params;
    const row = runOne<Record<string, unknown>>('SELECT * FROM elevators WHERE id = ?', [id]);
    
    if (!row) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    const elevator = rowToElevator(row);
    
    const maintenanceRows = runQuery<Record<string, unknown>>(
      'SELECT * FROM maintenance WHERE elevator_id = ? ORDER BY date, start_time',
      [id]
    );
    elevator.maintenanceSchedule = maintenanceRows.map(rowToMaintenance);
    
    res.json({ success: true, data: elevator });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', (req: Request<unknown, unknown, Omit<Elevator, 'id' | 'createdAt' | 'maintenanceSchedule'>>, res: Response<ApiResponse<Elevator>>) => {
  try {
    const { name, building, unit, maxLoad, allowsProtectionMat, status } = req.body;
    const id = uuidv4();
    
    runExecute(
      'INSERT INTO elevators (id, name, building, unit, max_load, allows_protection_mat, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, building, unit, maxLoad, allowsProtectionMat ? 1 : 0, status]
    );
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM elevators WHERE id = ?', [id]);
    const elevator = rowToElevator(row!);
    
    res.status(201).json({ success: true, data: elevator });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', (req: Request<{ id: string }, unknown, Partial<Elevator>>, res: Response<ApiResponse<Elevator>>) => {
  try {
    const { id } = req.params;
    const { name, building, unit, maxLoad, allowsProtectionMat, status } = req.body;
    
    const existing = runOne('SELECT id FROM elevators WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    const updates: string[] = [];
    const params: unknown[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (building !== undefined) {
      updates.push('building = ?');
      params.push(building);
    }
    if (unit !== undefined) {
      updates.push('unit = ?');
      params.push(unit);
    }
    if (maxLoad !== undefined) {
      updates.push('max_load = ?');
      params.push(maxLoad);
    }
    if (allowsProtectionMat !== undefined) {
      updates.push('allows_protection_mat = ?');
      params.push(allowsProtectionMat ? 1 : 0);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length > 0) {
      params.push(id);
      runExecute(`UPDATE elevators SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM elevators WHERE id = ?', [id]);
    const elevator = rowToElevator(row!);
    
    res.json({ success: true, data: elevator });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    
    const existing = runOne('SELECT id FROM elevators WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    runExecute('DELETE FROM maintenance WHERE elevator_id = ?', [id]);
    runExecute('DELETE FROM elevators WHERE id = ?', [id]);
    
    res.json({ success: true, message: '电梯已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id/maintenance', (req: Request, res: Response<ApiResponse<Maintenance[]>>) => {
  try {
    const { id } = req.params;
    const rows = runQuery<Record<string, unknown>>(
      'SELECT * FROM maintenance WHERE elevator_id = ? ORDER BY date, start_time',
      [id]
    );
    const maintenance = rows.map(rowToMaintenance);
    res.json({ success: true, data: maintenance });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/maintenance', (req: Request<{ id: string }, unknown, Omit<Maintenance, 'id' | 'elevatorId'>>, res: Response<ApiResponse<Maintenance>>) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, description } = req.body;
    const maintenanceId = uuidv4();
    
    runExecute(
      'INSERT INTO maintenance (id, elevator_id, date, start_time, end_time, description) VALUES (?, ?, ?, ?, ?, ?)',
      [maintenanceId, id, date, startTime, endTime, description]
    );
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM maintenance WHERE id = ?', [maintenanceId]);
    const maintenance = rowToMaintenance(row!);
    
    res.status(201).json({ success: true, data: maintenance });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/maintenance/:maintenanceId', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { maintenanceId } = req.params;
    runExecute('DELETE FROM maintenance WHERE id = ?', [maintenanceId]);
    res.json({ success: true, message: '检修安排已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
