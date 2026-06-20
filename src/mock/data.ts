import dayjs from 'dayjs';
import type {
  Counter,
  CounterWithGuides,
  Guide,
  InventoryItem,
  InspectionRecord,
  InspectionItem,
  SupplyTask,
  Activity,
  ConsumptionData,
  MaterialType,
  PeriodType,
  TaskStatus,
  TaskUrgency,
  OperationLog,
} from '@/types/index';

const MATERIAL_TYPES: MaterialType[] = ['scentPaper', 'coffeeBean', 'sprayNozzle', 'cleaningCloth', 'labelSticker'];
const PERIOD_TYPES: PeriodType[] = ['morning', 'noon', 'closing'];

const PERIOD_HOURS: Record<PeriodType, number> = {
  morning: 9,
  noon: 13,
  closing: 21,
};

const COUNTER_NAMES = [
  { name: '香奈儿区', color: '#C9A962', description: '经典优雅的法式香氛体验' },
  { name: '迪奥区', color: '#722F37', description: '奢华高贵的迪奥香氛系列' },
  { name: '祖玛珑区', color: '#4A6741', description: '清新自然的英伦香氛' },
  { name: '汤姆福特区', color: '#1A1A2E', description: '性感神秘的高端私人调配' },
  { name: '爱马仕区', color: '#FF6B35', description: '艺术与香氛的完美融合' },
];

const GUIDE_NAMES = [
  '张雅婷', '李思琪', '王美琳', '陈雨萱', '刘梦瑶', '赵欣怡',
  '周晓彤', '吴佳妮', '郑诗涵', '孙婉清', '林若曦', '黄雨桐',
];

const GUIDE_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop&crop=faces',
];

const PERFUME_PHOTOS = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1566995541428-f2246c17cda1?w=600&h=400&fit=crop',
];

const DRAWER_PREFIXES = ['A', 'B', 'C', 'D', 'E'];

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const shuffleArray = <T>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const generatePhone = (): string => {
  const prefixes = ['138', '139', '158', '159', '186', '187', '188', '189'];
  const prefix = randomChoice(prefixes);
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += randomInt(0, 9).toString();
  }
  return prefix + suffix;
};

const generateBatchNo = (materialType: MaterialType, date: dayjs.Dayjs): string => {
  const prefixMap: Record<MaterialType, string> = {
    scentPaper: 'SP',
    coffeeBean: 'CB',
    sprayNozzle: 'SN',
    cleaningCloth: 'CC',
    labelSticker: 'LS',
  };
  const prefix = prefixMap[materialType];
  const dateStr = date.format('YYYYMMDD');
  const seq = randomInt(1000, 9999);
  return `${prefix}-${dateStr}-${seq}`;
};

const getThreshold = (materialType: MaterialType): number => {
  const thresholdMap: Record<MaterialType, number> = {
    scentPaper: 200,
    coffeeBean: 500,
    sprayNozzle: 50,
    cleaningCloth: 30,
    labelSticker: 100,
  };
  return thresholdMap[materialType];
};

const getBaseConsumption = (materialType: MaterialType): number => {
  const baseMap: Record<MaterialType, number> = {
    scentPaper: 80,
    coffeeBean: 120,
    sprayNozzle: 15,
    cleaningCloth: 8,
    labelSticker: 35,
  };
  return baseMap[materialType];
};

export const generateCounters = (): Counter[] => {
  const counters: Counter[] = [];
  const today = dayjs();

  COUNTER_NAMES.forEach((counterInfo, index) => {
    const photoCount = randomInt(3, 6);
    const shuffledPhotos = shuffleArray(PERFUME_PHOTOS);

    counters.push({
      id: `counter-${index + 1}`,
      name: counterInfo.name,
      brandColor: counterInfo.color,
      tastingTableCount: randomInt(3, 6),
      displayBottleCount: randomInt(8, 15),
      photoUrls: shuffledPhotos.slice(0, photoCount),
      description: counterInfo.description,
      createdAt: today.subtract(randomInt(60, 180), 'day').format('YYYY-MM-DD HH:mm:ss'),
    });
  });

  return counters;
};

