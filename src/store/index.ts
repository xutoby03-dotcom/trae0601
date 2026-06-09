import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FamilyMember, Recipe, Ingredient, DayPlan, MealRecord } from '@/types'

const AVATARS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶']
const RECIPE_ICONS = ['🥪', '🥣', '🍳', '🥛', '🍎', '🥞', '🥯', '🍞', '🥚', '🫔', '🥗', '🍲']

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getDefaultIngredients(): Ingredient[] {
  return [
    { id: 'ing-1', name: '鸡蛋', category: '蛋类', stock: 10, threshold: 3, unit: '个' },
    { id: 'ing-2', name: '牛奶', category: '乳制品', stock: 2, threshold: 1, unit: '盒' },
    { id: 'ing-3', name: '面包', category: '主食', stock: 1, threshold: 1, unit: '袋' },
    { id: 'ing-4', name: '大米', category: '主食', stock: 5, threshold: 2, unit: '斤' },
    { id: 'ing-5', name: '火腿', category: '肉类', stock: 1, threshold: 1, unit: '包' },
    { id: 'ing-6', name: '生菜', category: '蔬菜', stock: 2, threshold: 1, unit: '棵' },
    { id: 'ing-7', name: '番茄', category: '蔬菜', stock: 4, threshold: 2, unit: '个' },
    { id: 'ing-8', name: '芝士', category: '乳制品', stock: 1, threshold: 1, unit: '片' },
    { id: 'ing-9', name: '燕麦', category: '主食', stock: 1, threshold: 1, unit: '袋' },
    { id: 'ing-10', name: '水果', category: '水果', stock: 5, threshold: 3, unit: '个' },
    { id: 'ing-11', name: '黄油', category: '乳制品', stock: 1, threshold: 1, unit: '块' },
    { id: 'ing-12', name: '豆浆', category: '饮品', stock: 2, threshold: 1, unit: '袋' },
  ]
}

function getDefaultRecipes(): Recipe[] {
  return [
    { id: 'rec-1', name: '三明治', icon: RECIPE_ICONS[0], prepTime: 10, ingredientIds: ['ing-3', 'ing-5', 'ing-6', 'ing-8', 'ing-11'], suitableFor: ['咸口', '快节奏'], costPerServing: 8 },
    { id: 'rec-2', name: '白粥', icon: RECIPE_ICONS[1], prepTime: 30, ingredientIds: ['ing-4'], suitableFor: ['清淡', '养胃'], costPerServing: 2 },
    { id: 'rec-3', name: '煎蛋', icon: RECIPE_ICONS[2], prepTime: 5, ingredientIds: ['ing-1', 'ing-11'], suitableFor: ['咸口', '快节奏'], costPerServing: 3 },
    { id: 'rec-4', name: '牛奶燕麦', icon: RECIPE_ICONS[3], prepTime: 3, ingredientIds: ['ing-2', 'ing-9'], suitableFor: ['甜口', '快节奏'], costPerServing: 5 },
    { id: 'rec-5', name: '水果拼盘', icon: RECIPE_ICONS[4], prepTime: 5, ingredientIds: ['ing-10'], suitableFor: ['清淡', '甜口'], costPerServing: 6 },
    { id: 'rec-6', name: '煎饼', icon: RECIPE_ICONS[5], prepTime: 15, ingredientIds: ['ing-1', 'ing-4', 'ing-11'], suitableFor: ['咸口'], costPerServing: 4 },
    { id: 'rec-7', name: '面包果酱', icon: RECIPE_ICONS[7], prepTime: 2, ingredientIds: ['ing-3'], suitableFor: ['甜口', '快节奏'], costPerServing: 4 },
    { id: 'rec-8', name: '番茄蛋汤', icon: RECIPE_ICONS[11], prepTime: 10, ingredientIds: ['ing-1', 'ing-7'], suitableFor: ['咸口', '清淡'], costPerServing: 4 },
  ]
}

function getDefaultMembers(): FamilyMember[] {
  return [
    { id: 'mem-1', name: '爸爸', avatar: AVATARS[0], preferences: ['咸口', '辣'], allergies: [], scheduleTime: '08:00', budget: 15 },
    { id: 'mem-2', name: '妈妈', avatar: AVATARS[1], preferences: ['清淡', '甜口'], allergies: ['辣'], scheduleTime: '08:30', budget: 12 },
    { id: 'mem-3', name: '小明', avatar: AVATARS[2], preferences: ['甜口', '快节奏'], allergies: ['花生'], scheduleTime: '07:15', budget: 8 },
  ]
}

interface BreakfastStore {
  members: FamilyMember[]
  recipes: Recipe[]
  ingredients: Ingredient[]
  dayPlans: DayPlan[]
  mealRecords: MealRecord[]

