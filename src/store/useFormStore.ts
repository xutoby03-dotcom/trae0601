import { create } from 'zustand';
import type { FormData, FormField, FieldType, Option } from '../types/form';
import { generateId } from '../utils/generateId';

const STORAGE_KEY = 'form_builder_draft';

interface FormStore {
  formData: FormData;
  init: () => void;
  addField: (type: FieldType, index?: number) => void;
  duplicateField: (id: string) => string | null;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  updateFormMeta: (updates: Partial<Pick<FormData, 'title' | 'description'>>) => void;
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionId: string, updates: Partial<Option>) => void;
  deleteOption: (fieldId: string, optionId: string) => void;
  toJSON: () => string;
  loadFromJSON: (json: string) => { success: boolean; error?: string };
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

  duplicateField: (id) => {
    let newFieldId: string | null = null;
    set((state) => {
      const fieldIndex = state.formData.fields.findIndex((f) => f.id === id);
      if (fieldIndex === -1) return state;

      const originalField = state.formData.fields[fieldIndex];
      const newId = generateId();
      newFieldId = newId;

      const clonedOptions = originalField.options?.map((opt) => ({
        ...opt,
        id: generateId(),
      }));

      const newField: FormField = {
        ...originalField,
        id: newId,
        options: clonedOptions,
        condition: undefined,
      };

      const newFields = [...state.formData.fields];
      newFields.splice(fieldIndex + 1, 0, newField);

      return {
        formData: {
          ...state.formData,
          fields: newFields,
          updatedAt: Date.now(),
        },
      };
    });
    get().saveToStorage();
    return newFieldId;
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

      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { success: false, error: 'JSON 必须是一个对象' };
      }

      if (!parsed.id || typeof parsed.id !== 'string') {
        return { success: false, error: '缺少或无效的表单ID (id)' };
      }

      if (parsed.title === undefined || typeof parsed.title !== 'string') {
        return { success: false, error: '缺少或无效的表单标题 (title)' };
      }

      if (parsed.description === undefined || typeof parsed.description !== 'string') {
        return { success: false, error: '缺少或无效的表单描述 (description)' };
      }

      if (!Array.isArray(parsed.fields)) {
        return { success: false, error: '字段列表 (fields) 必须是数组' };
      }

      const validFieldTypes = ['text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'number', 'rating', 'file'];

      for (let i = 0; i < parsed.fields.length; i++) {
        const field = parsed.fields[i];
        const fieldNum = i + 1;

        if (typeof field !== 'object' || field === null) {
          return { success: false, error: `第 ${fieldNum} 个字段格式无效` };
        }

        if (!field.id || typeof field.id !== 'string') {
          return { success: false, error: `第 ${fieldNum} 个字段缺少或无效的ID (id)` };
        }

        if (!field.type || typeof field.type !== 'string' || !validFieldTypes.includes(field.type)) {
          return { success: false, error: `第 ${fieldNum} 个字段类型无效，必须是: ${validFieldTypes.join(', ')}` };
        }

        if (field.title === undefined || typeof field.title !== 'string') {
          return { success: false, error: `第 ${fieldNum} 个字段缺少或无效的标题 (title)` };
        }

        if (field.placeholder === undefined || typeof field.placeholder !== 'string') {
          return { success: false, error: `第 ${fieldNum} 个字段缺少或无效的提示文字 (placeholder)` };
        }

        if (field.required === undefined || typeof field.required !== 'boolean') {
          return { success: false, error: `第 ${fieldNum} 个字段缺少或无效的必填标识 (required)` };
        }

        if (['radio', 'checkbox', 'select'].includes(field.type)) {
          if (!Array.isArray(field.options)) {
            return { success: false, error: `第 ${fieldNum} 个字段 (${field.type}) 缺少选项列表 (options)` };
          }
          if (field.options.length === 0) {
            return { success: false, error: `第 ${fieldNum} 个字段 (${field.type}) 选项列表不能为空` };
          }
          for (let j = 0; j < field.options.length; j++) {
            const opt = field.options[j];
            if (typeof opt !== 'object' || opt === null) {
              return { success: false, error: `第 ${fieldNum} 个字段的第 ${j + 1} 个选项格式无效` };
            }
            if (!opt.id || typeof opt.id !== 'string') {
              return { success: false, error: `第 ${fieldNum} 个字段的第 ${j + 1} 个选项缺少ID (id)` };
            }
            if (opt.label === undefined || typeof opt.label !== 'string') {
              return { success: false, error: `第 ${fieldNum} 个字段的第 ${j + 1} 个选项缺少标签 (label)` };
            }
            if (opt.value === undefined || typeof opt.value !== 'string') {
              return { success: false, error: `第 ${fieldNum} 个字段的第 ${j + 1} 个选项缺少值 (value)` };
            }
          }
        }

        if (field.type === 'number' || field.type === 'rating') {
          if (field.min !== undefined && typeof field.min !== 'number') {
            return { success: false, error: `第 ${fieldNum} 个字段的最小值 (min) 必须是数字` };
          }
          if (field.max !== undefined && typeof field.max !== 'number') {
            return { success: false, error: `第 ${fieldNum} 个字段的最大值 (max) 必须是数字` };
          }
        }

        if (field.condition !== undefined) {
          if (typeof field.condition !== 'object' || field.condition === null) {
            return { success: false, error: `第 ${fieldNum} 个字段的条件逻辑格式无效` };
          }
          if (!field.condition.fieldId || typeof field.condition.fieldId !== 'string') {
            return { success: false, error: `第 ${fieldNum} 个字段的条件逻辑缺少关联字段ID (fieldId)` };
          }
          if (!field.condition.operator || !['equals', 'not_equals', 'contains'].includes(field.condition.operator)) {
            return { success: false, error: `第 ${fieldNum} 个字段的条件逻辑操作符 (operator) 无效` };
          }
          if (field.condition.value === undefined || typeof field.condition.value !== 'string') {
            return { success: false, error: `第 ${fieldNum} 个字段的条件逻辑缺少目标值 (value)` };
          }
        }
      }

      set({ formData: parsed });
      get().saveToStorage();
      return { success: true };
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { success: false, error: `JSON 解析错误: ${e.message}` };
      }
      return { success: false, error: `导入失败: ${e instanceof Error ? e.message : String(e)}` };
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
