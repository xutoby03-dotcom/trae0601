import { Braces, DailyRecord, Reminder, ReminderType, Inventory } from '../types';
import { generateId, getTodayString, getDaysDiff, formatDate } from './storage';

const REMINDER_TITLES: Record<ReminderType, string> = {
  missed_wear: '⚠️ 佩戴时长不足',
  overdue_clean: '🧼 清洁超期提醒',
  lost_box: '📦 盒子可能丢失',
  low_stock: '💊 清洁片库存不足',
};

const REMINDER_DESCRIPTIONS: Record<ReminderType, (bracesName: string, extra?: string) => string> = {
  missed_wear: (name, extra) => `${name}今日佩戴时长不足20小时${extra ? `，${extra}` : ''}，请督促孩子佩戴`,
  overdue_clean: (name) => `${name}已超过清洁周期未泡清洁片，请及时清洁`,
  lost_box: (name) => `${name}的盒子带出去后未带回，请确认是否丢失`,
  low_stock: (name) => `${name}的清洁片库存不足，请及时购买`,
};

export const checkMissedWear = (
  braces: Braces,
  records: DailyRecord[],
  existingReminders: Reminder[]
): Reminder | null => {
  const today = getTodayString();
  const todayRecord = records.find(r => r.recordDate === today && r.bracesId === braces.id);
  
  if (!todayRecord) {
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    const yesterdayRecord = records.find(r => r.recordDate === yesterday && r.bracesId === braces.id);
    const dayBefore = formatDate(new Date(Date.now() - 86400000 * 2));
    const dayBeforeRecord = records.find(r => r.recordDate === dayBefore && r.bracesId === braces.id);
    
    if (!yesterdayRecord && !dayBeforeRecord) {
      const exists = existingReminders.some(
        r => r.type === 'missed_wear' && r.bracesId === braces.id && !r.isResolved
      );
      if (!exists) {
        return {
          id: generateId(),
          bracesId: braces.id,
          type: 'missed_wear',
          title: '⚠️ 连续未记录佩戴',
          description: `已连续2天未记录${braces.name}的佩戴情况，请及时记录`,
          triggerDate: today,
          isResolved: false,
        };
      }
    }
    return null;
  }
  
  if (todayRecord.wearHours < 20) {
    const exists = existingReminders.some(
      r => r.type === 'missed_wear' && r.bracesId === braces.id && r.triggerDate === today && !r.isResolved
    );
    if (!exists) {
      return {
        id: generateId(),
        bracesId: braces.id,
        recordId: todayRecord.id,
        type: 'missed_wear',
        title: REMINDER_TITLES.missed_wear,
        description: REMINDER_DESCRIPTIONS.missed_wear(braces.name, `当前仅佩戴${todayRecord.wearHours}小时`),
        triggerDate: today,
        isResolved: false,
      };
    }
  }
  
  return null;
};

export const checkOverdueClean = (
  braces: Braces,
  records: DailyRecord[],
  existingReminders: Reminder[]
): Reminder | null => {
  const today = getTodayString();
  const todayRecord = records.find(r => r.recordDate === today && r.bracesId === braces.id);
  
  const soakedRecords = records
    .filter(r => r.bracesId === braces.id && r.isSoaked)
    .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  
  const lastSoakDate = soakedRecords[0]?.recordDate || braces.receiveDate;
  const daysSinceLastSoak = getDaysDiff(lastSoakDate, today);
  
  if (daysSinceLastSoak > braces.cleanCycle) {
    const exists = existingReminders.some(
      r => r.type === 'overdue_clean' && r.bracesId === braces.id && !r.isResolved
    );
    if (!exists) {
      return {
        id: generateId(),
        bracesId: braces.id,
        type: 'overdue_clean',
        title: REMINDER_TITLES.overdue_clean,
        description: `${braces.name}已${daysSinceLastSoak}天未泡清洁片（周期${braces.cleanCycle}天），请及时清洁`,
        triggerDate: today,
        isResolved: false,
      };
    }
  }
  
  if (todayRecord && todayRecord.wearHours > 0 && !todayRecord.isBrushed) {
    const exists = existingReminders.some(
      r => r.type === 'overdue_clean' && r.bracesId === braces.id && r.triggerDate === today && !r.isResolved && r.recordId === todayRecord.id
    );
    if (!exists) {
      return {
        id: generateId(),
        bracesId: braces.id,
        recordId: todayRecord.id,
        type: 'overdue_clean',
        title: '🦷 今日未刷洗牙套',
        description: `${braces.name}今日已佩戴但未刷洗，请记得清洁`,
        triggerDate: today,
        isResolved: false,
      };
    }
  }
  
  return null;
};

export const checkLostBox = (
  braces: Braces,
  records: DailyRecord[],
  existingReminders: Reminder[]
): Reminder | null => {
  const today = getTodayString();
  
  const lostRecords = records.filter(
    r => r.bracesId === braces.id && r.tookBoxOut && !r.boxReturned
  );
  
  for (const record of lostRecords) {
    const exists = existingReminders.some(
      r => r.type === 'lost_box' && r.recordId === record.id && !r.isResolved
    );
    if (!exists) {
      return {
        id: generateId(),
        bracesId: braces.id,
        recordId: record.id,
        type: 'lost_box',
        title: REMINDER_TITLES.lost_box,
        description: REMINDER_DESCRIPTIONS.lost_box(braces.name),
        triggerDate: today,
        isResolved: false,
      };
    }
  }
  
  return null;
};

