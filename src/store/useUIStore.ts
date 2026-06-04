import { create } from 'zustand';

interface UIStore {
  selectedFieldId: string | null;
  isPreviewMode: boolean;
  showPublishModal: boolean;
  showImportModal: boolean;
  toast: { message: string; visible: boolean } | null;
  selectField: (id: string | null) => void;
  setPreviewMode: (isPreview: boolean) => void;
  setShowPublishModal: (show: boolean) => void;
  setShowImportModal: (show: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedFieldId: null,
  isPreviewMode: false,
  showPublishModal: false,
  showImportModal: false,
  toast: null,

  selectField: (id) => set({ selectedFieldId: id }),

  setPreviewMode: (isPreview) => set({ isPreviewMode: isPreview, selectedFieldId: null }),

  setShowPublishModal: (show) => set({ showPublishModal: show }),

  setShowImportModal: (show) => set({ showImportModal: show }),

  showToast: (message) => {
    set({ toast: { message, visible: true } });
    setTimeout(() => {
      set({ toast: null });
    }, 2000);
  },

  hideToast: () => set({ toast: null }),
}));
