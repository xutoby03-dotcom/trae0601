import { Alert, CleanRecord, LitterBox, BoxStatus, BoxStatusInfo } from '../types';
import { generateId } from '../lib/utils';
import { hoursBetween, daysBetween } from './date';

export const getBoxStatus = (
  box: LitterBox,
  records: CleanRecord[],
  nowISO: string = new Date().toISOString()
): BoxStatusInfo => {
  const boxRecords = records
    .filter((r) => r.litterBoxId === box.id)
    .sort((a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime());

  const lastClean = boxRecords[0];
  const hoursSinceLastClean = lastClean
    ? hoursBetween(lastClean.cleanTime, nowISO)
    : 999;
  const daysSinceFullChange = daysBetween(box.lastFullChange, nowISO);

  let status: BoxStatus = 'normal';

  if (daysSinceFullChange >= box.fullChangeIntervalDays) {
    status = 'full_change_due';
  } else if (hoursSinceLastClean >= box.cleanIntervalHours) {
    status = 'overdue';
  } else if (hoursSinceLastClean >= box.cleanIntervalHours * 0.8) {
    status = 'upcoming';
  }

  return {
    boxId: box.id,
    status,
    hoursSinceLastClean,
    lastCleanTime: lastClean?.cleanTime,
    lastCleanMember: lastClean?.memberId,
    daysSinceFullChange,
  };
};

export const generateAlerts = (
  boxes: LitterBox[],
  records: CleanRecord[],
  nowISO: string = new Date().toISOString()
): Alert[] => {
  const alerts: Alert[] = [];

  boxes.forEach((box) => {
    const statusInfo = getBoxStatus(box, records, nowISO);
    const boxRecords = records
      .filter((r) => r.litterBoxId === box.id)
      .sort((a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime());

    if (statusInfo.status === 'overdue') {
      alerts.push({
        id: generateId(),
        type: 'overdue_clean',
        litterBoxId: box.id,
        message: `「${box.name}」已超过 ${Math.floor(statusInfo.hoursSinceLastClean)} 小时未清理，建议尽快铲屎`,
        severity: 'danger',
        createdAt: nowISO,
      });
    }

    if (statusInfo.status === 'full_change_due') {
      alerts.push({
        id: generateId(),
        type: 'full_change_due',
        litterBoxId: box.id,
        message: `「${box.name}」距上次整盆更换已 ${statusInfo.daysSinceFullChange} 天，建议整盆换砂`,
        severity: 'warning',
        createdAt: nowISO,
      });
    }

    const recent3Records = boxRecords.slice(0, 3);
    if (recent3Records.length >= 3 && recent3Records.every((r) => r.smellLevel >= 4)) {
      const alreadyAlerted = alerts.some((a) => a.litterBoxId === box.id && a.type === 'high_smell_chain');
      if (!alreadyAlerted) {
        alerts.push({
          id: generateId(),
          type: 'high_smell_chain',
          litterBoxId: box.id,
          message: `「${box.name}」连续 3 次异味等级≥4，建议整盆更换并检查猫咪健康`,
          severity: 'danger',
          createdAt: nowISO,
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const severityRank = { danger: 0, warning: 1, info: 2 };
    return severityRank[a.severity] - severityRank[b.severity];
  });
};

export const getStatusColor = (status: BoxStatus): string => {
  switch (status) {
    case 'normal':
      return '#A8C5A0';
    case 'upcoming':
      return '#E8C77A';
    case 'overdue':
      return '#D4896A';
    case 'full_change_due':
      return '#C48E9F';
    default:
      return '#A8C5A0';
  }
};

export const getStatusText = (status: BoxStatus): string => {
  switch (status) {
    case 'normal':
      return '状态良好';
    case 'upcoming':
      return '即将到期';
    case 'overdue':
      return '超时未清理';
    case 'full_change_due':
      return '需整盆换砂';
    default:
      return '状态良好';
  }
};
