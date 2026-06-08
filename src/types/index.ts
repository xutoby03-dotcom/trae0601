export type DishCategory = 'staple' | 'hot' | 'cold' | 'dessert' | 'drink'

export type GatheringStatus = 'preparing' | 'ongoing' | 'completed'

export type LeftoverAmount = 'none' | 'little' | 'some' | 'lot'

export interface Gathering {
  id: string
  name: string
  date: string
  location: string
  budget: number
  headCount: number
  chefId: string
  status: GatheringStatus
  createdAt: string
}

export interface Participant {
  id: string
  gatheringId: string
  name: string
  spiceLevel: 0 | 1 | 2 | 3
  isVegetarian: boolean
  allergies: string
  avatar: string
}

export interface Dish {
  id: string
  gatheringId: string
  participantId: string
  name: string
  category: DishCategory
  isBringing: boolean
  rating?: number
}

export interface PrepTask {
  id: string
  gatheringId: string
  title: string
  timeBefore: string
  completed: boolean
  assignee?: string
}

export interface Payment {
  id: string
  gatheringId: string
  participantId: string
  amount: number
  description: string
}

export interface Leftover {
  id: string
  gatheringId: string
  dishName: string
  amount: LeftoverAmount
}

export const CATEGORY_LABELS: Record<DishCategory, string> = {
  staple: '主食',
  hot: '热菜',
  cold: '凉菜',
  dessert: '甜品',
  drink: '饮料',
}

export const CATEGORY_ICONS: Record<DishCategory, string> = {
  staple: '🍚',
  hot: '🔥',
  cold: '🥗',
  dessert: '🍰',
  drink: '🥤',
}

export const SPICE_LABELS: Record<number, string> = {
  0: '不吃辣',
  1: '微辣',
  2: '中辣',
  3: '重辣',
}

export const LEFTOVER_LABELS: Record<LeftoverAmount, string> = {
  none: '没有剩',
  little: '剩一点',
  some: '剩不少',
  lot: '剩很多',
}

export const AVATAR_COLORS = [
  '#E85D3A', '#5B9A6F', '#F5C542', '#6B8DD6', '#D4618C',
  '#8B6FC0', '#4AAFB9', '#D4845A', '#7CB342', '#FF7043',
]