export const checkLowStock = (
  braces: Braces,
  inventory: Inventory | undefined,
  existingReminders: Reminder[]
): Reminder | null => {
  if (!inventory) return null;
  
  const today = getTodayString();
  
  if (inventory.currentStock <= inventory.lowStockThreshold) {
    const exists = existingReminders.some(
      r => r.type === 'low_stock' && r.bracesId === braces.id && !r.isResolved
    );
    if (!exists) {
      return {
        id: generateId(),
        bracesId: braces.id,
        type: 'low_stock',
        title: REMINDER_TITLES.low_stock,
        description: `${braces.name}的清洁片仅剩${inventory.currentStock}片，请及时购买`,
        triggerDate: today,
        isResolved: false,
      };
    }
  }
  
  return null;
};

export const checkAndResolveReminders = (
  bracesList: Braces[],
  records: DailyRecord[],
  inventories: Inventory[],
  existingReminders: Reminder[]
): { newReminders: Reminder[]; resolvedIds: string[] } => {
  const newReminders: Reminder[] = [];
  const resolvedIds: string[] = [];
  const today = getTodayString();

  const unresolvedReminders = existingReminders.filter(r => !r.isResolved);

  for (const braces of bracesList) {
    const inventory = inventories.find(i => i.bracesId === braces.id);
    const bracesReminders = unresolvedReminders.filter(r => r.bracesId === braces.id);

    for (const reminder of bracesReminders) {
      let isResolved = false;

      if (reminder.type === 'missed_wear') {
        const todayRecord = records.find(r => r.recordDate === reminder.triggerDate && r.bracesId === braces.id);
        if (reminder.title.includes('连续未记录')) {
          const yesterday = formatDate(new Date(Date.now() - 86400000));
          const yesterdayRecord = records.find(r => r.recordDate === yesterday && r.bracesId === braces.id);
          const dayBefore = formatDate(new Date(Date.now() - 86400000 * 2));
          const dayBeforeRecord = records.find(r => r.recordDate === dayBefore && r.bracesId === braces.id);
          if (yesterdayRecord || dayBeforeRecord) {
            isResolved = true;
          }
        } else if (todayRecord && todayRecord.wearHours >= 20) {
          isResolved = true;
        }
      }

      if (reminder.type === 'overdue_clean') {
        if (reminder.title.includes('未刷洗牙套') && reminder.recordId) {
          const record = records.find(r => r.id === reminder.recordId);
          if (record && record.isBrushed) {
            isResolved = true;
          }
        } else {
          const soakedRecords = records
            .filter(r => r.bracesId === braces.id && r.isSoaked)
            .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
          const lastSoakDate = soakedRecords[0]?.recordDate || braces.receiveDate;
          const daysSinceLastSoak = getDaysDiff(lastSoakDate, today);
          if (daysSinceLastSoak <= braces.cleanCycle) {
            isResolved = true;
          }
        }
      }

      if (reminder.type === 'lost_box' && reminder.recordId) {
        const record = records.find(r => r.id === reminder.recordId);
        if (record && record.boxReturned) {
          isResolved = true;
        }
      }

      if (reminder.type === 'low_stock') {
        if (inventory && inventory.currentStock > inventory.lowStockThreshold) {
          isResolved = true;
        }
      }

      if (isResolved) {
        resolvedIds.push(reminder.id);
      }
    }

    const currentNewReminders = [...existingReminders.filter(r => !resolvedIds.includes(r.id)), ...newReminders];

    const missedWear = checkMissedWear(braces, records, [...currentNewReminders, ...newReminders]);
    if (missedWear) newReminders.push(missedWear);
    
    const overdueClean = checkOverdueClean(braces, records, [...currentNewReminders, ...newReminders]);
    if (overdueClean) newReminders.push(overdueClean);
    
    const lostBox = checkLostBox(braces, records, [...currentNewReminders, ...newReminders]);
    if (lostBox) newReminders.push(lostBox);
    
    const lowStock = checkLowStock(braces, inventory, [...currentNewReminders, ...newReminders]);
    if (lowStock) newReminders.push(lowStock);
  }
  
  return { newReminders, resolvedIds };
};

export const checkAllReminders = (
  bracesList: Braces[],
  records: DailyRecord[],
  inventories: Inventory[],
  existingReminders: Reminder[]
): Reminder[] => {
  const newReminders: Reminder[] = [];
  
  for (const braces of bracesList) {
    const inventory = inventories.find(i => i.bracesId === braces.id);
    
    const missedWear = checkMissedWear(braces, records, [...existingReminders, ...newReminders]);
    if (missedWear) newReminders.push(missedWear);
    
    const overdueClean = checkOverdueClean(braces, records, [...existingReminders, ...newReminders]);
    if (overdueClean) newReminders.push(overdueClean);
    
    const lostBox = checkLostBox(braces, records, [...existingReminders, ...newReminders]);
    if (lostBox) newReminders.push(lostBox);
    
    const lowStock = checkLowStock(braces, inventory, [...existingReminders, ...newReminders]);
    if (lowStock) newReminders.push(lowStock);
  }
  
  return newReminders;
};
