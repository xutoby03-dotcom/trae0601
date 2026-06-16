import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, runOne, runExecute } from '../db';
import type { Reservation, ApiResponse, ConflictCheckRequest, ConflictCheckResult, WeightCheckRequest, WeightCheckResult, Elevator } from '../../shared/types';

const router = Router();

const ELEVATOR_SELECT = `
  e.id AS e_id,
  e.name AS e_name,
  e.building AS e_building,
  e.unit AS e_unit,
  e.max_load AS e_max_load,
  e.allows_protection_mat AS e_allows_protection_mat,
  e.status AS e_status,
  e.created_at AS e_created_at
`;

const rowToReservation = (row: Record<string, unknown>): Reservation => ({
  id: row.id as string,
  building: row.building as string,
  unit: row.unit as string,
  floor: row.floor as number,
  movingCompany: row.moving_company as string,
  vehicleInfo: row.vehicle_info as string,
  estimatedItems: row.estimated_items as number,
  estimatedWeight: row.estimated_weight as number,
  needsProtectionMat: Boolean(row.needs_protection_mat),
  date: row.date as string,
  startTime: row.start_time as string,
  endTime: row.end_time as string,
  elevatorId: row.elevator_id as string,
  status: row.status as Reservation['status'],
  createdAt: row.created_at as string,
});

const rowToElevator = (row: Record<string, unknown>): Elevator => ({
  id: row.e_id as string,
  name: row.e_name as string,
  building: row.e_building as string,
  unit: row.e_unit as string,
  maxLoad: row.e_max_load as number,
  allowsProtectionMat: Boolean(row.e_allows_protection_mat),
  status: row.e_status as 'active' | 'maintenance' | 'disabled',
  createdAt: row.e_created_at as string,
});

