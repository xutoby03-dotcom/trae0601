export type BasketStatus = "available" | "lent" | "repair" | "scrapped";
export type BasketSize = "S" | "M" | "L" | "XL";
export type LendStatus = "active" | "returned" | "overdue";

export interface Basket {
  id: string;
  code: string;
  size: BasketSize;
  color: string;
  colorHex: string;
  defaultLocation: string;
  maxLoadKg: number;
  status: BasketStatus;
  photoUrl: string;
  hasValuableTag: boolean;
  createdAt: string;
}

export interface ItemEntry {
  id: string;
  itemName: string;
  quantity: number;
  isValuable: boolean;
  remark?: string;
}

export interface LendRecord {
  id: string;
  basketId: string;
  basketCode?: string;
  borrowerName: string;
  department: string;
  purpose: string;
  destination: string;
  lendTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  hasValuable: boolean;
  items: ItemEntry[];
  status: LendStatus;
}

export interface ReturnCheck {
  id: string;
  lendRecordId: string;
  basketDamaged: boolean;
  damageNote?: string;
  itemsCleared: boolean;
  returnedToLocation: boolean;
  actualLocation?: string;
  checker: string;
  checkTime: string;
}

export const DEPARTMENTS = [
  "市场部",
  "销售部",
  "产品部",
  "技术部",
  "人力资源部",
  "财务部",
  "行政部",
  "运营部",
];

export const LOCATIONS = [
  "A区储物架-A01",
  "A区储物架-A02",
  "A区储物架-A03",
  "B区储物架-B01",
  "B区储物架-B02",
  "B区储物架-B03",
  "C区储物架-C01",
  "C区储物架-C02",
];

export const MEETING_ROOMS = [
  "A101 会议室",
  "A203 创新室",
  "B305 路演厅",
  "C501 董事会",
  "培训中心",
  "多功能厅",
  "员工活动区",
];

export const BASKET_COLORS: { name: string; hex: string }[] = [
  { name: "深海蓝", hex: "#1e3a5f" },
  { name: "森林绿", hex: "#059669" },
  { name: "阳光橙", hex: "#ea580c" },
  { name: "典雅灰", hex: "#64748b" },
  { name: "中国红", hex: "#dc2626" },
  { name: "明黄", hex: "#f59e0b" },
  { name: "浅蓝", hex: "#38bdf8" },
  { name: "墨黑", hex: "#1f2937" },
];
