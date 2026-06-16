import { create } from 'zustand';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastType;
  duration?: number;
  icon?: ReactNode;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 3000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const { toasts, addToast, removeToast } = useToastStore();

  const showToast = {
    success: (message: string, duration?: number) =>
      addToast({ message, variant: 'success', duration }),
    error: (message: string, duration?: number) =>
      addToast({ message, variant: 'error', duration }),
    warning: (message: string, duration?: number) =>
      addToast({ message, variant: 'warning', duration }),
    info: (message: string, duration?: number) =>
      addToast({ message, variant: 'info', duration }),
  };

  return { toasts, showToast, removeToast };
}
