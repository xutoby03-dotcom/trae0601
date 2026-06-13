export interface Product {
  id: string;
  name: string;
  category: string;
  flavor: string[];
  addOns: string[];
  prepTime: number;
  stock: number;
  photoUrl: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  flavor: string;
  selectedAddOns: string[];
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  pickupTime: string;
  phoneLastFour: string;
  notes: string;
  paymentStatus: 'paid' | 'unpaid';
  orderStatus: 'pending' | 'ready' | 'picked_up' | 'overdue';
  createdAt: string;
}

export type OrderStatus = Order['orderStatus'];