export const generateGuides = (counters: Counter[]): Guide[] => {
  const guides: Guide[] = [];

  let guideIndex = 0;
  counters.forEach((counter, counterIdx) => {
    const guideCount = randomInt(2, 3);
    for (let i = 0; i < guideCount && guideIndex < GUIDE_NAMES.length; i++) {
      guides.push({
        id: `guide-${guideIndex + 1}`,
        name: GUIDE_NAMES[guideIndex],
        avatar: GUIDE_AVATARS[guideIndex],
        phone: generatePhone(),
        counterId: counter.id,
        role: counterIdx === 0 && i === 0 ? 'manager' : 'guide',
      });
      guideIndex++;
    }
  });

  return guides;
};

export const generateInventory = (counters: Counter[]): InventoryItem[] => {
  const inventory: InventoryItem[] = [];
  const today = dayjs();
  let itemId = 1;

  counters.forEach((counter, counterIdx) => {
    MATERIAL_TYPES.forEach((materialType, matIdx) => {
      const threshold = getThreshold(materialType);
      const baseQuantity = threshold * randomInt(8, 25) / 10;
      const quantity = Math.round(baseQuantity);
      const drawer = `${DRAWER_PREFIXES[counterIdx]}-${String(matIdx + 1).padStart(2, '0')}`;

      inventory.push({
        id: `inv-${itemId++}`,
        counterId: counter.id,
        materialType,
        quantity,
        batchNo: generateBatchNo(materialType, today.subtract(randomInt(5, 30), 'day')),
        drawer,
        threshold,
        lastUpdated: today.subtract(randomInt(0, 7), 'day').subtract(randomInt(1, 12), 'hour').format('YYYY-MM-DD HH:mm:ss'),
      });
    });
  });

  inventory[3].quantity = Math.round(inventory[3].threshold * 0.3);
  inventory[7].quantity = Math.round(inventory[7].threshold * 0.4);
  inventory[12].quantity = Math.round(inventory[12].threshold * 0.1);
  inventory[18].quantity = Math.round(inventory[18].threshold * 0.25);

  return inventory;
};

export const generateActivities = (counters: Counter[]): Activity[] => {
  const today = dayjs();
  const counterIds = counters.map(c => c.id);

  return [
    {
      id: 'activity-1',
      name: '五一香氛节特惠',
      startDate: today.subtract(20, 'day').format('YYYY-MM-DD'),
      endDate: today.subtract(10, 'day').format('YYYY-MM-DD'),
      thresholdMultiplier: 1.8,
      counterIds: counterIds.slice(0, 4),
      description: '劳动节特别活动，全场香氛8折起，配套耗材消耗增加',
    },
    {
      id: 'activity-2',
      name: '618年中大促',
      startDate: today.subtract(3, 'day').format('YYYY-MM-DD'),
      endDate: today.add(7, 'day').format('YYYY-MM-DD'),
      thresholdMultiplier: 2.0,
      counterIds: counterIds,
      description: '年中购物狂欢节，客流量翻倍，所有耗材补货阈值加倍',
    },
    {
      id: 'activity-3',
      name: '七夕情人节限定',
      startDate: today.add(25, 'day').format('YYYY-MM-DD'),
      endDate: today.add(35, 'day').format('YYYY-MM-DD'),
      thresholdMultiplier: 1.6,
      counterIds: counterIds.slice(0, 3),
      description: '情人节专属礼盒预售，香水销量预计大幅提升',
    },
  ];
};

const getActivityMultiplierForDate = (date: dayjs.Dayjs, activities: Activity[]): number => {
  for (const activity of activities) {
    const start = dayjs(activity.startDate);
    const end = dayjs(activity.endDate);
    if (date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'))) {
      return activity.thresholdMultiplier;
    }
  }
  return 1;
};

const isActivityDay = (date: dayjs.Dayjs, activities: Activity[], counterId: string): boolean => {
  for (const activity of activities) {
    const start = dayjs(activity.startDate);
    const end = dayjs(activity.endDate);
    if (date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day')) && activity.counterIds.includes(counterId)) {
      return true;
    }
  }
  return false;
};

