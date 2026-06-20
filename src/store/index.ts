import { create } from 'zustand';
import type { Product, Employee, Department, Transaction, Bill, ProductAlerts, HotProduct, DeptConsumption, ProfitStats, DebtRanking, RestockSuggestion } from '../../shared/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface Store {
  products: Product[];
  employees: Employee[];
  departments: Department[];
  transactions: Transaction[];
  bills: Bill[];
  cart: CartItem[];
  selectedEmployee: Employee | null;
  selectedDepartment: Department | null;
  paymentType: 'monthly' | 'instant';
  alerts: ProductAlerts | null;
  loading: boolean;
  error: string | null;

  setProducts: (products: Product[]) => void;
  setEmployees: (employees: Employee[]) => void;
  setDepartments: (departments: Department[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBills: (bills: Bill[]) => void;
  setAlerts: (alerts: ProductAlerts) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedDepartment: (department: Department | null) => void;
  setPaymentType: (type: 'monthly' | 'instant') => void;

  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<Store>((set, get) => ({
  products: [],
  employees: [],
  departments: [],
  transactions: [],
  bills: [],
  cart: [],
  selectedEmployee: null,
  selectedDepartment: null,
  paymentType: 'monthly',
  alerts: null,
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),
  setEmployees: (employees) => set({ employees }),
  setDepartments: (departments) => set({ departments }),
  setTransactions: (transactions) => set({ transactions }),
  setBills: (bills) => set({ bills }),
  setAlerts: (alerts) => set({ alerts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        set({
          cart: cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        });
      }
    } else {
      set({ cart: [...cart, { product, quantity: 1 }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.product.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const product = get().cart.find(item => item.product.id === productId)?.product;
    if (product && quantity > product.stock) return;

    set({
      cart: get().cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => set({ cart: [], selectedEmployee: null, selectedDepartment: null, paymentType: 'monthly' }),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  setPaymentType: (type) => set({ paymentType: type }),

  cartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  },

  cartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