const isTimeOverlap = (
  start1: string, end1: string,
  start2: string, end2: string
): boolean => {
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

const checkMaintenanceConflict = (
  elevatorId: string,
  date: string,
  startTime: string,
  endTime: string
): { hasConflict: boolean; message?: string } => {
  const maintenanceRows = runQuery<Record<string, unknown>>(
    'SELECT * FROM maintenance WHERE elevator_id = ? AND date = ?',
    [elevatorId, date]
  );
  
  for (const maint of maintenanceRows) {
    if (isTimeOverlap(startTime, endTime, maint.start_time as string, maint.end_time as string)) {
      return {
        hasConflict: true,
        message: `该时段有检修安排：${maint.description}（${maint.start_time}-${maint.end_time}）`
      };
    }
  }
  
  return { hasConflict: false };
};

router.get('/', (req: Request, res: Response<ApiResponse<Reservation[]>>) => {
  try {
    const { date, status, elevatorId } = req.query;
    
    let sql = `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r LEFT JOIN elevators e ON r.elevator_id = e.id WHERE 1=1`;
    const params: unknown[] = [];
    
    if (date) {
      sql += ' AND r.date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (elevatorId) {
      sql += ' AND r.elevator_id = ?';
      params.push(elevatorId);
    }
    
    sql += ' ORDER BY r.date, r.start_time';
    
    const rows = runQuery<Record<string, unknown>>(sql, params);
    const reservations = rows.map(row => {
      const reservation = rowToReservation(row);
      reservation.elevator = rowToElevator(row);
      return reservation;
    });
    
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/today', (req: Request, res: Response<ApiResponse<Reservation[]>>) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const rows = runQuery<Record<string, unknown>>(
      `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
       LEFT JOIN elevators e ON r.elevator_id = e.id 
       WHERE r.date = ? 
       ORDER BY r.start_time`,
      [today]
    );
    
    const reservations = rows.map(row => {
      const reservation = rowToReservation(row);
      reservation.elevator = rowToElevator(row);
      return reservation;
    });
    
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/check-conflict', (req: Request<unknown, unknown, unknown, ConflictCheckRequest>, res: Response<ApiResponse<ConflictCheckResult>>) => {
  try {
    const { elevatorId, date, startTime, endTime, reservationId } = req.query;
    
    if (!elevatorId || !date || !startTime || !endTime) {
      res.status(400).json({ success: false, error: '缺少必要参数' });
      return;
    }
    
    const maintenanceConflict = checkMaintenanceConflict(elevatorId, date, startTime, endTime);
    if (maintenanceConflict.hasConflict) {
      res.json({
        success: true,
        data: {
          hasConflict: true,
          message: maintenanceConflict.message
        }
      });
      return;
    }
    
    let sql = `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
               LEFT JOIN elevators e ON r.elevator_id = e.id 
               WHERE r.elevator_id = ? AND r.date = ? AND r.status = 'approved'`;
    const params: unknown[] = [elevatorId, date];
    
    if (reservationId) {
      sql += ' AND r.id != ?';
      params.push(reservationId);
    }
    
    const rows = runQuery<Record<string, unknown>>(sql, params);
    const conflictingReservations: Reservation[] = [];
    
    for (const row of rows) {
      if (isTimeOverlap(startTime, endTime, row.start_time as string, row.end_time as string)) {
        const reservation = rowToReservation(row);
        reservation.elevator = rowToElevator(row);
        conflictingReservations.push(reservation);
      }
    }
    
    if (conflictingReservations.length > 0) {
      res.json({
        success: true,
        data: {
          hasConflict: true,
          conflictingReservations,
          message: `该时段已有 ${conflictingReservations.length} 个预约冲突`
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          hasConflict: false
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/check-weight', (req: Request<unknown, unknown, unknown, WeightCheckRequest>, res: Response<ApiResponse<WeightCheckResult>>) => {
  try {
    const { elevatorId, estimatedWeight } = req.query;
    
    if (!elevatorId || estimatedWeight === undefined) {
      res.status(400).json({ success: false, error: '缺少必要参数' });
      return;
    }
    
    const elevatorRow = runOne<Record<string, unknown>>(
      'SELECT * FROM elevators WHERE id = ?',
      [elevatorId]
    );
    
    if (!elevatorRow) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    const maxLoad = elevatorRow.max_load as number;
    const weight = Number(estimatedWeight);
    const isOverloaded = weight > maxLoad;
    
    res.json({
      success: true,
      data: {
        isOverloaded,
        elevatorMaxLoad: maxLoad,
        estimatedWeight: weight,
        message: isOverloaded 
          ? `预估重量 ${weight}kg 超过电梯载重 ${maxLoad}kg，请换梯或拆分搬运`
          : `预估重量 ${weight}kg，电梯载重 ${maxLoad}kg，符合要求`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', (req: Request<unknown, unknown, Omit<Reservation, 'id' | 'createdAt' | 'elevator'>>, res: Response<ApiResponse<Reservation>>) => {
  try {
    const {
      building, unit, floor, movingCompany, vehicleInfo,
      estimatedItems, estimatedWeight, needsProtectionMat,
      date, startTime, endTime, elevatorId
    } = req.body;
    
    const elevatorRow = runOne<Record<string, unknown>>(
      'SELECT * FROM elevators WHERE id = ?',
      [elevatorId]
    );
    
    if (!elevatorRow) {
      res.status(404).json({ success: false, error: '电梯不存在' });
      return;
    }
    
    if (needsProtectionMat && !Boolean(elevatorRow.allows_protection_mat)) {
      res.status(400).json({ success: false, error: '该电梯不允许铺设保护垫' });
      return;
    }
    
    if (Number(estimatedWeight) > Number(elevatorRow.max_load)) {
      res.status(400).json({ 
        success: false, 
        error: `预估重量 ${estimatedWeight}kg 超过电梯载重 ${elevatorRow.max_load}kg，请换梯或拆分搬运` 
      });
      return;
    }
    
    const maintenanceConflict = checkMaintenanceConflict(elevatorId, date, startTime, endTime);
    if (maintenanceConflict.hasConflict) {
      res.status(400).json({ success: false, error: maintenanceConflict.message });
      return;
    }
    
    const approvedRows = runQuery<Record<string, unknown>>(
      `SELECT * FROM reservations 
       WHERE elevator_id = ? AND date = ? AND status = 'approved'`,
      [elevatorId, date]
    );
    
    let hasApprovedConflict = false;
    for (const existing of approvedRows) {
      if (isTimeOverlap(startTime, endTime, existing.start_time as string, existing.end_time as string)) {
        hasApprovedConflict = true;
        break;
      }
    }
    
    const id = uuidv4();
    const status: Reservation['status'] = hasApprovedConflict ? 'conflict' : 'approved';
    
    runExecute(
      `INSERT INTO reservations (
        id, building, unit, floor, moving_company, vehicle_info,
        estimated_items, estimated_weight, needs_protection_mat,
        date, start_time, end_time, elevator_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, building, unit, floor, movingCompany, vehicleInfo,
        estimatedItems, estimatedWeight, needsProtectionMat ? 1 : 0,
        date, startTime, endTime, elevatorId, status
      ]
    );
    
    const row = runOne<Record<string, unknown>>(
      `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
       LEFT JOIN elevators e ON r.elevator_id = e.id 
       WHERE r.id = ?`,
      [id]
    );
    
    const reservation = rowToReservation(row!);
    reservation.elevator = rowToElevator(row!);
    
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id/status', (req: Request<{ id: string }, unknown, { status: Reservation['status'] }>, res: Response<ApiResponse<Reservation>>) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const existing = runOne('SELECT id FROM reservations WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }
    
    runExecute('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
    
    const row = runOne<Record<string, unknown>>(
      `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
       LEFT JOIN elevators e ON r.elevator_id = e.id 
       WHERE r.id = ?`,
      [id]
    );
    
    const reservation = rowToReservation(row!);
    reservation.elevator = rowToElevator(row!);
    
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id/approve', (req: Request<{ id: string }>, res: Response<ApiResponse<Reservation>>) => {
  try {
    const { id } = req.params;
    
    const reservationRow = runOne<Record<string, unknown>>(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );
    
    if (!reservationRow) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }
    
    if (reservationRow.status !== 'conflict' && reservationRow.status !== 'pending') {
      res.status(400).json({ success: false, error: '只有冲突或待处理状态的预约可以审核通过' });
      return;
    }
    
    const approvedRows = runQuery<Record<string, unknown>>(
      `SELECT * FROM reservations 
       WHERE elevator_id = ? AND date = ? AND status = 'approved' AND id != ?`,
      [reservationRow.elevator_id, reservationRow.date, id]
    );
    
    for (const existing of approvedRows) {
      if (isTimeOverlap(
        reservationRow.start_time as string, 
        reservationRow.end_time as string, 
        existing.start_time as string, 
        existing.end_time as string
      )) {
        res.status(409).json({ 
          success: false, 
          error: '该时段已有其他已通过的预约，无法通过此申请' 
        });
        return;
      }
    }
    
    runExecute('UPDATE reservations SET status = ? WHERE id = ?', ['approved', id]);
    
    const row = runOne<Record<string, unknown>>(
      `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
       LEFT JOIN elevators e ON r.elevator_id = e.id 
       WHERE r.id = ?`,
      [id]
    );
    
    const reservation = rowToReservation(row!);
    reservation.elevator = rowToElevator(row!);
    
    res.json({ success: true, data: reservation, message: '预约已通过' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id/cancel', (req: Request<{ id: string }>, res: Response<ApiResponse<Reservation>>) => {
  try {
    const { id } = req.params;
    
    const existing = runOne('SELECT id, status FROM reservations WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, error: '预约不存在' });
      return;
    }
    
    runExecute('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', id]);
    
    const row = runOne<Record<string, unknown>>(
      `SELECT r.*, ${ELEVATOR_SELECT} FROM reservations r 
       LEFT JOIN elevators e ON r.elevator_id = e.id 
       WHERE r.id = ?`,
      [id]
    );
    
    const reservation = rowToReservation(row!);
    reservation.elevator = rowToElevator(row!);
    
    res.json({ success: true, data: reservation, message: '预约已取消' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
