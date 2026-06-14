import type {
  Equipment,
  UsageRecord,
  MaintenanceStatus,
  MaintenanceAction,
  MonthlyStats,
  EquipmentReplacementSuggestion,
  SportType,
} from '@/types';
import { getDaysBetween, today, getMonthKey, getLast6Months } from './date';

const getSuggestedAction = (
  sportType: SportType,
  isMaintenanceOverdue: boolean,
  isLifespanOverdue: boolean,
  isMaintenanceUpcoming: boolean,
  isLifespanUpcoming: boolean
): MaintenanceAction => {
  if (isLifespanOverdue) return 'retire';
  if (isMaintenanceOverdue || isLifespanUpcoming) {
    switch (sportType) {
      case 'running':
      case 'cycling':
        return isMaintenanceOverdue ? 'replace' : 'check';
      case 'badminton':
      case 'tennis':
        return 'restring';
      case 'basketball':
      case 'football':
        return 'inflate';
      case 'yoga':
      case 'swimming':
      case 'fitness':
      default:
        return 'clean';
    }
  }
  if (isMaintenanceUpcoming) return 'check';
  return 'check';
};

export const computeMaintenanceStatus = (
  equipment: Equipment,
  allRecords: UsageRecord[]
): MaintenanceStatus => {
  const records = allRecords.filter((r) => r.equipmentId === equipment.id);
  const now = today();

  const daysSincePurchase = getDaysBetween(equipment.purchaseDate, now);
  const totalKm = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const totalUsageCount = records.length;
  const totalCost = records.reduce((sum, r) => sum + (r.maintenanceCost || 0), 0);
  const totalMinutes = records.reduce((sum, r) => sum + r.durationMinutes, 0);

  const lastMaintenanceDate = equipment.lastMaintenanceDate || equipment.purchaseDate;
  const daysSinceLastMaintenance = getDaysBetween(lastMaintenanceDate, now);
  const daysUntilNextMaintenance = equipment.maintenanceCycleDays - daysSinceLastMaintenance;

  const recordsSinceLastMaintenance = records.filter(
    (r) => getDaysBetween(lastMaintenanceDate, r.date) >= 0
  );
  const kmSinceLastMaintenance = recordsSinceLastMaintenance.reduce(
    (sum, r) => sum + (r.distanceKm || 0),
    0
  );
  const kmUntilNextMaintenance = equipment.maintenanceCycleKm
    ? equipment.maintenanceCycleKm - kmSinceLastMaintenance
    : null;

  const lifespanDaysRemaining = equipment.lifespanDays - daysSincePurchase;
  const lifespanKmRemaining = equipment.lifespanKm
    ? equipment.lifespanKm - totalKm
    : null;

  const isDaysOverdue = daysUntilNextMaintenance < 0;
  const isKmOverdue = kmUntilNextMaintenance !== null && kmUntilNextMaintenance < 0;
  const isMaintenanceOverdue = isDaysOverdue || isKmOverdue;

  const isDaysUpcoming = daysUntilNextMaintenance >= 0 && daysUntilNextMaintenance <= 7;
  const isKmUpcoming =
    kmUntilNextMaintenance !== null &&
    kmUntilNextMaintenance >= 0 &&
    equipment.maintenanceCycleKm !== null &&
    kmUntilNextMaintenance <= equipment.maintenanceCycleKm * 0.2;
  const isMaintenanceUpcoming = !isMaintenanceOverdue && (isDaysUpcoming || isKmUpcoming);

  const isLifespanDaysOverdue = lifespanDaysRemaining < 0;
  const isLifespanKmOverdue = lifespanKmRemaining !== null && lifespanKmRemaining < 0;
  const isLifespanOverdue = isLifespanDaysOverdue || isLifespanKmOverdue;

  const isLifespanDaysUpcoming =
    lifespanDaysRemaining >= 0 && lifespanDaysRemaining <= 30;
  const isLifespanKmUpcoming =
    lifespanKmRemaining !== null &&
    lifespanKmRemaining >= 0 &&
    equipment.lifespanKm !== null &&
    lifespanKmRemaining <= equipment.lifespanKm * 0.1;
  const isLifespanUpcoming =
    !isLifespanOverdue && (isLifespanDaysUpcoming || isLifespanKmUpcoming);

  const suggestedAction = getSuggestedAction(
    equipment.sportType,
    isMaintenanceOverdue,
    isLifespanOverdue,
    isMaintenanceUpcoming,
    isLifespanUpcoming
  );

  return {
    equipmentId: equipment.id,
    daysSinceLastMaintenance,
    daysUntilNextMaintenance,
    kmSinceLastMaintenance,
    kmUntilNextMaintenance,
    daysSincePurchase,
    totalKm,
    lifespanDaysRemaining,
    lifespanKmRemaining,
    isMaintenanceOverdue,
    isMaintenanceUpcoming,
    isLifespanOverdue,
    isLifespanUpcoming,
    suggestedAction,
    totalUsageCount,
    totalCost,
    totalMinutes,
  };
};

