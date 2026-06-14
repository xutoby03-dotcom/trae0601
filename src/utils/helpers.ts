import { format, differenceInMinutes, isAfter, addHours, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ClothesRecord, StatsData, WeatherCondition } from '../types';
import { AREAS, FAMILY_MEMBERS } from '../data/constants';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'HH:mm');
};

export const formatDateTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'MM月dd日 HH:mm', { locale: zhCN });
};

export const formatDate = (dateStr: string): string => {
  return format(new Date(dateStr), 'MM月dd日', { locale: zhCN });
};

export const getDryingDuration = (startTime: string): { hours: number; minutes: number } => {
  const now = new Date();
  const start = new Date(startTime);
  const totalMinutes = differenceInMinutes(now, start);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
};

export const formatDryingDuration = (startTime: string): string => {
  const { hours, minutes } = getDryingDuration(startTime);
  if (hours === 0) return `${minutes}分钟`;
  if (minutes === 0) return `${hours}小时`;
  return `${hours}小时${minutes}分钟`;
};

export const isOverdue = (startTime: string, expectedDuration: number, graceMinutes: number = 30): boolean => {
  const expectedEnd = addHours(new Date(startTime), expectedDuration);
  const graceEnd = new Date(expectedEnd.getTime() + graceMinutes * 60 * 1000);
  return isAfter(new Date(), graceEnd);
};

export const getRemainingTime = (startTime: string, expectedDuration: number): { overdue: boolean; text: string; hours: number; minutes: number } => {
  const now = new Date();
  const expectedEnd = addHours(new Date(startTime), expectedDuration);
  const diffMinutes = differenceInMinutes(expectedEnd, now);
  
  if (diffMinutes <= 0) {
    const overdueMinutes = Math.abs(diffMinutes);
    return {
      overdue: true,
      text: `已超时 ${Math.floor(overdueMinutes / 60)}小时${overdueMinutes % 60}分钟`,
      hours: Math.floor(overdueMinutes / 60),
      minutes: overdueMinutes % 60
    };
  }
  
  return {
    overdue: false,
    text: `剩余 ${Math.floor(diffMinutes / 60)}小时${diffMinutes % 60}分钟`,
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60
  };
};

export const isNightTime = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
};

export const getWeatherEmoji = (condition: WeatherCondition): string => {
  const emojiMap: Record<WeatherCondition, string> = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    foggy: '🌫️',
    night: '🌙'
  };
  return emojiMap[condition];
};

export const calculateStats = (records: ClothesRecord[]): StatsData => {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: zhCN, weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { locale: zhCN, weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const collectedRecords = records.filter(r => r.status === 'collected');
  const dryingRecords = records.filter(r => r.status === 'drying');

  const weeklyDampCount = collectedRecords.filter(r => {
    const collectedAt = new Date(r.collectedAt!);
    return collectedAt >= weekStart && collectedAt <= weekEnd && r.isDamp;
  }).length;

  const monthlyDampCount = collectedRecords.filter(r => {
    const collectedAt = new Date(r.collectedAt!);
    return collectedAt >= monthStart && collectedAt <= monthEnd && r.isDamp;
  }).length;

  const forgottenByPerson = FAMILY_MEMBERS.map(member => ({
    personId: member.id,
    personName: member.name,
    personAvatar: member.avatar,
    count: records
      .filter(r => r.responsiblePersonId === member.id)
      .reduce((sum, r) => sum + (r.remindCount || 0), 0)
  })).sort((a, b) => b.count - a.count);

  const thickClothesPending = dryingRecords.filter(r => r.isThick);

  const areaDampDistribution = AREAS.map(area => ({
    areaId: area.id,
    areaName: area.name,
    count: collectedRecords.filter(r => r.locationId === area.id && r.isDamp).length
  }));

  const weeklyTrend = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayRecords = collectedRecords.filter(r => {
      const collectedAt = new Date(r.collectedAt!);
      return collectedAt >= dayStart && collectedAt <= dayEnd;
    });

    return {
      date: format(date, 'MM/dd'),
      dampCount: dayRecords.filter(r => r.isDamp).length,
      dryCount: dayRecords.filter(r => r.isDry && !r.isDamp).length
    };
  });

  return {
    weeklyDampCount,
    monthlyDampCount,
    forgottenByPerson,
    thickClothesPending,
    areaDampDistribution,
    weeklyTrend
  };
};

export const generateMockWeather = (): { condition: WeatherCondition; temperature: number; humidity: number; forecast: string; icon: string } => {
  const conditions: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'foggy'];
  const hour = new Date().getHours();
  
  let condition: WeatherCondition;
  if (hour >= 19 || hour < 6) {
    condition = 'night';
  } else {
    condition = conditions[Math.floor(Math.random() * conditions.length)];
  }

  const baseTemp = condition === 'sunny' ? 28 : condition === 'cloudy' ? 24 : condition === 'rainy' ? 20 : 22;
  const baseHumidity = condition === 'sunny' ? 50 : condition === 'cloudy' ? 65 : condition === 'rainy' ? 85 : 90;

  const forecasts: Record<WeatherCondition, string> = {
    sunny: '晴朗干燥，适合晾晒',
    cloudy: '多云转阴，注意天气变化',
    rainy: '有雨，请及时收衣',
    foggy: '起雾高湿，衣物易返潮',
    night: '夜间降温，注意收衣'
  };

  return {
    condition,
    temperature: baseTemp + Math.floor(Math.random() * 5) - 2,
    humidity: baseHumidity + Math.floor(Math.random() * 10) - 5,
    forecast: forecasts[condition],
    icon: getWeatherEmoji(condition)
  };
};

export const generateMockRecords = (): ClothesRecord[] => {
  const now = new Date();
  return [
    {
      id: generateId(),
      clothingType: 'top',
      clothingTypeLabel: '上衣',
      clothingTypeIcon: '👕',
      quantity: 3,
      location: '南阳台',
      locationId: 'south-balcony',
      responsiblePerson: '妈妈',
      responsiblePersonId: 'mom',
      responsiblePersonAvatar: '👩',
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      expectedDuration: 4,
      isThick: false,
      status: 'drying',
      remindCount: 0
    },
    {
      id: generateId(),
      clothingType: 'bedding',
      clothingTypeLabel: '床品',
      clothingTypeIcon: '🛏️',
      quantity: 1,
      location: '南阳台',
      locationId: 'south-balcony',
      responsiblePerson: '爸爸',
      responsiblePersonId: 'dad',
      responsiblePersonAvatar: '👨',
      startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      expectedDuration: 8,
      isThick: true,
      status: 'drying',
      remindCount: 1
    },
    {
      id: generateId(),
      clothingType: 'pants',
      clothingTypeLabel: '裤子',
      clothingTypeIcon: '👖',
      quantity: 2,
      location: '北阳台',
      locationId: 'north-balcony',
      responsiblePerson: '小明',
      responsiblePersonId: 'xiaoming',
      responsiblePersonAvatar: '👦',
      startTime: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
      expectedDuration: 6,
      isThick: true,
      status: 'drying',
      remindCount: 2
    },
    {
      id: generateId(),
      clothingType: 'underwear',
      clothingTypeLabel: '内衣',
      clothingTypeIcon: '🩲',
      quantity: 5,
      location: '主卧阳台',
      locationId: 'master-balcony',
      responsiblePerson: '小红',
      responsiblePersonId: 'xiaohong',
      responsiblePersonAvatar: '👧',
      startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      expectedDuration: 4,
      isThick: false,
      status: 'drying',
      remindCount: 0
    }
  ];
};