export const generateInspections = (
  counters: Counter[],
  guides: Guide[],
  activities: Activity[]
): InspectionRecord[] => {
  const inspections: InspectionRecord[] = [];
  const today = dayjs();
  let recordId = 1;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = today.subtract(dayOffset, 'day');

    PERIOD_TYPES.forEach((period) => {
      const hour = PERIOD_HOURS[period];
      const minute = randomInt(0, 30);
      const inspectedAt = date.hour(hour).minute(minute).second(0).format('YYYY-MM-DD HH:mm:ss');

      counters.forEach((counter) => {
        const counterGuides = guides.filter((g) => g.counterId === counter.id);
        if (counterGuides.length === 0) return;

        const guide = randomChoice(counterGuides);
        const activityMult = isActivityDay(date, activities, counter.id)
          ? getActivityMultiplierForDate(date, activities)
          : 1;
        const onActivity = activityMult > 1;

        const items: InspectionItem[] = MATERIAL_TYPES.map((materialType) => {
          const threshold = getThreshold(materialType);
          const adjustedThreshold = Math.round(threshold * activityMult);
          const hasShortageChance = dayOffset <= 3 && Math.random() < 0.2;
          const baseQty = threshold * randomInt(8, 22) / 10;
          const quantity = hasShortageChance
            ? Math.round(adjustedThreshold * randomInt(2, 7) / 10)
            : Math.round(baseQty);
          const isShortage = quantity < adjustedThreshold;

          return {
            materialType,
            quantity,
            threshold: adjustedThreshold,
            isShortage,
          };
        });

        const shortageCount = items.filter((i) => i.isShortage).length;

        inspections.push({
          id: `inspection-${recordId++}`,
          counterId: counter.id,
          guideId: guide.id,
          period,
          inspectedAt,
          items,
          isActivityDay: onActivity,
          thresholdMultiplier: onActivity ? activityMult : undefined,
          generatedTaskCount: shortageCount > 0 ? shortageCount : undefined,
        });
      });
    });
  }

  return inspections;
};

export const generateSupplyTasks = (
  inspections: InspectionRecord[],
  guides: Guide[],
  counters: Counter[]
): SupplyTask[] => {
  const tasks: SupplyTask[] = [];
  let taskId = 1;

  const shortageInspections = inspections
    .filter((ins) => (ins.generatedTaskCount ?? 0) > 0)
    .sort((a, b) => dayjs(b.inspectedAt).valueOf() - dayjs(a.inspectedAt).valueOf());

  const taskDistribution = {
    pending: Math.ceil(shortageInspections.length * 0.3),
    inProgress: Math.ceil(shortageInspections.length * 0.3),
    completed: shortageInspections.length - Math.ceil(shortageInspections.length * 0.3) - Math.ceil(shortageInspections.length * 0.3),
  };

  let pendingCount = 0;
  let inProgressCount = 0;

  shortageInspections.forEach((inspection) => {
    let status: TaskStatus;
    if (pendingCount < taskDistribution.pending) {
      status = 'pending';
      pendingCount++;
    } else if (inProgressCount < taskDistribution.inProgress) {
      status = 'inProgress';
      inProgressCount++;
    } else {
      status = 'completed';
    }

    const counter = counters.find((c) => c.id === inspection.counterId);
    if (!counter) return;

    const counterGuides = guides.filter((g) => g.counterId === inspection.counterId);
    const assignee = counterGuides.length > 0 ? randomChoice(counterGuides) : undefined;

    const shortageItems = inspection.items.filter((i) => i.isShortage);

    shortageItems.forEach((item) => {
      const shortageQty = item.threshold - item.quantity;
      const targetQty = Math.round(item.threshold * 1.5);
      const urgency: TaskUrgency = shortageQty >= item.threshold * 0.6 ? 'urgent' : shortageQty >= item.threshold * 0.3 ? 'high' : 'normal';

      const operationLogs: OperationLog[] = [];
      const createdAt = dayjs(inspection.inspectedAt).add(randomInt(5, 30), 'minute');

      operationLogs.push({
        action: '创建任务',
        operatorId: inspection.guideId,
        operatorName: guides.find((g) => g.id === inspection.guideId)?.name,
        timestamp: createdAt.format('YYYY-MM-DD HH:mm:ss'),
        note: `巡查发现${inspection.period === 'morning' ? '开店' : inspection.period === 'noon' ? '午间' : '闭店'}${counter.name}耗材不足`,
      });

      let completedAt: string | undefined;

      if (status === 'inProgress') {
        const pickedUpAt = createdAt.add(randomInt(1, 6), 'hour');
        operationLogs.push({
          action: '领取任务',
          operatorId: assignee?.id ?? inspection.guideId,
          operatorName: assignee?.name ?? guides.find((g) => g.id === inspection.guideId)?.name,
          timestamp: pickedUpAt.format('YYYY-MM-DD HH:mm:ss'),
          note: '已前往仓库领取耗材',
        });

        const suppliedAt = pickedUpAt.add(randomInt(30, 90), 'minute');
        operationLogs.push({
          action: '配送中',
          operatorId: assignee?.id ?? inspection.guideId,
          operatorName: assignee?.name ?? guides.find((g) => g.id === inspection.guideId)?.name,
          timestamp: suppliedAt.format('YYYY-MM-DD HH:mm:ss'),
          note: `正在向${counter.name}配送耗材`,
        });
      } else if (status === 'completed') {
        const pickedUpAt = createdAt.add(randomInt(30, 120), 'minute');
        operationLogs.push({
          action: '领取任务',
          operatorId: assignee?.id ?? inspection.guideId,
          operatorName: assignee?.name ?? guides.find((g) => g.id === inspection.guideId)?.name,
          timestamp: pickedUpAt.format('YYYY-MM-DD HH:mm:ss'),
          note: '已确认任务信息',
        });

        const suppliedAt = pickedUpAt.add(randomInt(1, 4), 'hour');
        operationLogs.push({
          action: '已送达',
          operatorId: assignee?.id ?? inspection.guideId,
          operatorName: assignee?.name ?? guides.find((g) => g.id === inspection.guideId)?.name,
          timestamp: suppliedAt.format('YYYY-MM-DD HH:mm:ss'),
          note: `耗材已送达${counter.name}`,
        });

        const confirmedAt = suppliedAt.add(randomInt(10, 40), 'minute');
        completedAt = confirmedAt.format('YYYY-MM-DD HH:mm:ss');
        operationLogs.push({
          action: '任务完成',
          operatorId: inspection.guideId,
          operatorName: guides.find((g) => g.id === inspection.guideId)?.name,
          timestamp: completedAt,
          note: `已确认签收，补充${shortageQty}个单位`,
        });
      }

      tasks.push({
        id: `task-${taskId++}`,
        counterId: inspection.counterId,
        inspectionRecordId: inspection.id,
        materialType: item.materialType,
        shortageQty,
        targetQty,
        status,
        urgency,
        assigneeId: status !== 'pending' ? assignee?.id : undefined,
        remarks: urgency === 'urgent' ? '请优先处理此任务' : undefined,
        operationLogs,
        createdAt: createdAt.format('YYYY-MM-DD HH:mm:ss'),
        completedAt,
      });
    });
  });

  return tasks;
};