  addMember: (member: Omit<FamilyMember, 'id'>) => void
  updateMember: (id: string, member: Partial<FamilyMember>) => void
  deleteMember: (id: string) => void

  addRecipe: (recipe: Omit<Recipe, 'id'>) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void

  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void
  deleteIngredient: (id: string) => void

  setDayPlan: (plan: DayPlan) => void
  removeDayPlan: (date: string) => void

  addMealRecord: (record: Omit<MealRecord, 'id'>) => void
  updateMealRecord: (id: string, record: Partial<MealRecord>) => void
  deleteMealRecord: (id: string) => void

  getMissingIngredients: (recipeId: string) => Ingredient[]
  isRecipeAvailable: (recipeId: string) => boolean
  getShoppingList: () => Ingredient[]
  getWeekStats: (weekStart: string) => { totalSpent: number; totalBudget: number; completionRate: number }
}

export const useStore = create<BreakfastStore>()(
  persist(
    (set, get) => ({
      members: getDefaultMembers(),
      recipes: getDefaultRecipes(),
      ingredients: getDefaultIngredients(),
      dayPlans: [],
      mealRecords: [],

      addMember: (member) => set((s) => ({
        members: [...s.members, { ...member, id: generateId() }]
      })),
      updateMember: (id, member) => set((s) => ({
        members: s.members.map((m) => m.id === id ? { ...m, ...member } : m)
      })),
      deleteMember: (id) => set((s) => ({
        members: s.members.filter((m) => m.id !== id)
      })),

      addRecipe: (recipe) => set((s) => ({
        recipes: [...s.recipes, { ...recipe, id: generateId() }]
      })),
      updateRecipe: (id, recipe) => set((s) => ({
        recipes: s.recipes.map((r) => r.id === id ? { ...r, ...recipe } : r)
      })),
      deleteRecipe: (id) => set((s) => ({
        recipes: s.recipes.filter((r) => r.id !== id)
      })),

      addIngredient: (ingredient) => set((s) => ({
        ingredients: [...s.ingredients, { ...ingredient, id: generateId() }]
      })),
      updateIngredient: (id, ingredient) => set((s) => ({
        ingredients: s.ingredients.map((i) => i.id === id ? { ...i, ...ingredient } : i)
      })),
      deleteIngredient: (id) => set((s) => ({
        ingredients: s.ingredients.filter((i) => i.id !== id)
      })),

      setDayPlan: (plan) => set((s) => {
        const existing = s.dayPlans.findIndex((p) => p.date === plan.date)
        if (existing >= 0) {
          const updated = [...s.dayPlans]
          updated[existing] = plan
          return { dayPlans: updated }
        }
        return { dayPlans: [...s.dayPlans, plan] }
      }),
      removeDayPlan: (date) => set((s) => ({
        dayPlans: s.dayPlans.filter((p) => p.date !== date)
      })),

      addMealRecord: (record) => set((s) => ({
        mealRecords: [...s.mealRecords, { ...record, id: generateId() }]
      })),
      updateMealRecord: (id, record) => set((s) => ({
        mealRecords: s.mealRecords.map((r) => r.id === id ? { ...r, ...record } : r)
      })),
      deleteMealRecord: (id) => set((s) => ({
        mealRecords: s.mealRecords.filter((r) => r.id !== id)
      })),

      getMissingIngredients: (recipeId) => {
        const state = get()
        const recipe = state.recipes.find((r) => r.id === recipeId)
        if (!recipe) return []
        return recipe.ingredientIds
          .map((id) => state.ingredients.find((i) => i.id === id))
          .filter((i): i is Ingredient => !!i && i.stock < i.threshold)
      },

      isRecipeAvailable: (recipeId) => {
        return get().getMissingIngredients(recipeId).length === 0
      },

      getShoppingList: () => {
        return get().ingredients.filter((i) => i.stock < i.threshold)
      },

      getWeekStats: (weekStart) => {
        const state = get()
        const startDate = new Date(weekStart)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)

        const weekPlans = state.dayPlans.filter((p) => {
          const d = new Date(p.date)
          return d >= startDate && d <= endDate
        })

        let totalSpent = 0
        weekPlans.forEach((plan) => {
          plan.recipeIds.forEach((rid) => {
            const recipe = state.recipes.find((r) => r.id === rid)
            if (recipe) totalSpent += recipe.costPerServing
          })
        })

        const totalBudget = state.members.reduce((sum, m) => sum + m.budget, 0) * 7

        const weekRecords = state.mealRecords.filter((r) => {
          const d = new Date(r.date)
          return d >= startDate && d <= endDate
        })
        const eatenCount = weekRecords.filter((r) => r.status === 'eaten').length
        const completionRate = weekRecords.length > 0 ? eatenCount / weekRecords.length : 0

        return { totalSpent, totalBudget, completionRate }
      },
    }),
    {
      name: 'breakfast-planner-storage',
    }
  )
)
