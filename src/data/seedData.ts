import type {
  Aquarium,
  FeedingPlan,
  FeedingRecord,
  WaterChange,
  WaterTest,
  FoodStock,
} from "@/types";
import { uid, todayStr } from "@/utils/formatters";
import { addDays, subDays, format } from "date-fns";

const makeAquariums = (): Aquarium[] => {
  const id1 = uid();
  const id2 = uid();
  return [
    {
      id: id1,
      name: "客厅大鱼缸",
      size_liters: 120,
      water_temp: 26,
      filter_type: "外置过滤桶 + 充氧泵",
      photo_url:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20in%20living%20room%20with%20colorful%20tropical%20fish%20plants%20soft%20lighting&image_size=square_hd",
      food_type: "颗粒型热带鱼粮",
      morning_ratio: 0.6,
      evening_ratio: 0.4,
      fish_species: [
        {
          id: uid(),
          species_name: "孔雀鱼",
          count: 12,
          daily_grams_per_fish: 0.15,
        },
        {
          id: uid(),
          species_name: "米奇鱼",
          count: 6,
          daily_grams_per_fish: 0.12,
        },
        {
          id: uid(),
          species_name: "斑马鱼",
          count: 8,
          daily_grams_per_fish: 0.1,
        },
      ],
      created_at: subDays(new Date(), 60).toISOString(),
      updated_at: subDays(new Date(), 2).toISOString(),
    },
    {
      id: id2,
      name: "书房小草缸",
      size_liters: 40,
      water_temp: 24,
      filter_type: "壁挂瀑布过滤器",
      photo_url:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20aquascape%20planted%20aquarium%20shrimp%20tiny%20fish%20soft%20natural%20lighting&image_size=square_hd",
      food_type: "薄片型灯科鱼粮",
      morning_ratio: 0.55,
      evening_ratio: 0.45,
      fish_species: [
        {
          id: uid(),
          species_name: "红绿灯",
          count: 15,
          daily_grams_per_fish: 0.06,
        },
        {
          id: uid(),
          species_name: "樱花虾",
          count: 20,
          daily_grams_per_fish: 0.02,
        },
      ],
      created_at: subDays(new Date(), 45).toISOString(),
      updated_at: subDays(new Date(), 1).toISOString(),
    },
  ];
};

const makeFeedingPlans = (aquariums: Aquarium[]): FeedingPlan[] => {
  const plans: FeedingPlan[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    aquariums.forEach((a) => {
      const total = a.fish_species.reduce(
        (s, f) => s + f.count * f.daily_grams_per_fish,
        0
      );
      plans.push({
        id: uid(),
        aquarium_id: a.id,
        date: d,
        morning_grams: Math.round(total * a.morning_ratio * 10) / 10,
        evening_grams: Math.round(total * a.evening_ratio * 10) / 10,
        morning_done: i > 0,
        evening_done: i > 1,
      });
    });
  }
  return plans;
};

const feeders = ["爸爸", "妈妈", "小明", "爸爸", "妈妈"];

const makeFeedingRecords = (
  aquariums: Aquarium[],
  plans: FeedingPlan[]
): FeedingRecord[] => {
  const records: FeedingRecord[] = [];
  plans.forEach((p) => {
    const a = aquariums.find((x) => x.id === p.aquarium_id);
    if (!a) return;
    if (p.morning_done) {
      records.push({
        id: uid(),
        aquarium_id: p.aquarium_id,
        datetime: new Date(`${p.date}T08:${10 + ((Math.random() * 40) | 0)}:00`).toISOString(),
        period: "morning",
        feeder: feeders[(Math.random() * feeders.length) | 0],
        actual_grams:
          Math.round(
            (p.morning_grams * (0.9 + Math.random() * 0.3)) * 10
          ) / 10,
        leftover_level: (["none", "none", "little", "none", "medium"] as const)[
          (Math.random() * 5) | 0
        ],
        fish_status: (["normal", "normal", "active", "normal"] as const)[
          (Math.random() * 4) | 0
        ],
      });
    }
    if (p.evening_done) {
      records.push({
        id: uid(),
        aquarium_id: p.aquarium_id,
        datetime: new Date(`${p.date}T18:${20 + ((Math.random() * 40) | 0)}:00`).toISOString(),
        period: "evening",
        feeder: feeders[(Math.random() * feeders.length) | 0],
        actual_grams:
          Math.round(
            (p.evening_grams * (0.9 + Math.random() * 0.3)) * 10
          ) / 10,
        leftover_level: (["none", "little", "none", "none"] as const)[
          (Math.random() * 4) | 0
        ],
        fish_status: (["normal", "active", "normal"] as const)[
          (Math.random() * 3) | 0
        ],
      });
    }
  });
  return records;
};

