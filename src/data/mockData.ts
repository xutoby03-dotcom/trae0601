import type { Dish, Order } from "@/types";

const today = new Date();
const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const todayStr = formatDate(today);
const tomorrowStr = formatDate(addDays(today, 1));
const yesterdayStr = formatDate(addDays(today, -1));

export const MOCK_DISHES: Dish[] = [
  // 今日早餐
  {
    id: "d1",
    name: "小米南瓜粥",
    type: "vegetarian",
    price: 6,
    allergens: [],
    maxQuantity: 50,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a%20warm%20bowl%20of%20chinese%20millet%20pumpkin%20porridge%2C%20soft%20lighting%2C%20appetizing%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "breakfast",
  },
  {
    id: "d2",
    name: "鲜肉包子",
    type: "meat",
    price: 3,
    allergens: ["小麦", "猪肉"],
    maxQuantity: 80,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20steamed%20pork%20buns%20%28baozi%29%20in%20a%20bamboo%20steamer%2C%20appetizing%20food%20photography%2C%20warm%20light&image_size=square",
    date: todayStr,
    mealType: "breakfast",
  },
  {
    id: "d3",
    name: "茶叶蛋",
    type: "mixed",
    price: 2,
    allergens: ["鸡蛋"],
    maxQuantity: 60,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20tea%20eggs%20with%20cracked%20shells%2C%20soy%20sauce%20braised%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "breakfast",
  },
  {
    id: "d4",
    name: "凉拌黄瓜",
    type: "vegetarian",
    price: 4,
    allergens: ["辛辣"],
    maxQuantity: 40,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cold%20cucumber%20salad%20with%20garlic%20and%20chili%2C%20crisp%20and%20fresh%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "breakfast",
  },
  // 今日午餐
  {
    id: "d5",
    name: "红烧狮子头",
    type: "meat",
    price: 18,
    allergens: ["鸡蛋", "大豆"],
    maxQuantity: 40,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20braised%20pork%20meatballs%20%28shizi%20tou%29%20in%20brown%20sauce%2C%20garnished%20with%20greens%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "lunch",
  },
  {
    id: "d6",
    name: "清炒时蔬",
    type: "vegetarian",
    price: 8,
    allergens: [],
    maxQuantity: 50,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20stir%20fried%20seasonal%20green%20vegetables%20with%20garlic%2C%20simple%20and%20healthy%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "lunch",
  },
  {
    id: "d7",
    name: "番茄炒蛋",
    type: "mixed",
    price: 10,
    allergens: ["鸡蛋"],
    maxQuantity: 60,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20tomato%20egg%20stir%20fry%2C%20classic%20home%20style%20dish%2C%20vibrant%20red%20and%20yellow%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "lunch",
  },
  {
    id: "d8",
    name: "清蒸鲈鱼",
    type: "meat",
    price: 22,
    allergens: ["海鲜"],
    maxQuantity: 25,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20steamed%20sea%20bass%20with%20ginger%20scallion%20and%20soy%20sauce%2C%20delicate%20and%20elegant%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "lunch",
  },
  {
    id: "d9",
    name: "米饭",
    type: "vegetarian",
    price: 2,
    allergens: [],
    maxQuantity: 100,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a%20bowl%20of%20steamed%20white%20rice%2C%20fluffy%20and%20perfect%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "lunch",
  },
  // 今日晚餐
  {
    id: "d10",
    name: "小米粥",
    type: "vegetarian",
    price: 5,
    allergens: [],
    maxQuantity: 50,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=a%20warm%20bowl%20of%20chinese%20millet%20porridge%2C%20smooth%20and%20creamy%2C%20comfort%20food%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "dinner",
  },
  {
    id: "d11",
    name: "酱牛肉",
    type: "meat",
    price: 20,
    allergens: ["大豆", "小麦"],
    maxQuantity: 30,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20sliced%20braised%20beef%20shank%20%28jiang%20niu%20rou%29%20with%20soy%20sauce%2C%20appetizing%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "dinner",
  },
  {
    id: "d12",
    name: "蒜蓉菠菜",
    type: "vegetarian",
    price: 7,
    allergens: [],
    maxQuantity: 45,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20spinach%20stir%20fried%20with%20garlic%2C%20bright%20green%20and%20healthy%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "dinner",
  },
  {
    id: "d13",
    name: "花卷",
    type: "vegetarian",
    price: 2,
    allergens: ["小麦"],
    maxQuantity: 60,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20steamed%20twisted%20rolls%20%28huajuan%29%20with%20scallion%2C%20fluffy%20and%20savory%2C%20food%20photography&image_size=square",
    date: todayStr,
    mealType: "dinner",
  },
  // 明日午餐
  {
    id: "d14",
    name: "宫保鸡丁",
    type: "meat",
    price: 16,
    allergens: ["花生", "辛辣"],
    maxQuantity: 40,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20kung%20pao%20chicken%20with%20peanuts%20and%20dried%20chili%2C%20classic%20sichuan%20dish%2C%20food%20photography&image_size=square",
    date: tomorrowStr,
    mealType: "lunch",
  },
  {
    id: "d15",
    name: "地三鲜",
    type: "vegetarian",
    price: 12,
    allergens: ["大豆"],
    maxQuantity: 40,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20di%20san%20xian%20%28potato%20eggplant%20pepper%20stir%20fry%29%2C%20northeastern%20dish%2C%20food%20photography&image_size=square",
    date: tomorrowStr,
    mealType: "lunch",
  },
  // 昨日午餐（历史数据）
  {
    id: "d16",
    name: "红烧肉",
    type: "meat",
    price: 20,
    allergens: ["大豆"],
    maxQuantity: 40,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20braised%20pork%20belly%20%28hongshao%20rou%29%20with%20glossy%20brown%20sauce%2C%20classic%20dish%2C%20food%20photography&image_size=square",
    date: yesterdayStr,
    mealType: "lunch",
  },
  {
    id: "d17",
    name: "麻婆豆腐",
    type: "mixed",
    price: 10,
    allergens: ["大豆", "辛辣"],
    maxQuantity: 50,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20mapo%20tofu%20with%20minced%20pork%20and%20chili%20oil%2C%20sichuan%20spicy%20dish%2C%20food%20photography&image_size=square",
    date: yesterdayStr,
    mealType: "lunch",
  },
];

