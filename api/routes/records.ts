import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req, res) => {
  const records = store.getRecords();
  res.json(records);
});

router.get('/left-items', (req, res) => {
  const leftItems = store.getLeftItems();
  res.json(leftItems);
});

export default router;
