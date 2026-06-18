import { Router, type Request, type Response } from 'express';
import { DailyRecordRepository } from '../repositories/DailyRecordRepository.js';
import { DailyRecord } from '../../shared/types.js';

const router = Router();

router.get('/today', async (req: Request, res: Response): Promise<void> => {
  try {
    const records = DailyRecordRepository.findTodayRecords();

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get today records error:', error);
    res.status(500).json({
      success: false,
      error: '获取今日待记录列表失败'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const record = DailyRecordRepository.findById(id);

    if (!record) {
      res.status(404).json({
        success: false,
        error: '记录不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get daily record error:', error);
    res.status(500).json({
      success: false,
      error: '获取日常记录失败'
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const recordData = req.body as Omit<DailyRecord, 'id' | 'createdAt'>;

    if (!recordData.stayId || !recordData.recordDate || !recordData.feeding || !recordData.defecation || !recordData.mentalState || !recordData.recordedBy) {
      res.status(400).json({
        success: false,
        error: '缺少必要字段'
      });
      return;
    }

    const record = DailyRecordRepository.create(recordData);

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Create daily record error:', error);
    res.status(500).json({
      success: false,
      error: '创建日常记录失败'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<DailyRecord>;

    const existingRecord = DailyRecordRepository.findById(id);
    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: '记录不存在'
      });
      return;
    }

    const record = DailyRecordRepository.update(id, updates);

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Update daily record error:', error);
    res.status(500).json({
      success: false,
      error: '更新日常记录失败'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const existingRecord = DailyRecordRepository.findById(id);
    if (!existingRecord) {
      res.status(404).json({
        success: false,
        error: '记录不存在'
      });
      return;
    }

    const success = DailyRecordRepository.delete(id);

    res.status(200).json({
      success,
      message: success ? '删除成功' : '删除失败'
    });
  } catch (error) {
    console.error('Delete daily record error:', error);
    res.status(500).json({
      success: false,
      error: '删除日常记录失败'
    });
  }
});

export default router;
