import { Router, type Request, type Response } from 'express';
import { StayRepository } from '../repositories/StayRepository.js';
import { PetRepository } from '../repositories/PetRepository.js';
import { CageRepository } from '../repositories/CageRepository.js';
import { DailyRecordRepository } from '../repositories/DailyRecordRepository.js';
import { Stay, DailyRecord } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = StayRepository.findAll(status, page, pageSize);

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error('Get stays error:', error);
    res.status(500).json({
      success: false,
      error: '获取寄养订单列表失败'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const stay = StayRepository.findById(id);

    if (!stay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: stay
    });
  } catch (error) {
    console.error('Get stay error:', error);
    res.status(500).json({
      success: false,
      error: '获取寄养订单详情失败'
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const stayData = req.body as Omit<Stay, 'id' | 'createdAt'>;

    if (!stayData.petId || !stayData.checkInDate) {
      res.status(400).json({
        success: false,
        error: '缺少必要字段'
      });
      return;
    }

    const pet = PetRepository.findById(stayData.petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const stay = StayRepository.create(stayData);

    res.status(201).json({
      success: true,
      data: stay
    });
  } catch (error) {
    console.error('Create stay error:', error);
    res.status(500).json({
      success: false,
      error: '创建寄养订单失败'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<Stay>;

    const existingStay = StayRepository.findById(id);
    if (!existingStay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    const stay = StayRepository.update(id, updates);

    res.status(200).json({
      success: true,
      data: stay
    });
  } catch (error) {
    console.error('Update stay error:', error);
    res.status(500).json({
      success: false,
      error: '更新寄养订单失败'
    });
  }
});

router.post('/:id/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { cageId, assignedStaffId } = req.body as { cageId: number; assignedStaffId?: number };

    const existingStay = StayRepository.findById(id);
    if (!existingStay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    if (!cageId) {
      res.status(400).json({
        success: false,
        error: '请选择笼位'
      });
      return;
    }

    const cage = CageRepository.findById(cageId);
    if (!cage) {
      res.status(404).json({
        success: false,
        error: '笼位不存在'
      });
      return;
    }

    if (cage.status !== 'available') {
      res.status(400).json({
        success: false,
        error: '该笼位不可用'
      });
      return;
    }

    const stay = StayRepository.checkIn(id, cageId, assignedStaffId);
    if (stay) {
      CageRepository.setOccupied(cageId, id);
    }

    res.status(200).json({
      success: true,
      data: stay,
      message: '办理入住成功'
    });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({
      success: false,
      error: '办理入住失败'
    });
  }
});

router.post('/:id/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { notes } = req.body as { notes?: string };

    const existingStay = StayRepository.findById(id);
    if (!existingStay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    if (existingStay.status !== 'checked-in') {
      res.status(400).json({
        success: false,
        error: '该订单未入住，无法退房'
      });
      return;
    }

    const stay = StayRepository.checkOut(id, notes);
    if (stay && stay.cageId) {
      CageRepository.setAvailable(stay.cageId);
    }

    res.status(200).json({
      success: true,
      data: stay,
      message: '办理退房成功'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: '办理退房失败'
    });
  }
});

router.get('/:id/records', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const stay = StayRepository.findById(id);
    if (!stay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    const records = DailyRecordRepository.findByStayId(id);

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get stay records error:', error);
    res.status(500).json({
      success: false,
      error: '获取日常记录失败'
    });
  }
});

router.post('/:id/records', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const recordData = req.body as Omit<DailyRecord, 'id' | 'createdAt'>;

    const stay = StayRepository.findById(id);
    if (!stay) {
      res.status(404).json({
        success: false,
        error: '寄养订单不存在'
      });
      return;
    }

    const record = DailyRecordRepository.create({
      ...recordData,
      stayId: id
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Add daily record error:', error);
    res.status(500).json({
      success: false,
      error: '添加日常记录失败'
    });
  }
});

export default router;
