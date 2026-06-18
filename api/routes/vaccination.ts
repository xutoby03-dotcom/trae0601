import { Router, type Request, type Response } from 'express';
import { PetRepository } from '../repositories/PetRepository.js';
import { VaccineRepository } from '../repositories/VaccineRepository.js';
import { validateVaccinations } from '../utils/vaccineValidator.js';
import { VaccinationCheckResult } from '../../shared/types.js';

const router = Router();

router.get('/check/:petId', async (req: Request, res: Response): Promise<void> => {
  try {
    const petId = parseInt(req.params.petId);

    const pet = PetRepository.findById(petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
      return;
    }

    const vaccines = VaccineRepository.findByPetId(petId);
    const result = validateVaccinations(pet, vaccines);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Vaccination check error:', error);
    res.status(500).json({
      success: false,
      error: '疫苗核验失败'
    });
  }
});

router.post('/verify/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
    const recordId = parseInt(req.params.recordId);
    const { verified, notes, verifiedBy } = req.body as { verified: boolean; notes?: string; verifiedBy: number };

    const vaccine = VaccineRepository.findById(recordId);
    if (!vaccine) {
      res.status(404).json({
        success: false,
        error: '疫苗记录不存在'
      });
      return;
    }

    if (!verifiedBy) {
      res.status(400).json({
        success: false,
        error: '缺少核验人信息'
      });
      return;
    }

    const updatedVaccine = VaccineRepository.verify(recordId, verifiedBy, notes);

    res.status(200).json({
      success: true,
      data: updatedVaccine
    });
  } catch (error) {
    console.error('Vaccine verify error:', error);
    res.status(500).json({
      success: false,
      error: '疫苗核验失败'
    });
  }
});

router.get('/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const { StayRepository } = await import('../repositories/StayRepository.js');
    const pendingStays = StayRepository.findPendingVaccination();

    const results: Array<{
      stay: typeof pendingStays[0];
      checkResult: VaccinationCheckResult;
    }> = [];

    for (const stay of pendingStays) {
      const vaccines = VaccineRepository.findByPetId(stay.petId);
      const checkResult = validateVaccinations(stay.pet, vaccines);
      results.push({
        stay,
        checkResult
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get pending vaccination error:', error);
    res.status(500).json({
      success: false,
      error: '获取待核验列表失败'
    });
  }
});

export default router;
