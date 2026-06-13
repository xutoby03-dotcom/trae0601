import { Complaint, Statistics, NOISE_TYPE_LABELS, BUILDINGS } from '@/types';
import { isWithinWeek, getDuration, isOverdue } from './dateUtils';

export const calculateStatistics = (complaints: Complaint[]): Statistics => {
  const weeklyComplaints = complaints.filter((c) => isWithinWeek(c.createdAt));

  const complainantMap = new Map<string, number>();
  complaints.forEach((c) => {
    const key = `${c.complainant}-${c.phone}`;
    complainantMap.set(key, (complainantMap.get(key) || 0) + 1);
  });
  const repeatComplainants = Array.from(complainantMap.values()).filter((count) => count >= 2).length;

  const completedComplaints = complaints.filter((c) => c.status === 'completed' && c.processRecords.length > 0);
  let totalDuration = 0;
  completedComplaints.forEach((c) => {
    const latestRecord = c.processRecords[c.processRecords.length - 1];
    if (latestRecord.actualVisitTime) {
      totalDuration += getDuration(c.createdAt, latestRecord.actualVisitTime);
    }
  });
  const avgProcessingTime = completedComplaints.length > 0 ? Math.round(totalDuration / completedComplaints.length) : 0;

  const pendingCount = complaints.filter((c) => c.status === 'pending' || c.status === 'processing').length;
  const overdueCount = complaints.filter((c) => c.status === 'overdue').length;

  const buildingStats = BUILDINGS.map((building) => ({
    building,
    count: complaints.filter((c) => c.building === building).length,
  })).sort((a, b) => b.count - a.count);

  const noiseTypeStats = Object.entries(NOISE_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    count: complaints.filter((c) => c.noiseType === type).length,
  })).sort((a, b) => b.count - a.count);

  return {
    weeklyCount: weeklyComplaints.length,
    repeatComplainants,
    avgProcessingTime,
    pendingCount,
    overdueCount,
    buildingStats,
    noiseTypeStats,
  };
};

export const updateOverdueStatus = (complaints: Complaint[]): Complaint[] => {
  return complaints.map((complaint): Complaint => {
    if (complaint.status === 'completed') return complaint;

    const latestRecord = complaint.processRecords[complaint.processRecords.length - 1];
    if (latestRecord && latestRecord.promisedTime && isOverdue(latestRecord.promisedTime) && !latestRecord.actualVisitTime) {
      return { ...complaint, status: 'overdue' as const };
    }
    return complaint;
  });
};

export const getBuildingComplaintCount = (complaints: Complaint[], building: string): number => {
  return complaints.filter((c) => c.building === building).length;
};

export const getHeatmapColor = (count: number): string => {
  if (count === 0) return 'bg-slate-700/50';
  if (count <= 3) return 'bg-emerald-600/60';
  if (count <= 6) return 'bg-yellow-500/60';
  if (count <= 10) return 'bg-orange-500/70';
  return 'bg-red-500/80';
};
