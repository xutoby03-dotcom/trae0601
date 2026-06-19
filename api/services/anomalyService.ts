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
        type: 'duplicate_watering',
        severity: 'warning',
        message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）在${hoursSince}小时前刚被浇水过`,
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
      type: 'missed_watering',
      severity: 'critical',
      message: `菜畦${gardenBed.bedNumber}（${gardenBed.crop}）已超过${Math.floor(hoursSinceLastWater)}小时未浇水，情况严重！`,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
  }
  
  if (hoursSinceLastWater > maxHoursWithoutWater) {
    return {
      id: '',
      gardenBedId: gardenBed.id,
      type: 'missed_watering',
      severity: 'warning',
      message: `菜畦${gardenBed.bedNumber}（${gardenBed.crop}）已超过${Math.floor(hoursSinceLastWater)}小时未浇水，请尽快安排`,
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
      type: 'pest_infestation',
      severity: consecutivePestReports >= 2 ? 'critical' : 'warning',
      message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）发现虫害：${checkIn.pestDetails}`,
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
      type: 'excessive_weeds',
      severity: checkIn.weedLevel === 'severe' ? 'warning' : 'info',
      message: `菜畦${gardenBed?.bedNumber || ''}（${gardenBed?.crop || ''}）杂草情况：${checkIn.weedLevel === 'severe' ? '严重' : '中等'}，建议及时清理`,
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
