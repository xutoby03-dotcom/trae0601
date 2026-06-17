import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Clothing, Season, ClothingCategory } from '@/types';
import { SEASONS, CATEGORIES, SCENARIOS, OWNERS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSeasonLabel = (season: Season): string => {
  return SEASONS.find(s => s.value === season)?.label || season;
};

export const getCategoryLabel = (category: ClothingCategory): string => {
  return CATEGORIES.find(c => c.value === category)?.label || category;
};

export const getScenarioLabel = (value: string): string => {
  return SCENARIOS.find(s => s.value === value)?.label || value;
};

const OWNER_KEYWORDS: Record<string, string[]> = {
  '爸爸': ['爸爸', '老爸', '父亲', '爸'],
  '妈妈': ['妈妈', '老妈', '母亲', '妈'],
  '孩子': ['孩子', '小孩', '宝宝', '儿童', '娃', '儿子', '女儿'],
  '其他': ['其他', '家人'],
};

const SCENARIO_KEYWORDS: Record<string, string[]> = {
  'spring_trip': ['春游', '踏青', '春装'],
  'school': ['上学', '校服', '学校', '上课'],
  'sports': ['运动', '健身', '跑步', '锻炼'],
  'formal': ['正式', '商务', '宴会', '礼服'],
  'beach': ['海边', '沙滩', '度假', '泳', '夏装'],
  'ski': ['滑雪', '冬装', '雪地'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'coat': ['外套', '大衣', '夹克', '风衣', '羽绒服', '棉服', '上衣外套'],
  'top': ['上衣', '衬衫', 'T恤', '毛衣', '针织衫', '卫衣'],
  'pants': ['裤子', '裤', '短裤', '长裤', '牛仔裤'],
  'dress': ['连衣裙', '裙子', '长裙', '洋装'],
  'skirt': ['短裙', '半裙'],
  'underwear': ['内衣', '内裤', '秋衣'],
  'accessory': ['配饰', '帽子', '围巾', '手套'],
  'shoes': ['鞋子', '鞋', '靴子'],
};

const SIZE_PATTERN = /\d+cm|XXS|XS|S|M|L|XL|XXL|XXXL/gi;

export interface SmartSearchResult {
  keywords: string[];
  matchedOwner: string;
  matchedScenario: string;
  matchedCategory: ClothingCategory | '';
  matchedSize: string;
  remainingKeywords: string[];
}

export function parseSmartSearch(input: string): SmartSearchResult {
  if (!input.trim()) {
    return {
      keywords: [],
      matchedOwner: '',
      matchedScenario: '',
      matchedCategory: '',
      matchedSize: '',
      remainingKeywords: [],
    };
  }

  const raw = input.trim();
  let matchedOwner = '';
  let matchedScenario = '';
  let matchedCategory: ClothingCategory | '' = '';
  let matchedSize = '';
  let consumed = raw;

  for (const [owner, kws] of Object.entries(OWNER_KEYWORDS)) {
    for (const kw of kws) {
      if (consumed.includes(kw)) {
        matchedOwner = owner;
        consumed = consumed.replace(kw, ' ').trim();
        break;
      }
    }
    if (matchedOwner) break;
  }

  for (const [scenario, kws] of Object.entries(SCENARIO_KEYWORDS)) {
    for (const kw of kws) {
      if (consumed.includes(kw)) {
        matchedScenario = scenario;
        consumed = consumed.replace(kw, ' ').trim();
        break;
      }
    }
    if (matchedScenario) break;
  }

  for (const [category, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of kws) {
      if (consumed.includes(kw)) {
        matchedCategory = category as ClothingCategory;
        consumed = consumed.replace(kw, ' ').trim();
        break;
      }
    }
    if (matchedCategory) break;
  }

  const sizeMatches = consumed.match(SIZE_PATTERN);
  if (sizeMatches) {
    matchedSize = sizeMatches[0].toUpperCase();
    consumed = consumed.replace(sizeMatches[0], ' ').trim();
  }

  const remainingKeywords = consumed
    .split(/\s+/)
    .filter(k => k.length > 0);

  return {
    keywords: raw.split(/\s+/),
    matchedOwner,
    matchedScenario,
    matchedCategory,
    matchedSize,
    remainingKeywords,
  };
}

export function searchClothes(
  clothes: Clothing[],
  options: {
    owner?: string;
    scenario?: string;
    size?: string;
    keyword?: string;
    season?: Season;
    category?: ClothingCategory;
  }
): Clothing[] {
  const parsed = options.keyword ? parseSmartSearch(options.keyword) : null;

  const effectiveOwner = options.owner || parsed?.matchedOwner || '';
  const effectiveScenario = options.scenario || parsed?.matchedScenario || '';
  const effectiveCategory = options.category || parsed?.matchedCategory || '';
  const effectiveSize = options.size || parsed?.matchedSize || '';
  const remainingKeywords = parsed?.remainingKeywords || [];

  return clothes.filter(item => {
    if (effectiveOwner && item.owner !== effectiveOwner) return false;
    if (effectiveSize && item.size.toUpperCase() !== effectiveSize.toUpperCase()) return false;
    if (options.season && item.season !== options.season && item.season !== 'all') return false;
    if (effectiveCategory && item.category !== effectiveCategory) return false;

    if (effectiveScenario) {
      const scenario = SCENARIOS.find(s => s.value === effectiveScenario);
      if (scenario) {
        if (!scenario.categories.includes(item.category)) return false;
        if (scenario.season !== 'all' && item.season !== scenario.season && item.season !== 'all') return false;
      }
    }

    if (remainingKeywords.length > 0) {
      const nameLower = item.name.toLowerCase();
      const allMatch = remainingKeywords.every(kw =>
        nameLower.includes(kw.toLowerCase()) ||
        item.owner.toLowerCase().includes(kw.toLowerCase()) ||
        getCategoryLabel(item.category).includes(kw) ||
        getSeasonLabel(item.season).includes(kw) ||
        item.size.toLowerCase().includes(kw.toLowerCase())
      );
      if (!allMatch) return false;
    }

    return true;
  });
}

export function getSmartSearchHint(parsed: SmartSearchResult): string[] {
  const hints: string[] = [];
  if (parsed.matchedOwner) hints.push(`归属人: ${parsed.matchedOwner}`);
  if (parsed.matchedScenario) {
    const label = SCENARIOS.find(s => s.value === parsed.matchedScenario)?.label || parsed.matchedScenario;
    hints.push(`场景: ${label}`);
  }
  if (parsed.matchedCategory) hints.push(`类别: ${getCategoryLabel(parsed.matchedCategory)}`);
  if (parsed.matchedSize) hints.push(`尺码: ${parsed.matchedSize}`);
  if (parsed.remainingKeywords.length > 0) hints.push(`关键词: ${parsed.remainingKeywords.join(' ')}`);
  return hints;
}

export function getEmptyHint(
  searchTerm: string,
  selectedOwner: string,
  selectedScenario: string,
  selectedSize: string,
  selectedSeason: string,
  clothes: Clothing[]
): string {
  if (!searchTerm && !selectedOwner && !selectedScenario && !selectedSize && !selectedSeason) {
    return '添加你的第一件衣物吧';
  }

  const parts: string[] = [];

  if (selectedOwner) parts.push(`归属人「${selectedOwner}」`);
  if (selectedScenario) {
    const label = SCENARIOS.find(s => s.value === selectedScenario)?.label || selectedScenario;
    parts.push(`场景「${label}」`);
  }
  if (selectedSize) parts.push(`尺码「${selectedSize}」`);
  if (selectedSeason) {
    const label = SEASONS.find(s => s.value === selectedSeason)?.label || selectedSeason;
    parts.push(`季节「${label}」`);
  }

  if (searchTerm) {
    const parsed = parseSmartSearch(searchTerm);
    const smartHints = getSmartSearchHint(parsed);
    if (smartHints.length > 0 && searchTerm.length > 1) {
      const recognized = smartHints.join('、');
      const ownerClothes = parsed.matchedOwner
        ? clothes.filter(c => c.owner === parsed.matchedOwner && c.status !== 'pending')
        : [];
      const ownerHasOther = ownerClothes.length > 0;

      if (parsed.matchedOwner && parsed.matchedCategory && ownerHasOther) {
        return `已识别 ${recognized}，该归属人暂无此类别衣物，试试其他类别？`;
      }
      if (parsed.matchedOwner && !parsed.matchedCategory && ownerClothes.length > 0) {
        const cats = [...new Set(ownerClothes.map(c => getCategoryLabel(c.category)))];
        return `已识别 ${recognized}，该归属人有: ${cats.join('、')}`;
      }
      return `已识别 ${recognized}，未找到匹配衣物`;
    }
    return `没有找到包含「${searchTerm}」的衣物`;
  }

  if (parts.length > 0) {
    const ownerPart = selectedOwner ? clothes.filter(c => c.owner === selectedOwner && c.status !== 'pending') : [];
    if (selectedOwner && ownerPart.length === 0) {
      return `${selectedOwner}还没有入箱衣物`;
    }
    return `没有同时满足 ${parts.join(' + ')} 的衣物，试试减少筛选条件？`;
  }

  return '试试调整搜索或筛选条件';
}

export const getBoxOccupancyRate = (clothingCount: number, capacity: number): number => {
  if (capacity === 0) return 0;
  return Math.min(Math.round((clothingCount / capacity) * 100), 100);
};

export const getOccupancyColor = (rate: number): string => {
  if (rate < 50) return 'bg-sage-400';
  if (rate < 80) return 'bg-sky-400';
  if (rate < 100) return 'bg-coral-400';
  return 'bg-coral-500';
};

export const getOccupancyTextColor = (rate: number): string => {
  if (rate < 50) return 'text-sage-600';
  if (rate < 80) return 'text-sky-600';
  if (rate < 100) return 'text-coral-600';
  return 'text-coral-700';
};
