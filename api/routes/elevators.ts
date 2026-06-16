import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, runOne, runExecute, runTransaction } from '../db';
import type { Elevator, Maintenance, ElevatorTimeSlot, ApiResponse } from '../../shared/types';

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

const rowToTimeSlot = (row: Record<string, unknown>): ElevatorTimeSlot => ({
  id: row.id as string,
  elevatorId: row.elevator_id as string,
  startTime: row.start_time as string,
  endTime: row.end_time as string,
  dayOfWeek: row.day_of_week !== null ? (row.day_of_week as number) : undefined,
});

router.get('/', (req: Request, res: Response<ApiResponse<Elevator[]>>) => {
  try {
    const rows = runQuery<Record<string, unknown>>('SELECT * FROM elevators ORDER BY building, unit, name');
    const elevators = rows.map(rowToElevator);
    
    const allTimeSlotRows = runQuery<Record<string, unknown>>(
      'SELECT * FROM elevator_time_slots ORDER BY elevator_id, start_time'
    );
    
    const timeSlotsByElevator = new Map<string, ElevatorTimeSlot[]>();
    for (const row of allTimeSlotRows) {
      const slot = rowToTimeSlot(row);
      if (!timeSlotsByElevator.has(slot.elevatorId)) {
        timeSlotsByElevator.set(slot.elevatorId, []);
      }
      timeSlotsByElevator.get(slot.elevatorId)!.push(slot);
    }
    
    for (const elevator of elevators) {
      elevator.timeSlots = timeSlotsByElevator.get(elevator.id) || [];
    }
    
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
    
    const timeSlotRows = runQuery<Record<string, unknown>>(
      'SELECT * FROM elevator_time_slots WHERE elevator_id = ? ORDER BY start_time',
      [id]
    );
    elevator.timeSlots = timeSlotRows.map(rowToTimeSlot);
    
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
    
    runTransaction(() => {
      runExecute('DELETE FROM maintenance WHERE elevator_id = ?', [id]);
      runExecute('DELETE FROM elevator_time_slots WHERE elevator_id = ?', [id]);
      runExecute('DELETE FROM elevators WHERE id = ?', [id]);
    });
    
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

router.get('/:id/time-slots', (req: Request, res: Response<ApiResponse<ElevatorTimeSlot[]>>) => {
  try {
    const { id } = req.params;
    const rows = runQuery<Record<string, unknown>>(
      'SELECT * FROM elevator_time_slots WHERE elevator_id = ? ORDER BY start_time',
      [id]
    );
    const timeSlots = rows.map(rowToTimeSlot);
    res.json({ success: true, data: timeSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/time-slots', (req: Request<{ id: string }, unknown, Omit<ElevatorTimeSlot, 'id' | 'elevatorId'>>, res: Response<ApiResponse<ElevatorTimeSlot>>) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, dayOfWeek } = req.body;
    
    const existing = runOne('SELECT id FROM elevators WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    const timeSlotId = uuidv4();
    runExecute(
      'INSERT INTO elevator_time_slots (id, elevator_id, start_time, end_time, day_of_week) VALUES (?, ?, ?, ?, ?)',
      [timeSlotId, id, startTime, endTime, dayOfWeek !== undefined ? dayOfWeek : null]
    );
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM elevator_time_slots WHERE id = ?', [timeSlotId]);
    const timeSlot = rowToTimeSlot(row!);
    
    res.status(201).json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/time-slots/:slotId', (req: Request<{ slotId: string }, unknown, Partial<ElevatorTimeSlot>>, res: Response<ApiResponse<ElevatorTimeSlot>>) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime, dayOfWeek } = req.body;
    
    const existing = runOne('SELECT id FROM elevator_time_slots WHERE id = ?', [slotId]);
    if (!existing) {
      res.status(404).json({ success: false, error: '时段不存在' });
      return;
    }
    
    const updates: string[] = [];
    const params: unknown[] = [];
    
    if (startTime !== undefined) {
      updates.push('start_time = ?');
      params.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('end_time = ?');
      params.push(endTime);
    }
    if (dayOfWeek !== undefined) {
      updates.push('day_of_week = ?');
      params.push(dayOfWeek);
    }
    
    if (updates.length > 0) {
      params.push(slotId);
      runExecute(`UPDATE elevator_time_slots SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    
    const row = runOne<Record<string, unknown>>('SELECT * FROM elevator_time_slots WHERE id = ?', [slotId]);
    const timeSlot = rowToTimeSlot(row!);
    
    res.json({ success: true, data: timeSlot });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/time-slots/:slotId', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { slotId } = req.params;
    
    const existing = runOne('SELECT id FROM elevator_time_slots WHERE id = ?', [slotId]);
    if (!existing) {
      res.status(404).json({ success: false, error: '时段不存在' });
      return;
    }
    
    runExecute('DELETE FROM elevator_time_slots WHERE id = ?', [slotId]);
    res.json({ success: true, message: '时段已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id/time-slots/batch', (req: Request<{ id: string }, unknown, { slots: Omit<ElevatorTimeSlot, 'id' | 'elevatorId'>[] }>, res: Response<ApiResponse<ElevatorTimeSlot[]>>) => {
  try {
    const { id } = req.params;
    const { slots } = req.body;
    
    const existing = runOne('SELECT id FROM elevators WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    runTransaction(() => {
      runExecute('DELETE FROM elevator_time_slots WHERE elevator_id = ?', [id]);
      
      for (const slot of slots) {
        const slotId = uuidv4();
        runExecute(
          'INSERT INTO elevator_time_slots (id, elevator_id, start_time, end_time, day_of_week) VALUES (?, ?, ?, ?, ?)',
          [slotId, id, slot.startTime, slot.endTime, slot.dayOfWeek !== undefined ? slot.dayOfWeek : null]
        );
      }
    });
    
    const rows = runQuery<Record<string, unknown>>(
      'SELECT * FROM elevator_time_slots WHERE elevator_id = ? ORDER BY start_time',
      [id]
    );
    const timeSlots = rows.map(rowToTimeSlot);
    
    res.json({ success: true, data: timeSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
