import { Router } from 'express';
import { readStore, writeStore, generateId } from '../store';
import type { Transaction } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const store = readStore();
  let transactions = [...store.transactions];

  if (req.query.type) {
    transactions = transactions.filter((t) => t.type === req.query.type);
  }
  if (req.query.registerId) {
    transactions = transactions.filter((t) => t.registerId === req.query.registerId);
  }

  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(transactions);
});

router.post('/', (req, res) => {
  const store = readStore();
  const register = store.registers.find((r) => r.id === req.body.registerId);
  if (!register) {
    res.status(404).json({ error: '收银台不存在' });
    return;
  }

  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    id: generateId(),
    type: req.body.type,
    registerId: register.id,
    amount: Number(req.body.amount),
    relatedHandoverId: req.body.relatedHandoverId,
    operator: req.body.operator,
    note: req.body.note,
    createdAt: now,
  };

  store.transactions.push(newTransaction);
  writeStore(store);
  res.status(201).json(newTransaction);
});

export default router;
