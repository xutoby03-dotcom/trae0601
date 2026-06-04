export type FieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'number' | 'rating' | 'file';

export interface Option {
  id: string;
  label: string;
  value: string;
}

export interface Condition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  title: string;
  placeholder: string;
  required: boolean;
  options?: Option[];
  min?: number;
  max?: number;
  condition?: Condition;
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: number;
  updatedAt: number;
}

export interface FormAnswers {
  [fieldId: string]: string | string[] | number;
}

export interface FieldComponentInfo {
  type: FieldType;
  label: string;
  icon: string;
}

export const FIELD_COMPONENTS: FieldComponentInfo[] = [
  { type: 'text', label: '单行文本', icon: 'Type' },
  { type: 'textarea', label: '多行文本', icon: 'AlignLeft' },
  { type: 'radio', label: '单选', icon: 'CircleDot' },
  { type: 'checkbox', label: '多选', icon: 'CheckSquare' },
  { type: 'select', label: '下拉框', icon: 'ChevronDown' },
  { type: 'date', label: '日期选择', icon: 'Calendar' },
  { type: 'number', label: '数字', icon: 'Hash' },
  { type: 'rating', label: '评分星星', icon: 'Star' },
  { type: 'file', label: '文件上传', icon: 'Upload' },
];
