import express from 'express';
import {
  getSchedules,
  getScheduleById,
  claimSchedule,
  updateSchedule,
  createSchedule,
  getGardenBedById,
  getVolunteerById,
} from '../data/database.js';
import { shouldIncreaseWatering } from '../services/weatherService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { date, gardenBedId, volunteerId } = req.query;
  let schedules = getSchedules(date as string);
  
  if (gardenBedId) {
    schedules = schedules.filter(s => s.gardenBedId === gardenBedId);
  }
  if (volunteerId) {
    schedules = schedules.filter(s => s.volunteerId === volunteerId);
  }
  
  const schedulesWithDetails = schedules.map(s => ({
    ...s,
    gardenBed: getGardenBedById(s.gardenBedId),
    volunteer: s.volunteerId ? getVolunteerById(s.volunteerId) : undefined,
  }));
  
  res.json({ success: true, data: schedulesWithDetails });
});

router.get('/:id', (req, res) => {
  const schedule = getScheduleById(req.params.id);
  if (!schedule) {
    return res.status(404).json({ success: false, error: '排班不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...schedule,
      gardenBed: getGardenBedById(schedule.gardenBedId),
      volunteer: schedule.volunteerId ? getVolunteerById(schedule.volunteerId) : undefined,
    },
  });
});

router.post('/', (req, res) => {
  const { gardenBedId, scheduledDate, timeSlot } = req.body;
  
  if (!gardenBedId || !scheduledDate || !timeSlot) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }
  
  const gardenBed = getGardenBedById(gardenBedId);
  if (!gardenBed) {
    return res.status(404).json({ success: false, error: '菜畦不存在' });
  }
  
  const newSchedule = createSchedule({
    gardenBedId,
    scheduledDate,
    timeSlot,
    status: 'unclaimed',
  });
  
  res.json({ success: true, data: newSchedule });
});

router.post('/:id/claim', (req, res) => {
  const { volunteerId } = req.body;
  
  if (!volunteerId) {
    return res.status(400).json({ success: false, error: '缺少志愿者ID' });
  }
  
  const volunteer = getVolunteerById(volunteerId);
  if (!volunteer) {
    return res.status(404).json({ success: false, error: '志愿者不存在' });
  }
  
  const claimedSchedule = claimSchedule(req.params.id, volunteerId);
  if (!claimedSchedule) {
    return res.status(400).json({ success: false, error: '排班不存在或已被认领' });
  }
  
  res.json({
    success: true,
    data: {
      ...claimedSchedule,
      gardenBed: getGardenBedById(claimedSchedule.gardenBedId),
      volunteer,
    },
  });
});

router.put('/:id', (req, res) => {
  const updates = req.body;
  const updatedSchedule = updateSchedule(req.params.id, updates);
  
  if (!updatedSchedule) {
    return res.status(404).json({ success: false, error: '排班不存在' });
  }
  
  res.json({ success: true, data: updatedSchedule });
});

router.get('/generate/week', (req, res) => {
  const { startDate } = req.query;
  const today = startDate ? new Date(String(startDate)) : new Date();
  const gardenBeds = getGardenBedById ? require('../data/database.js').getGardenBeds() : [];
  const { frequencyMultiplier } = shouldIncreaseWatering();
  
  const timeSlots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
  const newSchedules = [];
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    for (const bed of gardenBeds) {
      const adjustedFrequency = Math.max(1, Math.ceil(bed.wateringFrequency / frequencyMultiplier));
      
      if (day % adjustedFrequency === 0) {
        const slotIndex = Math.floor(Math.random() * 3);
        const schedule = createSchedule({
          gardenBedId: bed.id,
          scheduledDate: dateStr,
          timeSlot: timeSlots[slotIndex],
          status: 'unclaimed',
        });
        newSchedules.push(schedule);
      }
    }
  }
  
  res.json({ success: true, data: newSchedules, count: newSchedules.length });
});

export default router;