export const generateConsumptionData = (
  counters: Counter[],
  activities: Activity[]
): ConsumptionData[] => {
  const data: ConsumptionData[] = [];
  const today = dayjs();

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = today.subtract(dayOffset, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const isWeekend = date.day() === 0 || date.day() === 6;
    const weekdayMultiplier = isWeekend ? 1.4 : 1;

    counters.forEach((counter, counterIdx) => {
      const counterActivityMult = isActivityDay(date, activities, counter.id)
        ? getActivityMultiplierForDate(date, activities)
        : 1;
      const counterPopularity = 1 + (counterIdx % 3) * 0.15;

      MATERIAL_TYPES.forEach((materialType) => {
        const baseConsumption = getBaseConsumption(materialType);
        const variation = 0.7 + Math.random() * 0.6;
        const consumed = Math.round(
          baseConsumption * weekdayMultiplier * counterActivityMult * counterPopularity * variation
        );

        data.push({
          date: dateStr,
          counterId: counter.id,
          counterName: counter.name,
          materialType,
          consumed,
          isActivity: counterActivityMult > 1,
        });
      });
    });
  }

  return data;
};

export const counters = generateCounters();
export const guides = generateGuides(counters);
export const activities = generateActivities(counters);
export const inventory = generateInventory(counters);
export const inspections = generateInspections(counters, guides, activities);
export const supplyTasks = generateSupplyTasks(inspections, guides, counters);
export const consumptionData = generateConsumptionData(counters, activities);

export const mockCounters: CounterWithGuides[] = counters.map((counter) => ({
  ...counter,
  guides: guides.filter((g) => g.counterId === counter.id),
}));

export const mockGuides = guides;
export const mockActivities = activities;
export const mockInventory = inventory;
export const mockInspections = inspections;
export const mockTasks = supplyTasks;
export const mockConsumptionData = consumptionData;

export const mockData = {
  counters,
  guides,
  inventory,
  inspections,
  supplyTasks,
  activities,
  consumptionData,
  mockCounters,
  mockGuides,
  mockActivities,
  mockInventory,
  mockInspections,
  mockTasks,
  mockConsumptionData,
};

export default mockData;
