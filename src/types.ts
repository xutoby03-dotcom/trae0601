export type SpicyLevel = 0 | 1 | 2 | 3;

export type MenuCategory = '荤菜' | '素菜' | '主食' | '饮品' | '其他';

export type OrderStatus = 'collecting' | 'ordered' | 'delivered' | 'closed';

export type ItemStatus = 'ordered' | 'paid' | 'picked_up' | 'missing' | 'wrong';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  spicyLevel: SpicyLevel;
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  notes: string[];
  needInvoice: boolean;
  status: ItemStatus;
}

export interface Participant {
  id: string;
  name: string;
  items: OrderItem[];
}

export interface GroupOrder {
  id: string;
  restaurant: string;
  deadline: string;
  deliveryFee: number;
  discountThreshold: number;
  discountAmount: number;
  organizerName: string;
  menu: MenuItem[];
  participants: Participant[];
  status: OrderStatus;
  createdAt: string;
}

export interface PersonStats {
  name: string;
  totalSpent: number;
  orderCount: number;
  frequentNotes: { note: string; count: number }[];
}

export interface MonthlyStats {
  frequentRestaurants: { name: string; count: number }[];
  personStats: PersonStats[];
  errorProneNotes: { note: string; count: number }[];
}
