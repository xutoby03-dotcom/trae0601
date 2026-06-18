import { Router, type Request, type Response } from 'express';
import { StayRepository } from '../repositories/StayRepository.js';
import { VaccineRepository } from '../repositories/VaccineRepository.js';
import { PetRepository } from '../repositories/PetRepository.js';
import { DailyRecordRepository } from '../repositories/DailyRecordRepository.js';
import { validateVaccinations } from '../utils/vaccineValidator.js';
import { Pet, VaccineRecord, DashboardStats, ExpiringVaccineItem, PendingMaterialItem, HighRiskItem } from '../../shared/types.js';

const router = Router();

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const todayCheckIn = StayRepository.findTodayCheckIn();
    const todayCheckOut = StayRepository.findTodayCheckOut();
    const currentlyStaying = StayRepository.findCurrentlyStaying();
    const isolationCount = StayRepository.findIsolationCount();
    const highRiskCount = StayRepository.findHighRiskCount();
    const abnormalCount = DailyRecordRepository.getAbnormalCountToday();

    const pendingStays = StayRepository.findPendingVaccination();

    const stats: DashboardStats = {
      todayCheckIn,
      todayCheckOut,
      currentlyStaying,
      pendingMaterials: pendingStays.length,
      isolationCount,
      highRiskCount
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: '获取看板统计数据失败'
    });
  }
});

router.get('/expiring-vaccines', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const expiringVaccines = VaccineRepository.findExpiring(days);

    const result: ExpiringVaccineItem[] = [];
    for (const vaccine of expiringVaccines) {
      const pet = PetRepository.findById(vaccine.petId);
      if (pet) {
        const { daysRemaining, ...vaccineData } = vaccine;
        result.push({
          pet,
          vaccine: vaccineData as VaccineRecord,
          daysRemaining: vaccine.daysRemaining
        });
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get expiring vaccines error:', error);
    res.status(500).json({
      success: false,
      error: '获取临期疫苗列表失败'
    });
  }
});

router.get('/pending-materials', async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingStays = StayRepository.findPendingVaccination();

    const result: PendingMaterialItem[] = [];
    for (const stay of pendingStays) {
      const vaccines = VaccineRepository.findByPetId(stay.petId);
      const checkResult = validateVaccinations(stay.pet, vaccines);

      if (checkResult.missingDocuments.length > 0 || !checkResult.overallPass) {
        result.push({
          pet: stay.pet,
          stay,
          missingItems: checkResult.missingDocuments,
          submittedAt: stay.createdAt
        });
      }
    }

    const pets = PetRepository.findAll(1, 100);
    for (const pet of pets.data) {
      const hasStay = pendingStays.some(s => s.petId === pet.id);
      if (!hasStay) {
        const vaccines = VaccineRepository.findByPetId(pet.id);
        const checkResult = validateVaccinations(pet, vaccines);
        if (checkResult.missingDocuments.length > 0 || checkResult.warnings.length > 0) {
          result.push({
            pet,
            missingItems: checkResult.missingDocuments,
            submittedAt: pet.createdAt
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get pending materials error:', error);
    res.status(500).json({
      success: false,
      error: '获取待补材料列表失败'
    });
  }
});

router.get('/high-risk', async (req: Request, res: Response): Promise<void> => {
  try {
    const highRiskStays = StayRepository.findHighRiskStays();

    const result: HighRiskItem[] = [];
    for (const stay of highRiskStays) {
      const riskReasons: string[] = [];
      if (stay.highRisk) {
        riskReasons.push(stay.highRiskReason || '高风险');
      }
      if (stay.requiresIsolation) {
        riskReasons.push('需要隔离');
      }

      const vaccines = VaccineRepository.findByPetId(stay.petId);
      const checkResult = validateVaccinations(stay.pet, vaccines);
      if (!checkResult.overallPass) {
        riskReasons.push('疫苗不齐全');
      }

      result.push({
        pet: stay.pet,
        stay,
        riskReasons
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get high risk pets error:', error);
    res.status(500).json({
      success: false,
      error: '获取高风险宠物列表失败'
    });
  }
});

export default router;