export const getOverdueEquipment = (
  equipmentList: Equipment[],
  records: UsageRecord[]
): { equipment: Equipment; status: MaintenanceStatus }[] => {
  return equipmentList
    .filter((e) => e.status !== 'retired')
    .map((e) => ({ equipment: e, status: computeMaintenanceStatus(e, records) }))
    .filter(({ status }) => status.isMaintenanceOverdue || status.isLifespanOverdue)
    .sort((a, b) => {
      const aScore =
        Math.min(a.status.daysUntilNextMaintenance, 0) +
        (a.status.lifespanDaysRemaining < 0 ? a.status.lifespanDaysRemaining * 2 : 0);
      const bScore =
        Math.min(b.status.daysUntilNextMaintenance, 0) +
        (b.status.lifespanDaysRemaining < 0 ? b.status.lifespanDaysRemaining * 2 : 0);
      return aScore - bScore;
    });
};

export const getUpcomingEquipment = (
  equipmentList: Equipment[],
  records: UsageRecord[]
): { equipment: Equipment; status: MaintenanceStatus }[] => {
  return equipmentList
    .filter((e) => e.status !== 'retired')
    .map((e) => ({ equipment: e, status: computeMaintenanceStatus(e, records) }))
    .filter(
      ({ status }) =>
        !status.isMaintenanceOverdue &&
        !status.isLifespanOverdue &&
        (status.isMaintenanceUpcoming || status.isLifespanUpcoming)
    )
    .sort((a, b) => {
      const aDays = Math.min(
        a.status.daysUntilNextMaintenance,
        a.status.lifespanDaysRemaining
      );
      const bDays = Math.min(
        b.status.daysUntilNextMaintenance,
        b.status.lifespanDaysRemaining
      );
      return aDays - bDays;
    });
};

export const computeMonthlyStats = (records: UsageRecord[]): MonthlyStats[] => {
  const months = getLast6Months();
  return months.map(({ key, label }) => {
    const monthRecords = records.filter((r) => getMonthKey(r.date) === key);
    return {
      month: label,
      usageCount: monthRecords.length,
      totalMinutes: monthRecords.reduce((sum, r) => sum + r.durationMinutes, 0),
      totalCost: monthRecords.reduce((sum, r) => sum + (r.maintenanceCost || 0), 0),
      totalKm: monthRecords.reduce((sum, r) => sum + (r.distanceKm || 0), 0),
    };
  });
};

export const getReplacementSuggestions = (
  equipmentList: Equipment[],
  records: UsageRecord[]
): EquipmentReplacementSuggestion[] => {
  const suggestions: EquipmentReplacementSuggestion[] = [];

  equipmentList
    .filter((e) => e.status !== 'retired')
    .forEach((e) => {
      const status = computeMaintenanceStatus(e, records);
      let score = 0;
      let reason = '';

      if (status.isLifespanOverdue) {
        score = 100;
        reason = '已超过使用寿命，建议立即退役更换';
      } else if (status.isLifespanUpcoming) {
        const daysPct = 1 - status.lifespanDaysRemaining / e.lifespanDays;
        score = Math.round(70 + daysPct * 20);
        const daysLeft = status.lifespanDaysRemaining;
        reason = `距离使用寿命还有约 ${daysLeft} 天，可提前物色新品`;
        if (status.lifespanKmRemaining !== null && e.lifespanKm) {
          const kmLeft = status.lifespanKmRemaining;
          reason = `距离寿命里程还有 ${kmLeft.toFixed(0)} km，可提前物色新品`;
        }
      } else if (status.isMaintenanceOverdue) {
        score = 60;
        reason = '保养已超期，建议尽快维护后评估状态';
      } else {
        const daysPct = status.daysSincePurchase / e.lifespanDays;
        const kmPct =
          e.lifespanKm && status.totalKm > 0 ? status.totalKm / e.lifespanKm : 0;
        const usagePct = Math.max(daysPct, kmPct);
        if (usagePct > 0.6) {
          score = Math.round(usagePct * 50);
          reason = `已使用 ${Math.round(usagePct * 100)}% 的寿命周期`;
        }
      }

      if (score > 0) {
        suggestions.push({
          equipment: e,
          maintenanceStatus: status,
          urgencyScore: score,
          reason,
        });
      }
    });

  return suggestions.sort((a, b) => b.urgencyScore - a.urgencyScore);
};

export const getTotalCost = (records: UsageRecord[]): number => {
  return records.reduce((sum, r) => sum + (r.maintenanceCost || 0), 0);
};

export const getThisMonthCost = (records: UsageRecord[]): number => {
  const thisMonthKey = getMonthKey(new Date());
  return records
    .filter((r) => getMonthKey(r.date) === thisMonthKey)
    .reduce((sum, r) => sum + (r.maintenanceCost || 0), 0);
};

export const getThisMonthUsageCount = (records: UsageRecord[]): number => {
  const thisMonthKey = getMonthKey(new Date());
  return records.filter((r) => getMonthKey(r.date) === thisMonthKey).length;
};

export const getActiveEquipmentCount = (equipmentList: Equipment[]): number => {
  return equipmentList.filter((e) => e.status !== 'retired').length;
};
