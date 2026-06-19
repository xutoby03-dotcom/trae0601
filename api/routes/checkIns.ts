import express from 'express';
import {
  getCheckIns,
  getCheckInById,
  createCheckIn,
  getGardenBedById,
  getVolunteerById,
} from '../data/database.js';
import { runAnomalyDetection } from '../services/anomalyService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { gardenBedId, volunteerId, limit } = req.query;
  let checkIns = getCheckIns(gardenBedId as string);
  
  if (volunteerId) {
    checkIns = checkIns.filter(c => c.volunteerId === volunteerId);
  }
  
  if (limit) {
    checkIns = checkIns.slice(0, Number(limit));
  }
  
  const checkInsWithDetails = checkIns.map(c => ({
    ...c,
    gardenBed: getGardenBedById(c.gardenBedId),
    volunteer: getVolunteerById(c.volunteerId),
  })).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  
  res.json({ success: true, data: checkInsWithDetails });
});

router.get('/:id', (req, res) => {
  const checkIn = getCheckInById(req.params.id);
  if (!checkIn) {
    return res.status(404).json({ success: false, error: '打卡记录不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...checkIn,
      gardenBed: getGardenBedById(checkIn.gardenBedId),
      volunteer: getVolunteerById(checkIn.volunteerId),
    },
  });
});

router.post('/', (req, res) => {
  const {
    gardenBedId,
    volunteerId,
    scheduleId,
    waterAmount,
    soilMoisture,
    hasPests,
    pestDetails,
    hasWeeds,
    weedLevel,
    harvestedAmount,
    notes,
    photoUrl,
  } = req.body;
  
  if (!gardenBedId || !volunteerId || waterAmount === undefined || soilMoisture === undefined) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }
  
  const gardenBed = getGardenBedById(gardenBedId);
  if (!gardenBed) {
    return res.status(404).json({ success: false, error: '菜畦不存在' });
  }
  
  const volunteer = getVolunteerById(volunteerId);
  if (!volunteer) {
    return res.status(404).json({ success: false, error: '志愿者不存在' });
  }
  
  const checkInData = {
    gardenBedId,
    volunteerId,
    scheduleId,
    checkInTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    waterAmount: Number(waterAmount),
    soilMoisture: Number(soilMoisture),
    hasPests: Boolean(hasPests),
    pestDetails: hasPests ? pestDetails : '',
    hasWeeds: Boolean(hasWeeds),
    weedLevel: hasWeeds ? weedLevel : 'none',
    harvestedAmount: Number(harvestedAmount) || 0,
    notes,
    photoUrl,
  };
  
  const newCheckIn = createCheckIn(checkInData);
  
  const anomalies = runAnomalyDetection(newCheckIn);
  
  res.json({
    success: true,
    data: {
      ...newCheckIn,
      gardenBed,
      volunteer,
      anomalies,
    },
  });
});

export default router;
