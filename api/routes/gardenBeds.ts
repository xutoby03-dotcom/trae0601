import express from 'express';
import {
  getGardenBeds,
  getGardenBedById,
  createGardenBed,
  updateGardenBed,
  deleteGardenBed,
  getCheckIns,
} from '../data/database.js';
import { CROP_GROWTH_CYCLES } from '../../shared/types.js';
import { differenceInDays } from 'date-fns';

const router = express.Router();

router.get('/', (req, res) => {
  const { crop, growerName, status } = req.query;
  let beds = getGardenBeds();
  
  if (crop) {
    beds = beds.filter(b => b.crop.includes(String(crop)));
  }
  if (growerName) {
    beds = beds.filter(b => b.growerName.includes(String(growerName)));
  }
  if (status) {
    beds = beds.filter(b => b.status === status);
  }
  
  res.json({ success: true, data: beds });
});

router.get('/:id', (req, res) => {
  const bed = getGardenBedById(req.params.id);
  if (!bed) {
    return res.status(404).json({ success: false, error: '菜畦不存在' });
  }
  
  const checkIns = getCheckIns(req.params.id);
  
  res.json({
    success: true,
    data: {
      ...bed,
      recentCheckIns: checkIns.slice(0, 10),
    },
  });
});

router.post('/', (req, res) => {
  const {
    bedNumber,
    growerName,
    crop,
    plantDate,
    wateringFrequency,
    shadeCondition,
    photoUrl,
  } = req.body;
  
  if (!bedNumber || !growerName || !crop || !plantDate || !wateringFrequency || !shadeCondition) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }
  
  const growthCycle = CROP_GROWTH_CYCLES[crop] || CROP_GROWTH_CYCLES['默认'];
  const daysSincePlanted = differenceInDays(new Date(), new Date(plantDate));
  const progress = Math.min(100, (daysSincePlanted / growthCycle) * 100);
  
  let status: 'seedling' | 'growing' | 'mature' | 'harvesting' = 'seedling';
  if (progress >= 90) status = 'harvesting';
  else if (progress >= 70) status = 'mature';
  else if (progress >= 20) status = 'growing';
  
  const newBed = createGardenBed({
    bedNumber,
    growerName,
    crop,
    plantDate,
    wateringFrequency: Number(wateringFrequency),
    shadeCondition,
    status,
    photoUrl,
  });
  
  res.json({ success: true, data: newBed });
});

router.put('/:id', (req, res) => {
  const updates = req.body;
  const updatedBed = updateGardenBed(req.params.id, updates);
  
  if (!updatedBed) {
    return res.status(404).json({ success: false, error: '菜畦不存在' });
  }
  
  res.json({ success: true, data: updatedBed });
});

router.delete('/:id', (req, res) => {
  const deleted = deleteGardenBed(req.params.id);
  
  if (!deleted) {
    return res.status(404).json({ success: false, error: '菜畦不存在' });
  }
  
  res.json({ success: true, message: '删除成功' });
});

export default router;
