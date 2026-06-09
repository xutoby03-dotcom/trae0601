export interface FamilyMember {
  id: string
  name: string
  avatar: string
  preferences: string[]
  allergies: string[]
  scheduleTime: string
  budget: number
}

export interface Recipe {
  id: string
  name: string
  icon: string
  prepTime: number
  ingredientIds: string[]
  suitableFor: string[]
  costPerServing: number
}

export interface Ingredient {
  id: string
  name: string
  category: string
  stock: number
  threshold: number
  unit: string
}

export interface DayPlan {
  date: string
  recipeIds: string[]
  shopperId: string
  cookId: string
  cleanerId: string
}

export interface MealRecord {
  id: string
  date: string
  memberId: string
  status: 'eaten' | 'skipped' | 'late'
  leftoverLevel: 'none' | 'little' | 'much'
  notes: string
}
