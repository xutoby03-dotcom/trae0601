import { Router } from 'express';
import * as reservationService from '../services/reservationService.js';

const router = Router();

router.get('/', (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const reservations = reservationService.getReservationsByDate(date);
  res.json(reservations);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const reservation = reservationService.getReservationById(id);
  if (!reservation) {
    res.status(404).json({ error: '预约不存在' });
    return;
  }
  res.json(reservation);
});

router.post('/', (req, res) => {
  const { tableId, gameType, peopleCount, startTime, endTime, contactName, contactPhone, teaRequirement } = req.body;

  if (!tableId || !gameType || !peopleCount || !startTime || !endTime || !contactName || !contactPhone) {
    res.status(400).json({ error: '请填写完整的预约信息' });
    return;
  }

  const result = reservationService.createReservation({
    tableId: parseInt(tableId),
    gameType,
    peopleCount: parseInt(peopleCount),
    startTime,
    endTime,
    contactName,
    contactPhone,
    teaRequirement: teaRequirement || '',
  });

  if ('error' in result) {
    res.status(409).json({ error: result.error });
    return;
  }

  res.status(201).json(result);
});

router.put('/:id/checkin', (req, res) => {
  const id = parseInt(req.params.id);
  const result = reservationService.checkInReservation(id);
  if (!result) {
    res.status(404).json({ error: '预约不存在' });
    return;
  }
  res.json(result);
});

router.put('/:id/cancel', (req, res) => {
  const id = parseInt(req.params.id);
  const result = reservationService.cancelReservation(id);
  if (!result) {
    res.status(404).json({ error: '预约不存在' });
    return;
  }
  res.json(result);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const success = reservationService.deleteReservation(id);
  if (!success) {
    res.status(404).json({ error: '预约不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
