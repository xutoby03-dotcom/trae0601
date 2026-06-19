import express from 'express';
import {
  getGardenBeds,
  getSchedules,
  getCheckIns,
  getAnomalies,
  getVolunteers,
} from '../data/database.js';
import { CROP_GROWTH_CYCLES } from '../../shared/types.js';
import { differenceInDays, format, startOfWeek, addDays } from 'date-fns';

const router = express.Router();

const aggregateDailyWaterUsage = (checkIns: { checkInTime: string; waterAmount: number }[], days: number, fromToday = false) => {
  const result: { date: string; amount: number }[] = [];
  const today = new Date();
  const start = fromToday ? addDays(today, -(days - 1)) : startOfWeek(today, { weekStartsOn: 1 });
  const actualDays = fromToday ? days : 7;

  for (let i = 0; i < actualDays; i++) {
    const dateStr = format(addDays(start, i), 'yyyy-MM-dd');
    const dayCheckIns = checkIns.filter(c => c.checkInTime.startsWith(dateStr));
    const totalWater = dayCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);
    result.push({ date: dateStr, amount: totalWater });
  }
  return result;
};

router.get('/dashboard', (req, res) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySchedules = getSchedules(today);
  
  const scheduleStats = {
    total: todaySchedules.length,
    completed: todaySchedules.filter(s => s.status === 'completed').length,
    inProgress: todaySchedules.filter(s => s.status === 'claimed').length,
    unclaimed: todaySchedules.filter(s => s.status === 'unclaimed').length,
  };
  
  const anomalies = getAnomalies(false);
  const gardenBeds = getGardenBeds();
  const checkIns = getCheckIns();
  
  const cropGrowthStatus = gardenBeds.map(bed => {
    const growthCycle = CROP_GROWTH_CYCLES[bed.crop] || CROP_GROWTH_CYCLES['默认'];
    const daysSincePlanted = differenceInDays(new Date(), new Date(bed.plantDate));
    const progress = Math.min(100, Math.round((daysSincePlanted / growthCycle) * 100));
    return { gardenBed: bed, growthProgress: progress };
  });
  
  const readyToHarvest = gardenBeds.filter(bed => bed.status === 'harvesting');
  
  const waterUsageThisWeek = aggregateDailyWaterUsage(checkIns, 7, false);
  const waterUsageThisMonth = aggregateDailyWaterUsage(checkIns, 30, true);
  
  res.json({
    success: true,
    data: {
      todaySchedules: scheduleStats,
      anomaliesCount: anomalies.length,
      waterUsageThisWeek,
      waterUsageThisMonth,
      readyToHarvest,
      cropGrowthStatus,
    },
  });
});

router.get('/water-usage', (req, res) => {
  const { period = 'week' } = req.query;
  const checkIns = getCheckIns();
  
  if (period === 'week') {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const dailyUsage = [];
    
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.checkInTime.startsWith(date));
      const totalWater = dayCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);
      dailyUsage.push({ date, amount: totalWater });
    }
    
    res.json({ success: true, data: dailyUsage });
  } else if (period === 'month') {
    const monthlyUsage = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = format(addDays(today, -i), 'yyyy-MM-dd');
      const dayCheckIns = checkIns.filter(c => c.checkInTime.startsWith(date));
      const totalWater = dayCheckIns.reduce((sum, c) => sum + c.waterAmount, 0);
      monthlyUsage.push({ date, amount: totalWater });
    }
    
    res.json({ success: true, data: monthlyUsage });
  }
});

router.get('/overview', (req, res) => {
  const gardenBeds = getGardenBeds();
  const checkIns = getCheckIns();
  const volunteers = getVolunteers();
  const anomalies = getAnomalies();
  
  const totalWaterUsed = checkIns.reduce((sum, c) => sum + c.waterAmount, 0);
  const totalHarvested = checkIns.reduce((sum, c) => sum + c.harvestedAmount, 0);
  
  const cropStats = gardenBeds.reduce((acc, bed) => {
    acc[bed.crop] = (acc[bed.crop] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusStats = gardenBeds.reduce((acc, bed) => {
    acc[bed.status] = (acc[bed.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    success: true,
    data: {
      totalGardenBeds: gardenBeds.length,
      totalVolunteers: volunteers.length,
      totalCheckIns: checkIns.length,
      totalWaterUsed,
      totalHarvested,
      totalAnomalies: anomalies.length,
      unresolvedAnomalies: anomalies.filter(a => !a.resolved).length,
      cropStats,
      statusStats,
      topVolunteers: [...volunteers].sort((a, b) => b.totalWaterings - a.totalWaterings).slice(0, 5),
    },
  });
});

export default router;
