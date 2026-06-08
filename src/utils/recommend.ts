import type { Ingredient, RecipeMatch, Recipe, Favorite } from '@/types'
import { recipes } from '@/data/recipes'

const STANDARD_QUANTITIES: Record<string, number> = {
  '个': 1, '颗': 3, '根': 3, '碗': 2, '片': 5, '勺': 5,
  '小勺': 3, '瓣': 5, '块': 2, '把': 2, '条': 1, '袋': 1,
  '包': 1, '棵': 1, '份': 2, '小块': 3, 'g': 300, 'ml': 500,
}

function getExpiryScore(expiryDate: string): number {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 1) return 40
  if (diffDays <= 2) return 35
  if (diffDays <= 3) return 25
  if (diffDays <= 5) return 15
  if (diffDays <= 7) return 10
  return 5
}

function getScarcityScore(quantity: number, unit: string): number {
  const standard = STANDARD_QUANTITIES[unit] || 1
  const ratio = quantity / standard
  if (ratio < 0.3) return 30
  if (ratio < 0.5) return 20
  if (ratio < 0.8) return 10
  return 0
}

function getSizeScore(sizeTag: string): number {
  if (sizeTag === 'large') return 30
  if (sizeTag === 'medium') return 15
  return 5
}

export function calculatePriority(ingredient: Ingredient): number {
  return getExpiryScore(ingredient.expiryDate)
    + getScarcityScore(ingredient.quantity, ingredient.unit)
    + getSizeScore(ingredient.sizeTag)
}

export function getPriorityLabel(ingredient: Ingredient): { label: string; color: string }[] {
  const labels: { label: string; color: string }[] = []
  const now = new Date()
  const expiry = new Date(ingredient.expiryDate)
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 3) labels.push({ label: '快过期', color: 'bg-red-500' })
  const standard = STANDARD_QUANTITIES[ingredient.unit] || 1
  if (ingredient.quantity / standard < 0.5) labels.push({ label: '量少', color: 'bg-yellow-500' })
  if (ingredient.sizeTag === 'large') labels.push({ label: '占地方', color: 'bg-blue-500' })
  return labels
}

export function getExpiryCountdown(expiryDate: string): string {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return '已过期'
  if (diffDays === 1) return '明天过期'
  if (diffDays <= 3) return `${diffDays}天后过期`
  if (diffDays <= 7) return `${diffDays}天后`
  return `${diffDays}天后`
}

export function isExpiredSoon(expiryDate: string): boolean {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase()
}

function matchIngredient(
  ingredientName: string,
  userIngredients: Ingredient[]
): Ingredient | undefined {
  const normalized = normalizeIngredientName(ingredientName)
  return userIngredients.find(
    (i) => !i.excluded && normalizeIngredientName(i.name) === normalized
  )
}

export function matchRecipes(
  userIngredients: Ingredient[],
  preference?: string,
  favorites: Favorite[] = []
): RecipeMatch[] {
  const activeIngredients = userIngredients.filter((i) => !i.excluded)
  if (activeIngredients.length === 0) return []

  const favoriteRecipeIds = new Set(favorites.map((f) => f.recipeId))
  const favoriteIngredientSnapshots: Record<string, string[]> = {}
  favorites.forEach((f) => {
    favoriteIngredientSnapshots[f.recipeId] = f.ingredientSnapshot
  })

  return recipes
    .map((recipe) => computeMatch(recipe, activeIngredients, preference, favoriteRecipeIds, favoriteIngredientSnapshots))
    .filter((match) => match.matchScore > 10)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      const aShort = a.shortIngredients.filter((s) => a.recipe.ingredients.some((ri) => ri.ingredientName === s.ingredientName && ri.required)).length
      const bShort = b.shortIngredients.filter((s) => b.recipe.ingredients.some((ri) => ri.ingredientName === s.ingredientName && ri.required)).length
      const aMissing = a.missingIngredients.filter((i) => i.required).length + aShort
      const bMissing = b.missingIngredients.filter((i) => i.required).length + bShort
      if (aMissing !== bMissing) return aMissing - bMissing
      return a.recipe.cookTime - b.recipe.cookTime
    })
}

