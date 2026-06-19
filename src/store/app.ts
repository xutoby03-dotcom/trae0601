import { create } from "zustand";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppState {
  toasts: Toast[];
  pendingDestruction: number;
  activeIncidents: number;
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
  setPendingDestruction: (n: number) => void;
  setActiveIncidents: (n: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  toasts: [],
  pendingDestruction: 0,
  activeIncidents: 0,
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setPendingDestruction: (n) => set({ pendingDestruction: n }),
  setActiveIncidents: (n) => set({ activeIncidents: n }),
}));
