import type { SoupType, FireLevel, BatchStatus, FeedbackType, Severity, SkimStatus } from '@/types';

export const SOUP_TYPE_LABEL: Record<SoupType, string> = {
  'pork-bone': '猪骨浓汤',
  'beef-bone': '牛骨浓汤',
  'chicken': '鸡汤',
  'seafood': '海鲜汤',
  'vegetarian': '素汤',
};

export const SOUP_TYPE_COLOR: Record<SoupType, string> = {
  'pork-bone': 'bg-soup-100 text-soup-700',
  'beef-bone': 'bg-broth-200 text-broth-800',
  'chicken': 'bg-amber-100 text-amber-700',
  'seafood': 'bg-cyan-100 text-cyan-700',
  'vegetarian': 'bg-green-100 text-green-700',
};

export const SOUP_TYPE_CHART_COLOR: Record<SoupType, string> = {
  'pork-bone': '#FFB300',
  'beef-bone': '#795548',
  'chicken': '#F59E0B',
  'seafood': '#06B6D4',
  'vegetarian': '#22C55E',
};

export const FIRE_LEVEL_LABEL: Record<FireLevel, string> = {
  'low': '小火',
  'medium': '中火',
  'high': '大火',
  'simmer': '微沸',
};

export const FIRE_LEVEL_COLOR: Record<FireLevel, string> = {
  'low': 'bg-orange-100 text-orange-600',
  'medium': 'bg-fire-100 text-fire-500',
  'high': 'bg-red-100 text-red-600',
  'simmer': 'bg-soup-100 text-soup-700',
};

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  'preparing': '准备中',
  'cooking': '熬制中',
  'finished': '已出锅',
  'sold': '售卖中',
};

export const BATCH_STATUS_COLOR: Record<BatchStatus, string> = {
  'preparing': 'bg-gray-100 text-gray-600',
  'cooking': 'bg-fire-100 text-fire-500',
  'finished': 'bg-green-100 text-green-600',
  'sold': 'bg-blue-100 text-blue-600',
};

export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  'too-salty': '太咸',
  'too-light': '太淡',
  'oily': '油腻',
  'other': '其他',
};

export const FEEDBACK_TYPE_COLOR: Record<FeedbackType, string> = {
  'too-salty': 'bg-red-100 text-red-600',
  'too-light': 'bg-blue-100 text-blue-600',
  'oily': 'bg-amber-100 text-amber-700',
  'other': 'bg-gray-100 text-gray-600',
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  'mild': '轻微',
  'moderate': '中等',
  'serious': '严重',
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  'mild': 'bg-yellow-100 text-yellow-700',
  'moderate': 'bg-orange-100 text-orange-600',
  'serious': 'bg-red-100 text-red-600',
};

export const SKIM_STATUS_LABEL: Record<SkimStatus, string> = {
  'not-done': '未撇油',
  'partial': '部分撇油',
  'thorough': '充分撇油',
};

export const SKIM_STATUS_COLOR: Record<SkimStatus, string> = {
  'not-done': 'bg-red-100 text-red-600',
  'partial': 'bg-yellow-100 text-yellow-700',
  'thorough': 'bg-green-100 text-green-600',
};

export const SPICE_PACKS = [
  '传统八角香料包',
  '家常十三香包',
  '清汤草本包',
  '麻辣香料包',
  '海鲜提鲜包',
];

export const POT_NUMBERS = ['1号锅', '2号锅', '3号锅', '4号锅', '5号锅', '6号锅'];

export const SALE_WINDOWS = ['一号窗口', '二号窗口', '三号窗口', '外卖窗口'];

export const OPERATORS = ['王师傅', '李师傅', '张师傅', '陈师傅'];

export const COOKING_DURATION_MIN = {
  'pork-bone': 240,
  'beef-bone': 300,
  'chicken': 180,
  'seafood': 120,
  'vegetarian': 90,
};
