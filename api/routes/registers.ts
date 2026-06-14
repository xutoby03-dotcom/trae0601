import { Router } from 'express';
import { readStore, writeStore, generateId } from '../store';
import type { Register } from '../../shared/types';

const router = Router();

router.get('/', (_req, res) => {
  const store = readStore();
  res.json(store.registers);
});

router.get('/:id', (req, res) => {
  const store = readStore();
  const register = store.registers.find((r) => r.id === req.params.id);
  if (!register) {
    res.status(404).json({ error: '收银台不存在' });
    return;
  }
  res.json(register);
});

router.post('/', (req, res) => {
  const store = readStore();
  const now = new Date().toISOString();
  const newRegister: Register = {
    id: generateId(),
    code: req.body.code,
    shift: req.body.shift,
    defaultAmount: Number(req.body.defaultAmount),
    managerName: req.body.managerName,
    managerPhoto: req.body.managerPhoto || '',
    threshold: Number(req.body.threshold) || 30,
    createdAt: now,
    updatedAt: now,
  };
  store.registers.push(newRegister);
  writeStore(store);
  res.status(201).json(newRegister);
});

router.put('/:id', (req, res) => {
  const store = readStore();
  const idx = store.registers.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: '收银台不存在' });
    return;
  }
  const now = new Date().toISOString();
  store.registers[idx] = {
    ...store.registers[idx],
    ...req.body,
    defaultAmount: Number(req.body.defaultAmount ?? store.registers[idx].defaultAmount),
    threshold: Number(req.body.threshold ?? store.registers[idx].threshold),
    updatedAt: now,
  };
  writeStore(store);
  res.json(store.registers[idx]);
});

router.delete('/:id', (req, res) => {
  const store = readStore();
  const idx = store.registers.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: '收银台不存在' });
    return;
  }
  store.registers.splice(idx, 1);
  writeStore(store);
  res.status(204).send();
});

export default router;
