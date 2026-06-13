import type { Medicine, MedicineCategory, MedicineStatus, Trip, FamilyMember, TripItem } from '@/types';

export function isExpired(medicine: Medicine): boolean {
  return new Date(medicine.expiryDate) < new Date(new Date().toDateString());
}

export function isExpiringSoon(medicine: Medicine, days: number = 30): boolean {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  const expiry = new Date(medicine.expiryDate);
  const today = new Date(new Date().toDateString());
  return expiry >= today && expiry <= threshold;
}

export function getMedicineStatus(medicine: Medicine): MedicineStatus {
  if (isExpired(medicine)) return 'expired';
  if (isExpiringSoon(medicine)) return 'expiring';
  return 'normal';
}

export function getStatusColor(status: MedicineStatus): {
  dot: string;
  badge: string;
  text: string;
  label: string;
} {
  switch (status) {
    case 'expired':
      return {
        dot: 'bg-red-500',
        badge: 'badge bg-red-50 text-red-600 border border-red-100',
        text: 'text-red-600',
        label: '已过期',
      };
    case 'expiring':
      return {
        dot: 'bg-amber-500',
        badge: 'badge bg-amber-50 text-amber-700 border border-amber-100',
        text: 'text-amber-600',
        label: '临期提醒',
      };
    default:
      return {
        dot: 'bg-emerald-500',
        badge: 'badge bg-emerald-50 text-emerald-700 border border-emerald-100',
        text: 'text-emerald-600',
        label: '正常',
      };
  }
}

export type TravelSceneKey =
  | 'island'
  | 'plateau'
  | 'cold'
  | 'hot'
  | 'forest'
  | 'abroad'
  | 'long_flight'
  | 'default';

export interface TravelScene {
  key: TravelSceneKey;
  label: string;
  icon: string;
  color: string;
  description: string;
  match: (destination: string) => boolean;
  rules: SceneRule[];
}

interface SceneRule {
  categories: MedicineCategory[];
  multiplier: number;
  addIfMissing?: MedicineCategory[];
  reason: string;
}

