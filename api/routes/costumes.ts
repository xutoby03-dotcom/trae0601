import { Router } from 'express';
import {
  getCostumes,
  getCostumeById,
  createCostume,
  updateCostume,
  deleteCostume,
  markAsWashed,
  getWashList,
} from '../services/costumeService';

const router = Router();

router.get('/', (req, res) => {
  try {
    const query = {
      status: req.query.status as string,
      wash_status: req.query.wash_status as string,
      size: req.query.size as string,
      program: req.query.program as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    };
    const result = getCostumes(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/wash-list', (_req, res) => {
  try {
    const list = getWashList();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const costume = getCostumeById(req.params.id);
    if (!costume) {
      res.status(404).json({ error: '服装不存在' });
      return;
    }
    res.json(costume);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req, res) => {
  try {
    const costume = createCostume(req.body);
    res.status(201).json(costume);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const costume = updateCostume(req.params.id, req.body);
    if (!costume) {
      res.status(404).json({ error: '服装不存在' });
      return;
    }
    res.json(costume);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/wash', (req, res) => {
  try {
    const costume = markAsWashed(req.params.id);
    if (!costume) {
      res.status(404).json({ error: '服装不存在' });
      return;
    }
    res.json(costume);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const success = deleteCostume(req.params.id);
    if (!success) {
      res.status(404).json({ error: '服装不存在' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
