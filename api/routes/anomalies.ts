import express from 'express';
import {
  getAnomalies,
  getAnomalyById,
  resolveAnomaly,
  getGardenBedById,
  getCheckInById,
} from '../data/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { resolved, type, gardenBedId } = req.query;
  let anomalies = getAnomalies(
    resolved !== undefined ? resolved === 'true' : undefined
  );
  
  if (type) {
    anomalies = anomalies.filter(a => a.type === type);
  }
  if (gardenBedId) {
    anomalies = anomalies.filter(a => a.gardenBedId === gardenBedId);
  }
  
  const anomaliesWithDetails = anomalies.map(a => ({
    ...a,
    gardenBed: a.gardenBedId ? getGardenBedById(a.gardenBedId) : undefined,
    checkIn: a.checkInId ? getCheckInById(a.checkInId) : undefined,
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json({ success: true, data: anomaliesWithDetails });
});

router.get('/:id', (req, res) => {
  const anomaly = getAnomalyById(req.params.id);
  if (!anomaly) {
    return res.status(404).json({ success: false, error: '异常记录不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...anomaly,
      gardenBed: anomaly.gardenBedId ? getGardenBedById(anomaly.gardenBedId) : undefined,
      checkIn: anomaly.checkInId ? getCheckInById(anomaly.checkInId) : undefined,
    },
  });
});

router.put('/:id/resolve', (req, res) => {
  const { resolvedBy } = req.body;
  
  if (!resolvedBy) {
    return res.status(400).json({ success: false, error: '缺少处理人ID' });
  }
  
  const resolvedAnomaly = resolveAnomaly(req.params.id, resolvedBy);
  if (!resolvedAnomaly) {
    return res.status(404).json({ success: false, error: '异常记录不存在' });
  }
  
  res.json({
    success: true,
    data: {
      ...resolvedAnomaly,
      gardenBed: resolvedAnomaly.gardenBedId ? getGardenBedById(resolvedAnomaly.gardenBedId) : undefined,
    },
  });
});

router.get('/stats/summary', (req, res) => {
  const allAnomalies = getAnomalies();
  
  const stats = {
    total: allAnomalies.length,
    unresolved: allAnomalies.filter(a => !a.resolved).length,
    byType: {
      duplicate_watering: allAnomalies.filter(a => a.type === 'duplicate_watering').length,
      missed_watering: allAnomalies.filter(a => a.type === 'missed_watering').length,
      pest_infestation: allAnomalies.filter(a => a.type === 'pest_infestation').length,
      excessive_weeds: allAnomalies.filter(a => a.type === 'excessive_weeds').length,
    },
    bySeverity: {
      info: allAnomalies.filter(a => a.severity === 'info').length,
      warning: allAnomalies.filter(a => a.severity === 'warning').length,
      critical: allAnomalies.filter(a => a.severity === 'critical').length,
    },
  };
  
  res.json({ success: true, data: stats });
});

export default router;
