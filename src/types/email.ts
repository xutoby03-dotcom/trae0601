export type ComponentType =
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'two-column'
  | 'three-column'
  | 'social-icons'
  | 'footer';

export interface EmailComponent {
  id: string;
  type: ComponentType;
  properties: Record<string, any>;
  children?: EmailComponent[][];
}

export interface EmailTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  components: EmailComponent[];
  createdAt: number;
  updatedAt: number;
  thumbnail: string;
}

export type PreviewMode = 'desktop' | 'mobile' | 'dark';

export interface VariableValues {
  [key: string]: string;
}

export const VARIABLE_LIST = [
  { key: 'name', label: '收件人姓名', example: '张三' },
  { key: 'email', label: '收件人邮箱', example: 'zhangsan@example.com' },
  { key: 'date', label: '当前日期', example: '2026-06-05' },
  { key: 'company', label: '公司名称', example: '星辰科技' },
  { key: 'order_id', label: '订单号', example: 'ORD-20260605-001' },
  { key: 'unsubscribe_url', label: '退订链接', example: 'https://example.com/unsubscribe' },
];

export const DEFAULT_VARIABLES: VariableValues = Object.fromEntries(
  VARIABLE_LIST.map(v => [v.key, v.example])
);

export const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export const ALIGN_OPTIONS = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
];

export const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', icon: '📘', url: '' },
  { key: 'twitter', label: 'Twitter', icon: '🐦', url: '' },
  { key: 'instagram', label: 'Instagram', icon: '📷', url: '' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', url: '' },
  { key: 'youtube', label: 'YouTube', icon: '▶️', url: '' },
  { key: 'wechat', label: '微信', icon: '💬', url: '' },
];
