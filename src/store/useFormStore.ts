import { create } from 'zustand';
import type { FormData, FormField, FieldType, Option } from '../types/form';
import { generateId } from '../utils/generateId';

const STORAGE_KEY = 'form_builder_draft';

interface FormStore {
  formData: FormData;
  init: () => void;
  addField: (type: FieldType, index?: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  updateFormMeta: (updates: Partial<Pick<FormData, 'title' | 'description'>>) => void;
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionId: string, updates: Partial<Option>) => void;
  deleteOption: (fieldId: string, optionId: string) => void;
  toJSON: () => string;
  loadFromJSON: (json: string) => void;
  saveToStorage: () => void;
  publish: () => string;
}

const createDefaultForm = (): FormData => ({
  id: generateId(),
  title: '未命名表单',
  description: '',
  fields: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const createDefaultField = (type: FieldType): FormField => {
  const baseField: FormField = {
    id: generateId(),
    type,
    title: '未命名题目',
    placeholder: '',
    required: false,
  };

  if (['radio', 'checkbox', 'select'].includes(type)) {
    baseField.options = [
      { id: generateId(), label: '选项A', value: 'option_a' },
      { id: generateId(), label: '选项B', value: 'option_b' },
    ];
  }

  if (type === 'number') {
    baseField.min = 0;
    baseField.max = 100;
  }

  if (type === 'rating') {
    baseField.max = 5;
  }

  return baseField;
};

export const useFormStore = create<FormStore>((set, get) => ({
  formData: createDefaultForm(),

  init: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ formData: parsed });
      }
    } catch {
      console.error('Failed to load from localStorage');
    }
  },

  addField: (type, index) => {
    set((state) => {
      const newField = createDefaultField(type);
      const newFields = [...state.formData.fields];
      if (index !== undefined && index >= 0) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
      return {
        formData: {
          ...state.formData,
          fields: newFields,
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateField: (id, updates) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
        updatedAt: Date.now(),
      },
    }));
    get().saveToStorage();
  },

  deleteField: (id) => {
    set((state) => {
      const fields = state.formData.fields.filter((f) => f.id !== id);
      const cleanedFields = fields.map((f) => {
        if (f.condition && f.condition.fieldId === id) {
          const { condition, ...rest } = f;
          return rest;
        }
        return f;
      });
      return {
        formData: {
          ...state.formData,
          fields: cleanedFields,
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  reorderFields: (oldIndex, newIndex) => {
    set((state) => {
      const newFields = [...state.formData.fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);
      return {
        formData: {
          ...state.formData,
          fields: newFields,
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
  },

  updateFormMeta: (updates) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...updates,
        updatedAt: Date.now(),
      },
    }));
    get().saveToStorage();
  },

  addOption: (fieldId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.map((f) => {
          if (f.id === fieldId && f.options) {
            const newOption: Option = {
              id: generateId(),
              label: `选项${String.fromCharCode(65 + f.options.length)}`,
              value: `option_${String.fromCharCode(97 + f.options.length)}`,
            };
            return { ...f, options: [...f.options, newOption] };
          }
          return f;
        }),
        updatedAt: Date.now(),
      },
    }));
    get().saveToStorage();
  },

  updateOption: (fieldId, optionId, updates) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.map((f) => {
          if (f.id === fieldId && f.options) {
            return {
              ...f,
              options: f.options.map((o) =>
                o.id === optionId ? { ...o, ...updates } : o
              ),
            };
          }
          return f;
        }),
        updatedAt: Date.now(),
      },
    }));
    get().saveToStorage();
  },

  deleteOption: (fieldId, optionId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        fields: state.formData.fields.map((f) => {
          if (f.id === fieldId && f.options) {
            return {
              ...f,
              options: f.options.filter((o) => o.id !== optionId),
            };
          }
          return f;
        }),
        updatedAt: Date.now(),
      },
    }));
    get().saveToStorage();
  },

  toJSON: () => {
    return JSON.stringify(get().formData, null, 2);
  },

  loadFromJSON: (json) => {
    try {
      const parsed = JSON.parse(json);
      set({ formData: parsed });
      get().saveToStorage();
    } catch {
      console.error('Invalid JSON');
    }
  },

  saveToStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().formData));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },

  publish: () => {
    const formData = get().formData;
    const publishId = generateId();
    try {
      localStorage.setItem(`published_form_${publishId}`, JSON.stringify(formData));
    } catch {
      console.error('Failed to publish');
    }
    return publishId;
  },
}));
