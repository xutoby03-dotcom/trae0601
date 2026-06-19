import type { CheckIn, Anomaly, GardenBed } from '../../shared/types.js';
import { getRecentCheckInsForGardenBed, createAnomaly, getGardenBedById, getCheckIns } from '../data/database.js';
import { differenceInHours } from 'date-fns';

export const detectDuplicateWatering = (checkIn: CheckIn): Anomaly | null => {
  const recentCheckIns = getRecentCheckInsForGardenBed(checkIn.gardenBedId, 4);
  const previousCheckIn = recentCheckIns.find(c => c.id !== checkIn.id);
  
  if (previousCheckIn) {
    const hoursSince = differenceInHours(
      new Date(checkIn.checkInTime),
      new Date(previousCheckIn.checkInTime)
    );
    
    if (hoursSince < 4) {
      const gardenBed = getGardenBedById(checkIn.gardenBedId);
      return {
        id: '',
        checkInId: checkIn.id,
        gardenBedId: checkIn.gardenBedId,
        type: 'duplicate_watering' as const,
        severity: 'warning' as const,
        message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）在${hoursSince}小时前刚被浇水过`,
        description: `短时间内重复浇水，可能导致水量过多。建议志愿者之间加强沟通，或在打卡前先查看近期记录。`,
        status: 'pending' as const,
        resolved: false,
        createdAt: new Date().toISOString(),
      };
    }
  }
  
  return null;
};

export const detectMissedWatering = (gardenBed: GardenBed): Anomaly | null => {
  if (!gardenBed.lastWateredAt) return null;
  
  const hoursSinceLastWater = differenceInHours(new Date(), new Date(gardenBed.lastWateredAt));
  const maxHoursWithoutWater = gardenBed.wateringFrequency * 24;
  
  if (hoursSinceLastWater > maxHoursWithoutWater * 2) {
    return {
      id: '',
      gardenBedId: gardenBed.id,
      type: 'missed_watering' as const,
      severity: 'critical' as const,
      message: `菜畦${gardenBed.bedNumber}（${gardenBed.crop}）已超过${Math.floor(hoursSinceLastWater)}小时未浇水，情况严重！`,
      description: `浇水严重滞后，作物可能因缺水受损。请立即浇水并检查作物状态。`,
      status: 'pending' as const,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
  }
  
  if (hoursSinceLastWater > maxHoursWithoutWater) {
    return {
      id: '',
      gardenBedId: gardenBed.id,
      type: 'missed_watering' as const,
      severity: 'warning' as const,
      message: `菜畦${gardenBed.bedNumber}（${gardenBed.crop}）已超过${Math.floor(hoursSinceLastWater)}小时未浇水，请尽快安排`,
      description: `已超过建议浇水间隔，请尽快安排志愿者浇水。`,
      status: 'pending' as const,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
  }
  
  return null;
};

export const detectPestInfestation = (checkIn: CheckIn): Anomaly | null => {
  if (!checkIn.hasPests || !checkIn.pestDetails) return null;
  
  const severeKeywords = ['蚜虫', '红蜘蛛', '白粉虱', '严重', '大量', '很多'];
  const isSevere = severeKeywords.some(keyword => 
    checkIn.pestDetails!.includes(keyword)
  );
  
  const recentCheckIns = getRecentCheckInsForGardenBed(checkIn.gardenBedId, 72);
  const consecutivePestReports = recentCheckIns.filter(c => c.hasPests).length;
  
  if (isSevere || consecutivePestReports >= 2) {
    const gardenBed = getGardenBedById(checkIn.gardenBedId);
    return {
      id: '',
      checkInId: checkIn.id,
      gardenBedId: checkIn.gardenBedId,
      type: 'pest_infestation' as const,
      severity: (consecutivePestReports >= 2 ? 'critical' : 'warning') as 'critical' | 'warning',
      message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）发现虫害：${checkIn.pestDetails}`,
      description: `检测到虫害问题：${checkIn.pestDetails}。建议使用有机方式处理，并持续观察后续情况。`,
      status: 'pending' as const,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
  }
  
  return null;
};

export const detectExcessiveWeeds = (checkIn: CheckIn): Anomaly | null => {
  if (!checkIn.hasWeeds || !checkIn.weedLevel) return null;
  
  const recentCheckIns = getRecentCheckInsForGardenBed(checkIn.gardenBedId, 48);
  const consecutiveModerateWeeds = recentCheckIns.filter(
    c => c.weedLevel === 'moderate' || c.weedLevel === 'severe'
  ).length;
  
  if (checkIn.weedLevel === 'severe' || consecutiveModerateWeeds >= 2) {
    const gardenBed = getGardenBedById(checkIn.gardenBedId);
    return {
      id: '',
      checkInId: checkIn.id,
      gardenBedId: checkIn.gardenBedId,
      type: 'excessive_weeds' as const,
      severity: (checkIn.weedLevel === 'severe' ? 'warning' : 'info') as 'warning' | 'info',
      message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）杂草情况：${checkIn.weedLevel === 'severe' ? '严重' : '中等'}，建议及时清理`,
      description: `杂草问题持续存在，会与作物争夺养分。建议尽快组织清理。`,
      status: 'pending' as const,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
  }
  
  return null;
};

export const runAnomalyDetection = (checkIn: CheckIn): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  
  const duplicateWatering = detectDuplicateWatering(checkIn);
  if (duplicateWatering) anomalies.push(duplicateWatering);
  
  const pestInfestation = detectPestInfestation(checkIn);
  if (pestInfestation) anomalies.push(pestInfestation);
  
  const excessiveWeeds = detectExcessiveWeeds(checkIn);
  if (excessiveWeeds) anomalies.push(excessiveWeeds);
  
  const savedAnomalies = anomalies.map(a => createAnomaly(a));
  
  return savedAnomalies;
};

export const runDailyMissedWateringCheck = (): Anomaly[] => {
  const gardenBeds = getCheckIns.length > 0 ? 
    require('../data/database.js').getGardenBeds() : [];
  const anomalies: Anomaly[] = [];
  
  if (gardenBeds.length > 0) {
    for (const gardenBed of gardenBeds) {
      const anomaly = detectMissedWatering(gardenBed);
      if (anomaly) {
        anomalies.push(createAnomaly(anomaly));
      }
    }
  }
  
  return anomalies;
};
