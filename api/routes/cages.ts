import { Router, type Request, type Response } from 'express';
import { CageRepository } from '../repositories/CageRepository.js';
import { Cage } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;
    const status = req.query.status as string;
    const suitableFor = req.query.suitableFor as string;

    const cages = CageRepository.findAll(type, status, suitableFor);

    res.status(200).json({
      success: true,
      data: cages
    });
  } catch (error) {
    console.error('Get cages error:', error);
    res.status(500).json({
      success: false,
      error: '获取笼位列表失败'
    });
  }
});

router.get('/available', async (req: Request, res: Response): Promise<void> => {
  try {
    const checkInDate = req.query.checkInDate as string;
    const checkOutDate = req.query.checkOutDate as string;
    const suitableFor = req.query.suitableFor as string;

    if (!checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        error: '请提供入住和退房日期'
      });
      return;
    }

    const cages = CageRepository.findAvailable(checkInDate, checkOutDate, suitableFor);

    res.status(200).json({
      success: true,
      data: cages
    });
  } catch (error) {
    console.error('Get available cages error:', error);
    res.status(500).json({
      success: false,
      error: '获取可用笼位失败'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const cage = CageRepository.findById(id);

    if (!cage) {
      res.status(404).json({
        success: false,
        error: '笼位不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: cage
    });
  } catch (error) {
    console.error('Get cage error:', error);
    res.status(500).json({
      success: false,
      error: '获取笼位详情失败'
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const cageData = req.body as Omit<Cage, 'id'>;

    if (!cageData.code || !cageData.name || !cageData.type || !cageData.suitableFor || !cageData.size) {
      res.status(400).json({
        success: false,
        error: '缺少必要字段'
      });
      return;
    }

    const existingCage = CageRepository.findByCode(cageData.code);
    if (existingCage) {
      res.status(400).json({
        success: false,
        error: '笼位编号已存在'
      });
      return;
    }

    const cage = CageRepository.create(cageData);

    res.status(201).json({
      success: true,
      data: cage
    });
  } catch (error) {
    console.error('Create cage error:', error);
    res.status(500).json({
      success: false,
      error: '创建笼位失败'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<Cage>;

    const existingCage = CageRepository.findById(id);
    if (!existingCage) {
      res.status(404).json({
        success: false,
        error: '笼位不存在'
      });
      return;
    }

    const cage = CageRepository.update(id, updates);

    res.status(200).json({
      success: true,
      data: cage
    });
  } catch (error) {
    console.error('Update cage error:', error);
    res.status(500).json({
      success: false,
      error: '更新笼位失败'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const existingCage = CageRepository.findById(id);
    if (!existingCage) {
      res.status(404).json({
        success: false,
        error: '笼位不存在'
      });
      return;
    }

    if (existingCage.status === 'occupied') {
      res.status(400).json({
        success: false,
        error: '笼位正在使用中，无法删除'
      });
      return;
    }

    const success = CageRepository.delete(id);

    res.status(200).json({
      success,
      message: success ? '删除成功' : '删除失败'
    });
  } catch (error) {
    console.error('Delete cage error:', error);
    res.status(500).json({
      success: false,
      error: '删除笼位失败'
    });
  }
});

export default router;
