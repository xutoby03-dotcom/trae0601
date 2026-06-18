import { Router, type Request, type Response } from 'express';
import { PetRepository } from '../repositories/PetRepository.js';
import { VaccineRepository } from '../repositories/VaccineRepository.js';
import { StayRepository } from '../repositories/StayRepository.js';
import { Pet, VaccineRecord, Stay } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const keyword = req.query.keyword as string;
    const species = req.query.species as string;

    const result = PetRepository.findAll(page, pageSize, keyword, species);

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      error: '获取宠物列表失败'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const pet = PetRepository.findById(id);

    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      error: '获取宠物详情失败'
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const petData = req.body as Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;

    if (!petData.name || !petData.species || !petData.breed || !petData.ownerName || !petData.ownerPhone) {
      res.status(400).json({
        success: false,
        error: '缺少必要字段'
      });
      return;
    }

    const pet = PetRepository.create(petData);

    res.status(201).json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: '创建宠物档案失败'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as Partial<Pet>;

    const existingPet = PetRepository.findById(id);
    if (!existingPet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const pet = PetRepository.update(id, updates);

    res.status(200).json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: '更新宠物档案失败'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const existingPet = PetRepository.findById(id);
    if (!existingPet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const success = PetRepository.delete(id);

    res.status(200).json({
      success,
      message: success ? '删除成功' : '删除失败'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: '删除宠物档案失败'
    });
  }
});

router.get('/:id/vaccines', async (req: Request, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);

    const pet = PetRepository.findById(petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const vaccines = VaccineRepository.findByPetId(petId);

    res.status(200).json({
      success: true,
      data: vaccines
    });
  } catch (error) {
    console.error('Get pet vaccines error:', error);
    res.status(500).json({
      success: false,
      error: '获取疫苗记录失败'
    });
  }
});

router.post('/:id/vaccines', async (req: Request, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);
    const vaccineData = req.body as Omit<VaccineRecord, 'id'>;

    const pet = PetRepository.findById(petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const vaccine = VaccineRepository.create({
      ...vaccineData,
      petId
    });

    res.status(201).json({
      success: true,
      data: vaccine
    });
  } catch (error) {
    console.error('Add vaccine error:', error);
    res.status(500).json({
      success: false,
      error: '添加疫苗记录失败'
    });
  }
});

router.get('/:id/stays', async (req: Request, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.id);

    const pet = PetRepository.findById(petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const stays = StayRepository.findByPetId(petId);

    res.status(200).json({
      success: true,
      data: stays
    });
  } catch (error) {
    console.error('Get pet stays error:', error);
    res.status(500).json({
      success: false,
      error: '获取寄养历史失败'
    });
  }
});

export default router;
