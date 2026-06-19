import { Router } from 'express';
import { store } from '../store';
import type { InventoryType } from '../../shared/types';

const router = Router();

router.get('/', (_req, res) => {
  res.json(store.getInventory());
});

router.put('/:type', (req, res) => {
  const type = req.params.type as InventoryType;
  const { total, used } = req.body;
  const data: { total?: number; used?: number } = {};
  if (typeof total === 'number') data.total = total;
  if (typeof used === 'number') data.used = used;
  const updated = store.updateInventory(type, data);
  if (!updated) {
    res.status(404).json({ error: '库存类型不存在' });
    return;
  }
  res.json(updated);
});

router.put('/:type/storage', (req, res) => {
  const type = req.params.type as InventoryType;
  const { storage } = req.body;
  if (!storage) {
    res.status(400).json({ error: '存放点不能为空' });
    return;
  }
  const updated = store.updateInventory(type, { storage });
  if (!updated) {
    res.status(404).json({ error: '库存类型不存在' });
    return;
  }
  res.json(updated);
});

export default router;
