import { Reminder, ReminderType, Seat, Inspection, ChildProfile } from '@/types';
import { generateId } from './storage';
import { addMonths, isWinterSeason, daysFromNow, addDays } from './date';

const createReminder = (
  type: ReminderType,
  title: string,
  description: string,
  date: string,
  relatedId?: string
): Reminder => ({
  id: generateId(),
  type,
  title,
  description,
  date,
  enabled: true,
  relatedId,
  dismissed: false,
});

export const generateChildGrowthReminder = (child: ChildProfile): Reminder | null => {
  const nextCheckDate = addMonths(child.updatedAt || child.createdAt, 6);
  if (daysFromNow(nextCheckDate) <= 7) {
    return createReminder(
      'child_growth',
      '孩子成长检查提醒',
      `${child.name} 已经6个月没有检查身高体重了，请确认是否需要调整安全座椅的肩带高度和头枕位置。`,
      nextCheckDate
    );
  }
  return null;
};

export const generateWinterClothingReminder = (): Reminder | null => {
  if (isWinterSeason()) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (now.getDate() <= 3) {
      return createReminder(
        'winter_clothing',
        '冬季厚衣提醒',
        '冬季孩子穿着厚重衣物，会影响肩带的贴合度。请检查肩带松紧度，确保在厚衣情况下仍能正确收紧。',
        firstDayOfMonth.toISOString().split('T')[0]
      );
    }
  }
  return null;
};

export const generateSeatExpiryReminders = (seat: Seat): Reminder[] => {
  const reminders: Reminder[] = [];
  const daysUntilExpiry = daysFromNow(seat.expiryDate);

  if (daysUntilExpiry <= 90 && daysUntilExpiry > 30) {
    reminders.push(createReminder(
      'seat_expiry',
      `座椅即将到期提醒`,
      `${seat.brand} ${seat.model} 将在 ${daysUntilExpiry} 天后过期，请提前准备更换新的安全座椅。`,
      seat.expiryDate,
      seat.id
    ));
  } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 7) {
    reminders.push(createReminder(
      'seat_expiry',
      `座椅即将到期警告`,
      `警告：${seat.brand} ${seat.model} 将在 ${daysUntilExpiry} 天后过期！过期座椅的安全性能会下降，请尽快更换。`,
      seat.expiryDate,
      seat.id
    ));
  } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
    reminders.push(createReminder(
      'seat_expiry',
      `座椅即将过期危险`,
      `危险：${seat.brand} ${seat.model} 将在 ${daysUntilExpiry} 天后过期！请立即更换新的安全座椅，不可继续使用。`,
      seat.expiryDate,
      seat.id
    ));
  } else if (daysUntilExpiry <= 0) {
    reminders.push(createReminder(
      'seat_expiry',
      `座椅已过期！`,
      `危险：${seat.brand} ${seat.model} 已过期 ${Math.abs(daysUntilExpiry)} 天！过期座椅存在严重安全隐患，请立即停止使用并更换。`,
      seat.expiryDate,
      seat.id
    ));
  }

  return reminders;
};

export const generateRecheckReminder = (lastInspection: Inspection): Reminder | null => {
  const recheckDate = addDays(lastInspection.date, 30);
  if (daysFromNow(recheckDate) <= 3) {
    return createReminder(
      'recheck',
      '安全座椅复查提醒',
      '距离上次安全座椅检查已接近30天，请进行复查确保安装状态良好。',
      recheckDate,
      lastInspection.id
    );
  }
  return null;
};

export const generateAllReminders = (
  seats: Seat[],
  inspections: Inspection[],
  childProfile?: ChildProfile
): Reminder[] => {
  const reminders: Reminder[] = [];

  seats.forEach(seat => {
    reminders.push(...generateSeatExpiryReminders(seat));
  });

  if (inspections.length > 0) {
    const latestInspection = inspections.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
    const recheckReminder = generateRecheckReminder(latestInspection);
    if (recheckReminder) reminders.push(recheckReminder);
  }

  if (childProfile) {
    const growthReminder = generateChildGrowthReminder(childProfile);
    if (growthReminder) reminders.push(growthReminder);
  }

  const winterReminder = generateWinterClothingReminder();
  if (winterReminder) reminders.push(winterReminder);

  return reminders;
};

export const getActiveReminders = (reminders: Reminder[]): Reminder[] => {
  return reminders.filter(r => r.enabled && !r.dismissed);
};

export const getReminderSeverity = (reminder: Reminder): 'info' | 'warning' | 'danger' => {
  if (reminder.type === 'seat_expiry') {
    const days = daysFromNow(reminder.date);
    if (days <= 0) return 'danger';
    if (days <= 30) return 'danger';
    return 'warning';
  }
  if (reminder.type === 'winter_clothing') return 'info';
  if (reminder.type === 'child_growth') return 'warning';
  return 'warning';
};
