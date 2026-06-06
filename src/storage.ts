import { Story } from './types';

const STORAGE_KEY = 'story_generator_stories';
const CATEGORIES_KEY = 'story_generator_categories';

export function saveStories(stories: Story[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export function loadStories(): Story[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCategories(categories: string[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function loadCategories(): string[] {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return ['默认', '收藏'];
    }
  }
  return ['默认', '收藏'];
}
