import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Clothing, Season, ClothingCategory } from '@/types';
import { SEASONS, CATEGORIES, SCENARIOS } from '@/types';

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

export const searchClothes = (
  clothes: Clothing[],
  options: {
    owner?: string;
    scenario?: string;
    size?: string;
    keyword?: string;
    season?: Season;
    category?: ClothingCategory;
  }
): Clothing[] => {
  return clothes.filter(item => {
    if (options.owner && item.owner !== options.owner) return false;
    if (options.size && item.size !== options.size) return false;
    if (options.season && item.season !== options.season && item.season !== 'all') return false;
    if (options.category && item.category !== options.category) return false;
    
    if (options.scenario) {
      const scenario = SCENARIOS.find(s => s.value === options.scenario);
      if (scenario) {
        if (!scenario.categories.includes(item.category)) return false;
        if (scenario.season !== 'all' && item.season !== scenario.season && item.season !== 'all') return false;
      }
    }
    
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      if (
        !item.name.toLowerCase().includes(keyword) &&
        !item.owner.toLowerCase().includes(keyword) &&
        !getCategoryLabel(item.category).includes(keyword)
      ) return false;
    }
    
    return true;
  });
};

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
