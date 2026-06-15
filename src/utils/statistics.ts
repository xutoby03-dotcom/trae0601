import type {
  Curtain,
  Room,
  WashingRecord,
  Reminder,
  Statistics,
  MissingPart,
} from '@/types';
import {
  isOverdueForWash,
  isThisMonth,
  getDurationMinutes,
} from '@/utils/date';
import { getNowStr } from '@/utils/date';
import { generateId as genId } from '@/utils/storage';

export function calculateStatistics(
  rooms: Room[],
  curtains: Curtain[],
  records: WashingRecord[]
): Statistics {
  const overdueCurtains = curtains.filter((c) => isOverdueForWash(c.lastWashDate, c.washCycleDays));
  const roomsWithOverdue = new Set(overdueCurtains.map((c) => c.roomId)).size;
  const missingPartsTotal = records.reduce((sum, r) => sum + r.missingParts.reduce((s, p) => s + p.quantity, 0), 0);
  const monthlyRecords = records.filter((r) => r.completed && isThisMonth(r.startDate));
  const completedRecords = records.filter((r) => r.completed);
  const totalTime = completedRecords.reduce((sum, r) => sum + r.totalMinutes, 0);
  const avgTime = completedRecords.length > 0 ? Math.round(totalTime / completedRecords.length) : 0;

  return {
    roomsToWash: roomsWithOverdue,
    missingPartsTotal,
    monthlyWashCount: monthlyRecords.length,
    averageWashTime: avgTime,
    totalCurtains: curtains.length,
    completedWashes: completedRecords.length,
  };
}

export function generateReminders(
  curtains: Curtain[],
  rooms: Room[],
  records: WashingRecord[]
): Reminder[] {
  const reminders: Reminder[] = [];

  curtains.forEach((curtain) => {
    const room = rooms.find((r) => r.id === curtain.roomId);
    if (!room) return;

    if (isOverdueForWash(curtain.lastWashDate, curtain.washCycleDays)) {
      reminders.push({
        id: genId(),
        type: 'overdue',
        curtainId: curtain.id,
        roomId: room.id,
        message: `${room.name} - ${curtain.name} 已超过清洗周期`,
        date: getNowStr(),
        priority: 'high',
      });
    }

    if (curtain.hasMold) {
      reminders.push({
        id: genId(),
        type: 'mold',
        curtainId: curtain.id,
        roomId: room.id,
        message: `${room.name} - ${curtain.name} 有霉点需要处理`,
        date: getNowStr(),
        priority: 'high',
      });
    }

    if (curtain.trackStuck) {
      reminders.push({
        id: genId(),
        type: 'track',
        curtainId: curtain.id,
        roomId: room.id,
        message: `${room.name} - ${curtain.name} 轨道卡顿需要维护`,
        date: getNowStr(),
        priority: 'medium',
      });
    }
  });

  const allMissingParts: MissingPart[] = records.flatMap((r) => r.missingParts);
  const missingByCurtain = new Map<string, number>();
  allMissingParts.forEach((part) => {
    const record = records.find((r) => r.missingParts.some((p) => p.id === part.id));
    if (record) {
      const current = missingByCurtain.get(record.curtainId) || 0;
      missingByCurtain.set(record.curtainId, current + part.quantity);
    }
  });

  missingByCurtain.forEach((qty, curtainId) => {
    const curtain = curtains.find((c) => c.id === curtainId);
    const room = rooms.find((r) => r.id === curtain?.roomId);
    if (curtain && room) {
      reminders.push({
        id: genId(),
        type: 'missing',
        curtainId: curtain.id,
        roomId: room.id,
        message: `${room.name} - ${curtain.name} 缺失 ${qty} 个配件`,
        date: getNowStr(),
        priority: 'medium',
      });
    }
  });

  return reminders;
}

export function getCurtainTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cloth: '布帘',
    sheer: '纱帘',
    blackout: '遮光布',
    roller: '卷帘',
    bamboo: '竹帘',
  };
  return labels[type] || type;
}

export function getWashMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    machine: '机洗',
    hand: '手洗',
    dryclean: '干洗',
    spot: '局部清洗',
  };
  return labels[method] || method;
}

export function getDryingMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    natural: '自然晾干',
    machine: '烘干机',
    shade: '阴干',
  };
  return labels[method] || method;
}

export function getReminderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    overdue: '超时未洗',
    mold: '霉点提醒',
    track: '轨道问题',
    missing: '缺件提醒',
  };
  return labels[type] || type;
}

export function getRoomIcon(roomName: string): string {
  const icons: Record<string, string> = {
    客厅: '🛋️',
    卧室: '🛏️',
    主卧: '🛏️',
    次卧: '🛏️',
    厨房: '🍳',
    书房: '📚',
    阳台: '🌿',
    餐厅: '🍽️',
    卫生间: '🚿',
  };
  return icons[roomName] || '🚪';
}

export function getCurtainTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    cloth: '🪟',
    sheer: '🌫️',
    blackout: '🌑',
    roller: '📜',
    bamboo: '🎋',
  };
  return icons[type] || '🪟';
}

export function calculateTotalMinutes(record: WashingRecord): number {
  return getDurationMinutes(record.removalTime, record.installTime);
}

export function getWashingStepLabel(step: string): string {
  const labels: Record<string, string> = {
    idle: '待开始',
    removal: '拆下检查',
    wash: '清洗中',
    dry: '晾干中',
    install: '装回验收',
    complete: '已完成',
  };
  return labels[step] || step;
}

export function getStepProgress(step: string): number {
  const progress: Record<string, number> = {
    idle: 0,
    removal: 25,
    wash: 50,
    dry: 75,
    install: 90,
    complete: 100,
  };
  return progress[step] || 0;
}