export const TRAVEL_SCENES: TravelScene[] = [
  {
    key: 'island',
    label: '海岛/海滨',
    icon: '🏝️',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: '炎热潮湿、海鲜饮食、强烈日晒',
    match: (d) =>
      /(岛|海|滩|滨|三亚|厦门|青岛|大连|马尔代夫|巴厘|普吉|冲绳|夏威夷|三亚|海南|普吉岛|苏梅|沙巴|仙本那|长滩|薄荷)/.test(
        d
      ),
    rules: [
      {
        categories: ['gastro', 'allergy'],
        multiplier: 1.8,
        reason: '海鲜过敏 + 肠胃不适高风险',
      },
      {
        categories: ['trauma'],
        multiplier: 1.5,
        reason: '水上运动易受伤',
      },
      {
        categories: ['cold'],
        multiplier: 1.2,
        reason: '空调房/海水温差感冒',
      },
    ],
  },
  {
    key: 'plateau',
    label: '高原/山区',
    icon: '🏔️',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    description: '高原反应、昼夜温差大、徒步劳累',
    match: (d) =>
      /(高原|西藏|拉萨|青海|丽江|香格里拉|稻城|色达|新都桥|林芝|日喀则|甘南|川西|云南大理|云南|云贵|雪山|山|徒步|攀登|珠峰|贡嘎|四姑娘)/.test(
        d
      ),
    rules: [
      {
        categories: ['cold'],
        multiplier: 2.0,
        reason: '昼夜温差大易感冒',
      },
      {
        categories: ['gastro'],
        multiplier: 1.5,
        reason: '饮食不适/旅途劳累',
      },
      {
        categories: ['trauma'],
        multiplier: 1.8,
        reason: '徒步攀登外伤风险',
      },
      {
        categories: ['motion'],
        multiplier: 2.0,
        reason: '山路盘弯弯道多，晕车药必带',
      },
    ],
  },
  {
    key: 'cold',
    label: '寒冷地区',
    icon: '❄️',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: '严寒气候、室内外温差大、干燥',
    match: (d) =>
      /(东北|哈尔滨|雪乡|漠河|长白山|吉林|沈阳|内蒙|呼伦贝尔|新疆|乌鲁木齐|喀纳斯|禾木|北海道|北欧|冰岛|芬兰|挪威|阿拉斯加|滑雪|寒|冰|雪)/.test(
        d
      ),
    rules: [
      {
        categories: ['cold'],
        multiplier: 2.2,
        reason: '寒冷天气感冒高发',
      },
      {
        categories: ['trauma'],
        multiplier: 1.3,
        reason: '滑倒/冻伤处理',
      },
      {
        categories: ['allergy'],
        multiplier: 1.3,
        reason: '干燥引发过敏/皮肤问题',
      },
    ],
  },
  {
    key: 'hot',
    label: '炎热/热带',
    icon: '☀️',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    description: '高温高湿、中暑风险、蚊虫叮咬',
    match: (d) =>
      /(泰国|越南|柬埔寨|新加坡|马来西亚|印尼|菲律宾|迪拜|埃及|印度|非洲|巴西|墨西哥|三亚|海南|广州|深圳|香港|澳门|东南亚|热带|沙漠|暑)/.test(
        d
      ),
    rules: [
      {
        categories: ['gastro'],
        multiplier: 2.0,
        reason: '高温食物易变质',
      },
      {
        categories: ['allergy'],
        multiplier: 1.8,
        reason: '蚊虫叮咬/热带植物过敏',
      },
      {
        categories: ['trauma'],
        multiplier: 1.4,
        reason: '暴晒灼伤处理',
      },
    ],
  },
  {
    key: 'forest',
    label: '森林/露营',
    icon: '🌲',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: '户外露营、蚊虫多、植被茂密',
    match: (d) => /(森林|露营|张家界|九寨沟|神农架|黄山|武夷山|大兴安岭|国家公园|营地|camping)/i.test(d),
    rules: [
      {
        categories: ['trauma'],
        multiplier: 2.0,
        reason: '户外外伤概率高',
      },
      {
        categories: ['allergy'],
        multiplier: 2.0,
        reason: '蚊虫/花粉/植物过敏',
      },
      {
        categories: ['gastro'],
        multiplier: 1.4,
        reason: '户外饮食条件有限',
      },
    ],
  },
  {
    key: 'abroad',
    label: '出国/长途',
    icon: '✈️',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: '长途飞行、时差、语言不通医疗不便',
    match: (d) => {
      const isAbroad = /(^[^u4e00-u9fa5]{2,}$|[A-Za-z]{3,}|\b(Japan|Korea|America|USA|Europe|UK|France|Italy|Germany|Spain|Australia|Canada|Tokyo|Seoul|Paris|London|New York|Sydney)\b)/i.test(
        d
      );
      const cnCities =
        /(北京|上海|广州|深圳|成都|重庆|西安|杭州|南京|武汉|苏州|天津|长沙|青岛|厦门|三亚|大理|丽江)/;
      const hasChinese = /[u4e00-u9fa5]/.test(d);
      return (isAbroad && !cnCities.test(d)) || (!hasChinese && d.length > 1);
    },
    rules: [
      {
        categories: ['cold', 'gastro', 'trauma', 'allergy'],
        multiplier: 1.5,
        reason: '出国购药不便，建议足量',
      },
      {
        categories: ['motion'],
        multiplier: 2.0,
        reason: '长途飞行/转机晕车药',
      },
    ],
  },
  {
    key: 'long_flight',
    label: '长途交通',
    icon: '🚄',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    description: '长时间乘车/飞机/轮船',
    match: (d) => /(自驾|火车|高铁|游轮|邮轮|跨境|横跨|跨洲)/.test(d),
    rules: [
      {
        categories: ['motion'],
        multiplier: 2.5,
        reason: '长途交通晕车晕船必备',
      },
      {
        categories: ['gastro'],
        multiplier: 1.3,
        reason: '旅途饮食不规律',
      },
    ],
  },
];

export function detectScenes(destination: string): TravelScene[] {
  if (!destination.trim()) return [];
  const matched: TravelScene[] = [];
  TRAVEL_SCENES.forEach((scene) => {
    try {
      if (scene.match(destination)) matched.push(scene);
    } catch {
      // ignore regex errors
    }
  });
  return matched;
}

export function sceneLabels(destination: string): TravelScene[] {
  return detectScenes(destination);
}

export interface SuggestedItem {
  medicineId: string;
  suggestedQuantity: number;
  reason: string;
}

