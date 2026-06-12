export type DishType = "meat" | "vegetarian" | "mixed";
export type MealType = "breakfast" | "lunch" | "dinner";
export type OrderStatus = "pending" | "cooking" | "completed" | "cancelled";
export type DeliveryType = "dine_in" | "takeaway" | "delivery";

export interface Dish {
  id: string;
  name: string;
  type: DishType;
  price: number;
  allergens: string[];
  maxQuantity: number;
  image: string;
  date: string;
  mealType: MealType;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  elderlyName: string;
  building: string;
  mealDate: string;
  mealType: MealType;
  dietaryNote: string;
  deliveryType: DeliveryType;
  phone: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  cancelledAt?: string;
  cancelDeadline: string;
}

export interface AppState {
  dishes: Dish[];
  orders: Order[];
  selectedDate: string;
}

export const DISH_TYPE_LABELS: Record<DishType, string> = {
  meat: "荤菜",
  vegetarian: "素菜",
  mixed: "半荤素",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "待备餐",
  cooking: "制作中",
  completed: "已完成",
  cancelled: "已取消",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  dine_in: "堂食",
  takeaway: "打包",
  delivery: "上门配送",
};

export const ALLERGEN_OPTIONS = [
  "花生",
  "海鲜",
  "鸡蛋",
  "牛奶",
  "大豆",
  "小麦",
  "坚果",
  "辛辣",
];

export const BUILDING_OPTIONS = [
  "1号楼",
  "2号楼",
  "3号楼",
  "4号楼",
  "5号楼",
  "6号楼",
  "7号楼",
  "8号楼",
];

export const CANCEL_DEADLINES: Record<MealType, string> = {
  breakfast: "07:00",
  lunch: "10:00",
  dinner: "16:00",
};
