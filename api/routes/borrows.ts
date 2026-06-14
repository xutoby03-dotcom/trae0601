import { Router } from 'express';
import {
  getBorrowRecords,
  getBorrowRecordById,
  createBorrowRecord,
  returnCostume,
  getOverdueRecords,
  getActiveBorrowByCostume,
} from '../services/borrowService';

const router = Router();

router.get('/', (req, res) => {
  try {
    const query = {
      status: req.query.status as string,
      costume_id: req.query.costume_id as string,
      club_name: req.query.club_name as string,
      student_name: req.query.student_name as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    };
    const result = getBorrowRecords(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/overdue', (_req, res) => {
  try {
    const records = getOverdueRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/active-by-costume/:costumeId', (req, res) => {
  try {
    const record = getActiveBorrowByCostume(req.params.costumeId);
    res.json(record || null);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const record = getBorrowRecordById(parseInt(req.params.id));
    if (!record) {
      res.status(404).json({ error: '借用记录不存在' });
      return;
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const record = createBorrowRecord(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/return', (req, res) => {
  try {
    const record = returnCostume(parseInt(req.params.id), req.body);
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
