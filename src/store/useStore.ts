import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Order, OrderItem, OrderStatus } from '@/types';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '豆浆',
    category: '饮品',
    flavor: ['甜', '无糖'],
    addOns: [],
    prepTime: 2,
    stock: 50,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20soy%20milk%20in%20a%20white%20ceramic%20bowl%2C%20warm%20steaming%20breakfast%20drink%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p2',
    name: '饭团',
    category: '主食',
    flavor: ['原味'],
    addOns: ['加蛋', '加油条', '加肉松'],
    prepTime: 5,
    stock: 30,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20rice%20ball%20fantuan%20with%20sesame%2C%20wrapped%20in%20plastic%20wrap%2C%20warm%20breakfast%20food%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p3',
    name: '肉包',
    category: '主食',
    flavor: ['原味'],
    addOns: [],
    prepTime: 3,
    stock: 40,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20steamed%20meat%20bun%20baozi%2C%20white%20fluffy%20dough%2C%20warm%20breakfast%20food%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p4',
    name: '菜包',
    category: '主食',
    flavor: ['原味'],
    addOns: [],
    prepTime: 3,
    stock: 35,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20steamed%20vegetable%20bun%20baozi%20green%20filling%2C%20warm%20breakfast%20food%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p5',
    name: '油条',
    category: '主食',
    flavor: ['原味'],
    addOns: [],
    prepTime: 4,
    stock: 45,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20fried%20dough%20stick%20youtiao%20golden%20crispy%2C%20warm%20breakfast%20food%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p6',
    name: '煎饼果子',
    category: '主食',
    flavor: ['微辣', '不辣'],
    addOns: ['加蛋', '加火腿', '加生菜'],
    prepTime: 6,
    stock: 25,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20jianbing%20crepe%20with%20egg%20and%20fillings%2C%20street%20food%20breakfast%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p7',
    name: '豆腐脑',
    category: '饮品',
    flavor: ['甜', '咸'],
    addOns: [],
    prepTime: 2,
    stock: 30,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20tofu%20pudding%20doufunao%20in%20a%20white%20bowl%2C%20warm%20breakfast%20food%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
  {
    id: 'p8',
    name: '豆沙包',
    category: '主食',
    flavor: ['原味'],
    addOns: [],
    prepTime: 3,
    stock: 20,
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20steamed%20red%20bean%20bun%2C%20sweet%20breakfast%20pastry%2C%20top-down%20view%2C%20clean%20background&image_size=square',
  },
];

interface StoreState {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => boolean;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  checkOverdueOrders: () => void;
  decreaseStock: (productId: string, quantity: number) => boolean;
  getAvailableStock: (productId: string) => number;
}

let orderCounter = 0;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      orders: [],

      addProduct: (product) => {
        const id = `p${Date.now()}`;
        set((state) => ({
          products: [...state.products, { ...product, id }],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      decreaseStock: (productId, quantity) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product || product.stock < quantity) return false;
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: p.stock - quantity } : p
          ),
        }));
        return true;
      },

      getAvailableStock: (productId) => {
        const product = get().products.find((p) => p.id === productId);
        return product?.stock ?? 0;
      },

      addOrder: (order) => {
        for (const item of order.items) {
          const stock = get().getAvailableStock(item.productId);
          if (stock < item.quantity) return false;
        }
        for (const item of order.items) {
          get().decreaseStock(item.productId, item.quantity);
        }
        orderCounter += 1;
        const id = `ORD-${String(orderCounter).padStart(4, '0')}`;
        set((state) => ({
          orders: [
            ...state.orders,
            { ...order, id, createdAt: new Date().toISOString() },
          ],
        }));
        return true;
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, orderStatus: status } : o
          ),
        }));
      },

      checkOverdueOrders: () => {
        const now = new Date();
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.orderStatus !== 'ready') return o;
            const [h, m] = o.pickupTime.split(':').map(Number);
            const pickupDate = new Date();
            pickupDate.setHours(h, m, 0, 0);
            const diffMinutes = (now.getTime() - pickupDate.getTime()) / 60000;
            if (diffMinutes > 15) {
              return { ...o, orderStatus: 'overdue' as OrderStatus };
            }
            return o;
          }),
        }));
      },
    }),
    {
      name: 'breakfast-shop-storage',
    }
  )
);