const todayHour = today.getHours();
const makeTime = (hour: number, minute = 0) => {
  const d = new Date(today);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const rawMockOrders = [
  {
    id: "o1",
    elderlyName: "张奶奶",
    building: "1号楼",
    mealType: "lunch",
    dietaryNote: "不吃辣，少盐",
    deliveryType: "dine_in",
    phone: "138****1234",
    status: "pending",
    items: [
      { dishId: "d5", dishName: "红烧狮子头", quantity: 1, price: 18 },
      { dishId: "d6", dishName: "清炒时蔬", quantity: 1, price: 8 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 9 ? 9 : todayHour, 15),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o2",
    elderlyName: "李爷爷",
    building: "3号楼",
    mealType: "lunch",
    dietaryNote: "",
    deliveryType: "delivery",
    phone: "139****5678",
    status: "cooking",
    items: [
      { dishId: "d8", dishName: "清蒸鲈鱼", quantity: 1, price: 22 },
      { dishId: "d7", dishName: "番茄炒蛋", quantity: 1, price: 10 },
      { dishId: "d9", dishName: "米饭", quantity: 2, price: 2 },
    ],
    createdAt: makeTime(todayHour > 8 ? 8 : todayHour, 30),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o3",
    elderlyName: "王阿姨",
    building: "2号楼",
    mealType: "lunch",
    dietaryNote: "海鲜过敏",
    deliveryType: "takeaway",
    phone: "136****9012",
    status: "pending",
    items: [
      { dishId: "d5", dishName: "红烧狮子头", quantity: 1, price: 18 },
      { dishId: "d7", dishName: "番茄炒蛋", quantity: 1, price: 10 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 9 ? 9 : todayHour, 45),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o4",
    elderlyName: "赵大爷",
    building: "5号楼",
    mealType: "lunch",
    dietaryNote: "糖尿病，无糖",
    deliveryType: "delivery",
    phone: "135****3456",
    status: "completed",
    items: [
      { dishId: "d6", dishName: "清炒时蔬", quantity: 2, price: 8 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 8 ? 8 : todayHour, 0),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o5",
    elderlyName: "孙奶奶",
    building: "1号楼",
    mealType: "breakfast",
    dietaryNote: "",
    deliveryType: "dine_in",
    phone: "137****7890",
    status: "completed",
    items: [
      { dishId: "d1", dishName: "小米南瓜粥", quantity: 1, price: 6 },
      { dishId: "d2", dishName: "鲜肉包子", quantity: 2, price: 3 },
    ],
    createdAt: makeTime(todayHour > 6 ? 6 : todayHour, 30),
    cancelDeadline: makeTime(7),
  },
  {
    id: "o6",
    elderlyName: "周爷爷",
    building: "4号楼",
    mealType: "lunch",
    dietaryNote: "",
    deliveryType: "dine_in",
    phone: "133****2345",
    status: "pending",
    items: [
      { dishId: "d5", dishName: "红烧狮子头", quantity: 1, price: 18 },
      { dishId: "d6", dishName: "清炒时蔬", quantity: 1, price: 8 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 9 ? 9 : todayHour, 20),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o7",
    elderlyName: "吴阿姨",
    building: "6号楼",
    mealType: "dinner",
    dietaryNote: "不吃牛肉",
    deliveryType: "takeaway",
    phone: "131****6789",
    status: "pending",
    items: [
      { dishId: "d10", dishName: "小米粥", quantity: 1, price: 5 },
      { dishId: "d12", dishName: "蒜蓉菠菜", quantity: 1, price: 7 },
      { dishId: "d13", dishName: "花卷", quantity: 2, price: 2 },
    ],
    createdAt: makeTime(todayHour > 14 ? 14 : todayHour, 10),
    cancelDeadline: makeTime(16),
  },
  {
    id: "o8",
    elderlyName: "郑大爷",
    building: "7号楼",
    mealType: "lunch",
    dietaryNote: "鸡蛋过敏",
    deliveryType: "delivery",
    phone: "132****0123",
    status: "cooking",
    items: [
      { dishId: "d8", dishName: "清蒸鲈鱼", quantity: 1, price: 22 },
      { dishId: "d6", dishName: "清炒时蔬", quantity: 1, price: 8 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 8 ? 8 : todayHour, 50),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o9",
    elderlyName: "陈奶奶",
    building: "3号楼",
    mealType: "breakfast",
    dietaryNote: "",
    deliveryType: "dine_in",
    phone: "138****4567",
    status: "completed",
    items: [
      { dishId: "d1", dishName: "小米南瓜粥", quantity: 1, price: 6 },
      { dishId: "d3", dishName: "茶叶蛋", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 6 ? 6 : todayHour, 45),
    cancelDeadline: makeTime(7),
  },
  {
    id: "o10",
    elderlyName: "刘爷爷",
    building: "2号楼",
    mealType: "lunch",
    dietaryNote: "",
    deliveryType: "dine_in",
    phone: "139****8901",
    status: "cancelled",
    items: [
      { dishId: "d7", dishName: "番茄炒蛋", quantity: 1, price: 10 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(8, 15),
    cancelledAt: makeTime(9, 30),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o11",
    elderlyName: "黄阿姨",
    building: "5号楼",
    mealType: "lunch",
    dietaryNote: "少盐少油",
    deliveryType: "delivery",
    phone: "136****2345",
    status: "pending",
    items: [
      { dishId: "d6", dishName: "清炒时蔬", quantity: 2, price: 8 },
      { dishId: "d9", dishName: "米饭", quantity: 1, price: 2 },
    ],
    createdAt: makeTime(todayHour > 9 ? 9 : todayHour, 10),
    cancelDeadline: makeTime(10),
  },
  {
    id: "o12",
    elderlyName: "林大爷",
    building: "8号楼",
    mealType: "dinner",
    dietaryNote: "",
    deliveryType: "dine_in",
    phone: "135****6789",
    status: "pending",
    items: [
      { dishId: "d11", dishName: "酱牛肉", quantity: 1, price: 20 },
      { dishId: "d12", dishName: "蒜蓉菠菜", quantity: 1, price: 7 },
      { dishId: "d10", dishName: "小米粥", quantity: 1, price: 5 },
    ],
    createdAt: makeTime(todayHour > 14 ? 14 : todayHour, 30),
    cancelDeadline: makeTime(16),
  },
];

const deadlineMap: Record<string, number> = {
  breakfast: 7,
  lunch: 10,
  dinner: 16,
};

export const MOCK_ORDERS: Order[] = rawMockOrders.map((o: any) => {
  const d = new Date(today);
  d.setHours(deadlineMap[o.mealType], 0, 0, 0);
  return {
    ...o,
    mealDate: todayStr,
    cancelDeadline: d.toISOString(),
  };
});

export const HISTORY_ORDERS: Order[] = (() => {
  const elderlyNames = ["马奶奶", "何爷爷", "罗阿姨", "梁大爷", "宋奶奶", "唐爷爷"];
  const buildings = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];
  const deliveryTypes: Array<"dine_in" | "takeaway" | "delivery"> = [
    "dine_in",
    "takeaway",
    "delivery",
    "dine_in",
    "dine_in",
    "delivery",
  ];
  const statuses: Array<"completed" | "cancelled"> = [
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "cancelled",
  ];
  const orders: Order[] = [];

  for (let dayOffset = -7; dayOffset <= -2; dayOffset++) {
    const orderDate = addDays(today, dayOffset);
    const orderDateStr = formatDate(orderDate);
    const orderCount = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < orderCount; i++) {
      const idx = (i + Math.abs(dayOffset)) % 6;
      const d = new Date(orderDate);
      d.setHours(8 + (i % 4), 10 + i * 3);

      orders.push({
        id: `h-${dayOffset}-${i}`,
        elderlyName: elderlyNames[idx],
        building: buildings[idx],
        mealDate: orderDateStr,
        mealType: i % 3 === 0 ? "breakfast" : i % 3 === 1 ? "lunch" : "dinner",
        dietaryNote: i % 4 === 0 ? "少盐" : i % 5 === 0 ? "不吃辣" : "",
        deliveryType: deliveryTypes[idx],
        phone: `138****${1000 + i}`,
        status: statuses[(i + dayOffset) % 6],
        items: [
          { dishId: "d16", dishName: "红烧肉", quantity: 1, price: 20 },
          { dishId: "d17", dishName: "麻婆豆腐", quantity: 1, price: 10 },
        ],
        createdAt: d.toISOString(),
        cancelledAt:
          statuses[(i + dayOffset) % 6] === "cancelled"
            ? (() => {
                const cd = new Date(d);
                cd.setHours(cd.getHours() + 1);
                return cd.toISOString();
              })()
            : undefined,
        cancelDeadline: (() => {
          const mealType = i % 3 === 0 ? "breakfast" : i % 3 === 1 ? "lunch" : "dinner";
          const cd = new Date(orderDate);
          const deadlineMap: Record<string, number> = {
            breakfast: 7,
            lunch: 10,
            dinner: 16,
          };
          cd.setHours(deadlineMap[mealType], 0, 0, 0);
          return cd.toISOString();
        })(),
      });
    }
  }

  return orders;
})();
