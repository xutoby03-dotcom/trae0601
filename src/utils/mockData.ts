import {
  Employee,
  Order,
  OrderException,
  Department,
  PickupPoint,
  DietaryRestriction,
  Spec,
  SpiceLevel,
  DEPARTMENTS,
  PICKUP_POINTS,
  DIETARY_RESTRICTIONS,
  RESTAURANTS,
  DISHES_BY_RESTAURANT,
  DRINKS,
} from "@/types";
import { pickColor } from "./colors";
import { uid, formatDate, lastNDays } from "./formatters";

const NAMES = [
  "张伟",
  "李娜",
  "王芳",
  "刘洋",
  "陈静",
  "杨帆",
  "赵磊",
  "黄敏",
  "周杰",
  "吴婷",
  "徐强",
  "孙丽",
  "马超",
  "朱雪",
  "胡斌",
  "郭琳",
  "何军",
  "高珊",
  "林鹏",
  "罗娜",
  "郑浩",
  "梁曼",
  "谢飞",
  "宋佳",
  "唐磊",
  "韩雪",
  "曹阳",
  "许瑶",
  "邓辉",
  "冯颖",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMany = <T>(arr: T[], max: number): T[] => {
  const n = Math.floor(Math.random() * max);
  const result: T[] = [];
  const copy = [...arr];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

export const generateMockEmployees = (): Employee[] => {
  const employees: Employee[] = [];
  const admin = {
    id: uid(),
    name: "王行政",
    department: "人事部" as Department,
    pickupPoint: "前台A区" as PickupPoint,
    dietaryRestrictions: [] as DietaryRestriction[],
    phoneLast4: "8888",
    role: "admin" as const,
    avatarColor: pickColor("王行政"),
    createdAt: formatDate(new Date()),
  };
  employees.push(admin);

  NAMES.slice(0, 29).forEach((name, i) => {
    employees.push({
      id: uid(),
      name,
      department: pick(DEPARTMENTS),
      pickupPoint: pick(PICKUP_POINTS),
      dietaryRestrictions: pickMany(DIETARY_RESTRICTIONS, 4),
      phoneLast4: String(Math.floor(1000 + Math.random() * 9000)),
      role: i < 6 ? "leader" : "employee",
      avatarColor: pickColor(name),
      createdAt: formatDate(new Date()),
    });
  });

  return employees;
};

export const generateMockOrders = (employees: Employee[]): Order[] => {
  const orders: Order[] = [];
  const today = formatDate(new Date());
  const yesterday = formatDate(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  employees.forEach((emp, idx) => {
    const n = Math.random() < 0.85 ? 1 : 0;
    if (n === 0) return;
    const restaurant = pick(RESTAURANTS);
    const dishes = DISHES_BY_RESTAURANT[restaurant] ?? ["招牌菜"];
    const spiceChoices = emp.dietaryRestrictions.includes("无辣")
      ? (["不辣"] as SpiceLevel[])
      : (["不辣", "微辣", "中辣", "特辣"] as SpiceLevel[]);

    const order: Order = {
      id: uid(),
      employeeId: emp.id,
      restaurant,
      dish: pick(dishes),
      spec: pick(["大份", "中份", "小份"] as Spec[]),
      spiceLevel: pick(spiceChoices),
      extraRice: Math.random() < 0.35,
      drink: pick(DRINKS),
      paymentStatus: pick(["unpaid", "paid", "paid", "paid"]),
      packingStatus: idx % 7 === 0
        ? "exception"
        : idx < 18
        ? "packed"
        : "pending",
      pickupStatus: idx < 12 ? "picked" : "pending",
      orderDate: today,
      remark: idx % 11 === 3 ? "多加一份汤" : idx % 13 === 5 ? "不要香菜" : "",
    };
    orders.push(order);

    if (idx % 5 === 0) {
      orders.push({
        id: uid(),
        employeeId: emp.id,
        restaurant: pick(RESTAURANTS),
        dish: pick(DISHES_BY_RESTAURANT[pick(RESTAURANTS)] ?? ["招牌菜"]),
        spec: "中份",
        spiceLevel: pick(spiceChoices),
        extraRice: false,
        drink: "无",
        paymentStatus: "paid",
        packingStatus: "packed",
        pickupStatus: "picked",
        orderDate: yesterday,
        remark: "",
      });
    }
  });

  return orders;
};

export const generateMockExceptions = (
  orders: Order[],
  employees: Employee[]
): OrderException[] => {
  const exceptions: OrderException[] = [];
  const exceptionOrders = orders.filter(
    (o) => o.packingStatus === "exception"
  );
  const leaderIds = employees.filter((e) => e.role === "leader").map((e) => e.id);

  exceptionOrders.forEach((order, i) => {
    const types: OrderException["type"][] = [
      "missing",
      "spilled",
      "wrongSpice",
      "other",
    ];
    exceptions.push({
      id: uid(),
      orderId: order.id,
      type: types[i % types.length],
      description:
        i % 3 === 0
          ? "商家漏送一份，已联系补发"
          : i % 3 === 1
          ? "外卖袋破损，汤汁洒出"
          : "点的是不辣，但送来是中辣",
      photos: [],
      status: i % 4 === 0 ? "resolved" : i % 4 === 1 ? "processing" : "pending",
      handlerId: leaderIds[i % leaderIds.length],
      refundStatus: i % 4 === 0 ? "done" : i % 4 === 1 ? "pending" : "none",
      createdAt: formatDate(new Date()),
    });
  });

  for (let d = 6; d >= 1; d--) {
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    const n = Math.floor(Math.random() * 2) + 1;
    for (let k = 0; k < n; k++) {
      exceptions.push({
        id: uid(),
        orderId: orders[k % orders.length].id,
        type: pick(["missing", "spilled", "wrongSpice", "other"]),
        description: "历史异常记录",
        photos: [],
        status: d > 3 ? "resolved" : "pending",
        handlerId: leaderIds[k % leaderIds.length],
        refundStatus: d > 3 ? "done" : "none",
        createdAt: formatDate(date),
      });
    }
  }

  return exceptions;
};

export const getHistoryLeakRateData = (): {
  date: string;
  rate: number;
  total: number;
  leak: number;
}[] => {
  return lastNDays(7).map((date) => {
    const total = 22 + Math.floor(Math.random() * 8);
    const leak = Math.floor(Math.random() * 3);
    return {
      date,
      total,
      leak,
      rate: Number(((leak / total) * 100).toFixed(1)),
    };
  });
};