function computeMatch(
  recipe: Recipe,
  userIngredients: Ingredient[],
  preference?: string,
  favoriteRecipeIds?: Set<string>,
  favoriteIngredientSnapshots?: Record<string, string[]>)
: RecipeMatch {
  const matchedIngredients: string[] = []
  const missingIngredients: RecipeMatch['missingIngredients'] = []
  const substitutableIngredients: RecipeMatch['missingIngredients'] = []
  const shortIngredients: RecipeMatch['shortIngredients'] = []
  const ingredientRemainders: RecipeMatch['ingredientRemainders'] = []
  let quantityScore = 0

  recipe.ingredients.forEach((ri) => {
    const userIng = matchIngredient(ri.ingredientName, userIngredients)
    if (userIng) {
      const remaining = Number((userIng.quantity - ri.amount).toFixed(2))
      const hasEnough = userIng.quantity >= ri.amount
      ingredientRemainders.push({
        name: ri.ingredientName,
        used: ri.amount,
        remaining,
        unit: ri.unit,
        hasEnough,
        shortage: hasEnough ? 0 : Number((ri.amount - userIng.quantity).toFixed(2)),
      })
      if (hasEnough) {
        matchedIngredients.push(ri.ingredientName)
        quantityScore += 1
      } else {
        shortIngredients.push({
          ingredientName: ri.ingredientName,
          have: userIng.quantity,
          need: ri.amount,
          unit: ri.unit,
          shortage: Number((ri.amount - userIng.quantity).toFixed(2)),
        })
        quantityScore += userIng.quantity / ri.amount
      }
    } else if (ri.substitute) {
      const subIng = matchIngredient(ri.substitute, userIngredients)
      if (subIng) {
        const subAmount = ri.substituteAmount || ri.amount
        const remaining = Number((subIng.quantity - subAmount).toFixed(2))
        const hasEnough = subIng.quantity >= subAmount
        ingredientRemainders.push({
          name: `${ri.substitute}(替${ri.ingredientName})`,
          used: subAmount,
          remaining,
          unit: ri.substituteUnit || ri.unit,
          hasEnough,
          shortage: hasEnough ? 0 : Number((subAmount - subIng.quantity).toFixed(2)),
        })
        if (hasEnough) {
          matchedIngredients.push(ri.ingredientName)
          quantityScore += 1
        } else {
          shortIngredients.push({
            ingredientName: ri.substitute + '(替' + ri.ingredientName + ')',
            have: subIng.quantity,
            need: subAmount,
            unit: ri.substituteUnit || ri.unit,
            shortage: Number((subAmount - subIng.quantity).toFixed(2)),
          })
          quantityScore += subIng.quantity / subAmount
        }
        substitutableIngredients.push(ri)
      } else {
        missingIngredients.push(ri)
      }
    } else {
      missingIngredients.push(ri)
    }
  })

  const baseScore = (quantityScore / recipe.ingredients.length) * 60
  const preferenceBonus = preference && recipe.preference.includes(preference as never) ? 20 : 0

  let favoriteBonus = 0
  if (favoriteRecipeIds && favoriteRecipeIds.has(recipe.id)) {
    const snapshot = favoriteIngredientSnapshots?.[recipe.id] || []
    const currentNames = userIngredients.map((i) => normalizeIngredientName(i.name))
    const overlap = snapshot.filter((name) => currentNames.includes(normalizeIngredientName(name)))
    if (overlap.length / Math.max(snapshot.length, 1) > 0.7) {
      favoriteBonus = 20
    }
  }

  return {
    recipe,
    matchScore: Math.round(baseScore + preferenceBonus + favoriteBonus),
    matchedIngredients,
    missingIngredients,
    substitutableIngredients,
    shortIngredients,
    ingredientRemainders,
  }
}