export function generateSuggestedTripItems(
  trip: Trip,
  companions: FamilyMember[],
  allMedicines: Medicine[]
): SuggestedItem[] {
  const suggestions: SuggestedItem[] = [];
  const addedIds = new Set<string>();
  const scenes = detectScenes(trip.destination);

  const basicCategories: MedicineCategory[] = ['cold', 'gastro', 'trauma', 'allergy'];
  let perDayMultiplier = Math.max(1, Math.ceil(trip.days / 3));

  if (scenes.length > 0) {
    perDayMultiplier = Math.max(perDayMultiplier, Math.ceil(trip.days / 2));
  }

  basicCategories.forEach((cat) => {
    const meds = allMedicines.filter(
      (m) => m.category === cat && m.applicableTo === 'all' && !isExpired(m) && m.stockQuantity > 0
    );
    if (meds.length > 0) {
      const selected = meds.reduce((a, b) => (a.stockQuantity > b.stockQuantity ? a : b));
      if (!addedIds.has(selected.id)) {
        addedIds.add(selected.id);
        let qty = perDayMultiplier;
        let reason = '旅行常备药';

        scenes.forEach((scene) => {
          scene.rules.forEach((rule) => {
            if (rule.categories.includes(cat)) {
              qty = Math.ceil(qty * rule.multiplier);
              reason = rule.reason;
            }
          });
        });

        suggestions.push({
          medicineId: selected.id,
          suggestedQuantity: qty,
          reason,
        });
      }
    }
  });

  const motionMeds = allMedicines.filter(
    (m) => m.category === 'motion' && !isExpired(m) && m.stockQuantity > 0
  );
  if (motionMeds.length > 0 && (trip.days > 1 || scenes.some((s) => ['plateau', 'abroad', 'long_flight', 'island'].includes(s.key)))) {
    const selected = motionMeds[0];
    if (!addedIds.has(selected.id)) {
      addedIds.add(selected.id);
      let qty = Math.max(2, companions.length);
      let reason = '长途旅行晕车药';

      scenes.forEach((scene) => {
        scene.rules.forEach((rule) => {
          if (rule.categories.includes('motion')) {
            qty = Math.ceil(qty * (rule.multiplier - 0.5 > 1 ? rule.multiplier - 0.5 : 1));
            reason = rule.reason;
          }
        });
      });

      suggestions.push({
        medicineId: selected.id,
        suggestedQuantity: qty,
        reason,
      });
    }
  }

  if (scenes.length > 0) {
    scenes.forEach((scene) => {
      scene.rules.forEach((rule) => {
        if (!rule.addIfMissing) return;
        rule.addIfMissing.forEach((cat) => {
          const meds = allMedicines.filter(
            (m) => m.category === cat && !isExpired(m) && m.stockQuantity > 0 && !addedIds.has(m.id)
          );
          if (meds.length > 0) {
            const selected = meds.reduce((a, b) => (a.stockQuantity > b.stockQuantity ? a : b));
            addedIds.add(selected.id);
            suggestions.push({
              medicineId: selected.id,
              suggestedQuantity: Math.ceil(trip.days / 2),
              reason: rule.reason,
            });
          }
        });
      });
    });
  }

  companions.forEach((member) => {
    member.dedicatedMedicineIds.forEach((medId) => {
      const med = allMedicines.find((m) => m.id === medId);
      if (med && !isExpired(med) && med.stockQuantity > 0 && !addedIds.has(med.id)) {
        addedIds.add(med.id);
        let qty = Math.max(trip.days, 1);
        if (scenes.length > 0) qty = Math.ceil(qty * 1.2);
        suggestions.push({
          medicineId: medId,
          suggestedQuantity: qty,
          reason: `${member.name}专用药`,
        });
      }
    });

    const chronicMeds = allMedicines.filter(
      (m) =>
        m.category === 'chronic' &&
        (m.applicableTo === member.id || m.applicableTo === 'all') &&
        !isExpired(m) &&
        m.stockQuantity > 0
    );
    chronicMeds.forEach((med) => {
      if (!addedIds.has(med.id)) {
        addedIds.add(med.id);
        suggestions.push({
          medicineId: med.id,
          suggestedQuantity: trip.days + 2,
          reason: `${member.name}慢性病药(含备用)`,
        });
      }
    });

    if (member.allergies.trim()) {
      suggestions.forEach((s) => {
        const med = allMedicines.find((m) => m.id === s.medicineId);
        if (med?.category === 'allergy') {
          s.suggestedQuantity = Math.ceil(s.suggestedQuantity * 1.5);
        }
      });
    }
  });

  if (companions.some((m) => m.age > 60)) {
    suggestions.forEach((s) => {
      s.suggestedQuantity = Math.ceil(s.suggestedQuantity * 1.2);
    });
  }

  if (scenes.length > 0 && companions.some((m) => m.age < 12)) {
    suggestions.forEach((s) => {
      const med = allMedicines.find((m) => m.id === s.medicineId);
      if (med && (med.category === 'cold' || med.category === 'gastro' || med.category === 'allergy')) {
        s.suggestedQuantity = Math.ceil(s.suggestedQuantity * 1.3);
      }
    });
  }

  return suggestions;
}

export function calculateRestock(medicine: Medicine, tripItems: TripItem[]): number {
  const relevantItems = tripItems.filter((ti) => ti.medicineId === medicine.id);
  const totalPacked = relevantItems.reduce((sum, ti) => sum + ti.packedQuantity, 0);
  const minStock = 5;
  const current = medicine.stockQuantity;
  const projectedShortfall = Math.max(0, minStock - (current - totalPacked));
  const consumed = relevantItems.reduce((sum, ti) => sum + ti.consumedQuantity, 0);
  return Math.max(consumed, projectedShortfall);
}

export function getLowStockMedicines(medicines: Medicine[], threshold: number = 3): Medicine[] {
  return medicines.filter((m) => m.stockQuantity <= threshold && !isExpired(m));
}
