import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Ingredient, SizeTag } from '@/types'
import { calculatePriority } from '@/utils/recommend'

interface IngredientState {
  ingredients: Ingredient[]
  addIngredient: (ing: Omit<Ingredient, 'id' | 'excluded'>) => void
  removeIngredient: (id: string) => void
  toggleExcluded: (id: string) => void
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  clearAll: () => void
}

export const useIngredientStore = create<IngredientState>()(
  persist(
    (set) => ({
      ingredients: [],
      addIngredient: (ing) =>
        set((state) => {
          const newIng: Ingredient = {
            ...ing,
            id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
            excluded: false,
          }
          const updated = [...state.ingredients, newIng].sort(
            (a, b) => calculatePriority(b) - calculatePriority(a)
          )
          return { ingredients: updated }
        }),
      removeIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
        })),
      toggleExcluded: (id) =>
        set((state) => ({
          ingredients: state.ingredients.map((i) =>
            i.id === id ? { ...i, excluded: !i.excluded } : i
          ),
        })),
      updateIngredient: (id, updates) =>
        set((state) => {
          const updated = state.ingredients.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          )
          return {
            ingredients: updated.sort(
              (a, b) => calculatePriority(b) - calculatePriority(a)
            ),
          }
        }),
      clearAll: () => set({ ingredients: [] }),
    }),
    { name: 'leftover-hero-ingredients' }
  )
)

export const UNITS = ['个', '颗', '根', '碗', '片', '勺', '小勺', '瓣', '块', '把', '条', '袋', '包', '棵', '份', '小块', 'g', 'ml'] as const

export const SIZE_TAGS: { value: SizeTag; label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]
