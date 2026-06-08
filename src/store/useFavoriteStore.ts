import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Favorite } from '@/types'

interface FavoriteState {
  favorites: Favorite[]
  addFavorite: (recipeId: string, ingredientSnapshot: string[]) => void
  removeFavorite: (recipeId: string) => void
  isFavorite: (recipeId: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (recipeId, ingredientSnapshot) =>
        set((state) => {
          if (state.favorites.some((f) => f.recipeId === recipeId)) return state
          return {
            favorites: [
              ...state.favorites,
              {
                id: Date.now().toString(),
                recipeId,
                savedAt: new Date().toISOString(),
                ingredientSnapshot,
              },
            ],
          }
        }),
      removeFavorite: (recipeId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.recipeId !== recipeId),
        })),
      isFavorite: (recipeId) => get().favorites.some((f) => f.recipeId === recipeId),
    }),
    { name: 'leftover-hero-favorites' }
  )
)
