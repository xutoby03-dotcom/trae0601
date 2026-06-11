import { Router } from 'express';
import * as tableService from '../services/tableService.js';

const router = Router();

router.get('/', (_req, res) => {
  const tables = tableService.getAllTables();
  res.json(tables);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const table = tableService.getTableById(id);
  if (!table) {
    res.status(404).json({ error: '桌位不存在' });
    return;
  }
  res.json(table);
});

router.post('/', (req, res) => {
  const { tableNumber, capacity, isWindow, isMahjong, openTime, closeTime, photo } = req.body;

  if (!tableNumber || !capacity) {
    res.status(400).json({ error: '桌号和人数是必填项' });
    return;
  }

  const newTable = tableService.createTable({
    tableNumber,
    capacity: parseInt(capacity),
    isWindow: Boolean(isWindow),
    isMahjong: Boolean(isMahjong),
    openTime: openTime || '08:00',
    closeTime: closeTime || '22:00',
    photo,
  });

  res.status(201).json(newTable);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  const updated = tableService.updateTable(id, {
    ...data,
    capacity: data.capacity ? parseInt(data.capacity) : undefined,
    isWindow: data.isWindow !== undefined ? Boolean(data.isWindow) : undefined,
    isMahjong: data.isMahjong !== undefined ? Boolean(data.isMahjong) : undefined,
  });

  if (!updated) {
    res.status(404).json({ error: '桌位不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const success = tableService.deleteTable(id);
  if (!success) {
    res.status(404).json({ error: '桌位不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
