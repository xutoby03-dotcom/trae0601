export type SizeTag = 'small' | 'medium' | 'large'
export type Preference = 'light' | 'heavy' | 'quick' | 'budget' | 'protein'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  expiryDate: string
  sizeTag: SizeTag
  excluded: boolean
}

export interface RecipeIngredient {
  ingredientName: string
  amount: number
  unit: string
  required: boolean
  substitute?: string
  substituteAmount?: number
  substituteUnit?: string
}

export interface RecipeStep {
  description: string
  time: number
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  preference: Preference[]
  cookTime: number
  difficulty: Difficulty
  steps: RecipeStep[]
  ingredients: RecipeIngredient[]
}

export interface Favorite {
  id: string
  recipeId: string
  savedAt: string
  ingredientSnapshot: string[]
}

export interface ShortIngredient {
  ingredientName: string
  have: number
  need: number
  unit: string
  shortage: number
}

export interface RecipeMatch {
  recipe: Recipe
  matchScore: number
  matchedIngredients: string[]
  missingIngredients: RecipeIngredient[]
  substitutableIngredients: RecipeIngredient[]
  shortIngredients: ShortIngredient[]
  ingredientRemainders: { name: string; used: number; remaining: number; unit: string; hasEnough: boolean; shortage: number }[]
}
