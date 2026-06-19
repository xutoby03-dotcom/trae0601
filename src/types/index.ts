export type Department =
  | "技术部"
  | "产品部"
  | "设计部"
  | "运营部"
  | "市场部"
  | "人事部"
  | "财务部";

export const DEPARTMENTS: Department[] = [
  "技术部",
  "产品部",
  "设计部",
  "运营部",
  "市场部",
  "人事部",
  "财务部",
];

export type PickupPoint =
  | "前台A区"
  | "前台B区"
  | "1楼茶水间"
  | "2楼茶水间"
  | "3楼茶水间";

export const PICKUP_POINTS: PickupPoint[] = [
  "前台A区",
  "前台B区",
  "1楼茶水间",
  "2楼茶水间",
  "3楼茶水间",
];

export type DietaryRestriction =
  | "无辣"
  | "素食"
  | "海鲜过敏"
  | "花生过敏"
  | "香菜"
  | "葱";

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  "无辣",
  "素食",
  "海鲜过敏",
  "花生过敏",
  "香菜",
  "葱",
];

export type UserRole = "admin" | "leader" | "employee";

export interface Employee {
  id: string;
  name: string;
  department: Department;
  pickupPoint: PickupPoint;
  dietaryRestrictions: DietaryRestriction[];
  phoneLast4: string;
  role: UserRole;
  avatarColor: string;
  createdAt: string;
}

export type Spec = "大份" | "中份" | "小份";
export const SPECS: Spec[] = ["大份", "中份", "小份"];

export type SpiceLevel = "不辣" | "微辣" | "中辣" | "特辣";
export const SPICE_LEVELS: SpiceLevel[] = ["不辣", "微辣", "中辣", "特辣"];

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PackingStatus = "pending" | "packed" | "exception";
export type PickupStatus = "pending" | "picked";

export interface Order {
  id: string;
  employeeId: string;
  restaurant: string;
  dish: string;
  spec: Spec;
  spiceLevel: SpiceLevel;
  extraRice: boolean;
  drink: string;
  paymentStatus: PaymentStatus;
  packingStatus: PackingStatus;
  pickupStatus: PickupStatus;
  orderDate: string;
  remark: string;
}

export type ExceptionType = "missing" | "spilled" | "wrongSpice" | "other";

export const EXCEPTION_TYPES: {
  value: ExceptionType;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "missing", label: "漏餐", icon: "package-x", color: "danger" },
  { value: "spilled", label: "洒漏", icon: "droplets", color: "warning" },
  { value: "wrongSpice", label: "错辣度", icon: "flame", color: "warning" },
  { value: "other", label: "其他", icon: "alert-circle", color: "info" },
];

export type ExceptionStatus = "pending" | "processing" | "resolved";
export type RefundStatus = "none" | "pending" | "done";

export interface OrderException {
  id: string;
  orderId: string;
  type: ExceptionType;
  description: string;
  photos: string[];
  status: ExceptionStatus;
  handlerId: string | null;
  refundStatus: RefundStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  exceptionId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
}

export const RESTAURANTS = [
  "湘味小厨",
  "老乡鸡",
  "真功夫",
  "和府捞面",
  "肯德基",
  "麦当劳",
  "西贝莜面村",
  "大弗兰",
  "曼玲粥店",
  "杨国福麻辣烫",
  "赛百味",
  "和合谷",
];

export const DISHES_BY_RESTAURANT: Record<string, string[]> = {
  湘味小厨: ["小炒黄牛肉", "剁椒鱼头", "辣椒炒肉", "口味虾", "手撕包菜"],
  老乡鸡: ["梅菜扣肉饭", "香菇滑鸡饭", "酸菜鱼饭", "肥西老母鸡汤"],
  真功夫: ["香汁排骨饭", "香菇鸡腿饭", "酸菜卤肉饭", "榨菜牛肉饭"],
  和府捞面: ["金牌草本猪骨面", "番茄牛肉面", "酸辣肥牛面", "老坛酸菜面"],
  肯德基: ["香辣鸡腿堡套餐", "新奥尔良烤鸡腿堡", "K记饭桶", "老北京鸡肉卷"],
  麦当劳: ["巨无霸套餐", "板烧鸡腿堡套餐", "麦辣鸡腿堡", "吉士汉堡套餐"],
  西贝莜面村: ["西红柿浇汁莜面", "蒙古牛大骨", "烤羊腿", "西贝面筋"],
  大弗兰: ["常德牛肉粉", "长沙臭豆腐", "辣椒炒肉粉", "糖油粑粑"],
  曼玲粥店: ["皮蛋瘦肉粥", "南瓜粥", "海鲜粥", "腊八粥"],
  杨国福麻辣烫: ["经典麻辣烫", "番茄麻辣烫", "骨汤麻辣烫"],
  赛百味: ["意大利香肠三明治", "火鸡胸三明治", "金枪鱼三明治", "香烤鸡排"],
  和合谷: ["照烧鸡排饭", "咖喱牛肉饭", "麻婆豆腐饭", "宫保鸡丁饭"],
};

export const DRINKS = [
  "无",
  "可口可乐",
  "雪碧",
  "芬达",
  "矿泉水",
  "冰红茶",
  "绿茶",
  "柠檬茶",
  "橙汁",
  "酸梅汤",
  "豆奶",
  "咖啡",
];