const makeWaterChange = (aquariums: Aquarium[]): WaterChange[] => {
  const arr: WaterChange[] = [];
  aquariums.forEach((a) => {
    for (let i = 0; i < 4; i++) {
      const d = format(subDays(new Date(), i * 14 + 2), "yyyy-MM-dd");
      const liters = Math.round(a.size_liters * 0.3);
      arr.push({
        id: uid(),
        aquarium_id: a.id,
        date: d,
        changed_liters: liters,
        changed_percent: 30,
      });
    }
  });
  return arr;
};

const makeWaterTest = (aquariums: Aquarium[]): WaterTest[] => {
  const arr: WaterTest[] = [];
  aquariums.forEach((a) => {
    for (let i = 0; i < 5; i++) {
      const d = format(subDays(new Date(), i * 7 + 1), "yyyy-MM-dd");
      arr.push({
        id: uid(),
        aquarium_id: a.id,
        date: d,
        ph: 6.8 + Math.round(Math.random() * 10) / 10,
        ammonia: Math.round(Math.random() * 3) / 10,
        nitrite: Math.round(Math.random() * 2) / 10,
        nitrate: 5 + Math.round(Math.random() * 20),
      });
    }
  });
  return arr;
};

const makeFoodStock = (): FoodStock[] => [
  {
    id: uid(),
    food_name: "德彩热带鱼颗粒粮",
    food_type: "颗粒型热带鱼粮",
    current_grams: 420,
    last_purchase_date: format(subDays(new Date(), 20), "yyyy-MM-dd"),
  },
  {
    id: uid(),
    food_name: "高够力灯科薄片",
    food_type: "薄片型灯科鱼粮",
    current_grams: 85,
    last_purchase_date: format(subDays(new Date(), 35), "yyyy-MM-dd"),
  },
];

export interface SeedData {
  aquariums: Aquarium[];
  plans: FeedingPlan[];
  records: FeedingRecord[];
  waterChanges: WaterChange[];
  waterTests: WaterTest[];
  stocks: FoodStock[];
}

export const buildSeedData = (): SeedData => {
  const aquariums = makeAquariums();
  const plans = makeFeedingPlans(aquariums);
  const records = makeFeedingRecords(aquariums, plans);
  const waterChanges = makeWaterChange(aquariums);
  const waterTests = makeWaterTest(aquariums);
  const stocks = makeFoodStock();
  return { aquariums, plans, records, waterChanges, waterTests, stocks };
};

export const SEED_DATA: SeedData = /*#__PURE__*/ buildSeedData();

export const buildDailyPlanForAquarium = (
  a: Aquarium,
  date = todayStr()
): FeedingPlan => {
  const total = a.fish_species.reduce(
    (s, f) => s + f.count * f.daily_grams_per_fish,
    0
  );
  return {
    id: uid(),
    aquarium_id: a.id,
    date,
    morning_grams: Math.round(total * a.morning_ratio * 10) / 10,
    evening_grams: Math.round(total * a.evening_ratio * 10) / 10,
    morning_done: false,
    evening_done: false,
  };
};

export { addDays };
