import type { FoodItem, Recipe } from "@/types";
import { RECIPES } from "@/data/recipes";
import { FOOD_ICONS } from "@/data/foodIcons";

export interface RecipeMatch {
  recipe: Recipe;
  matchPercent: number;
  availableIngredients: string[];
  missingIngredients: string[];
}

export function matchRecipes(foodItems: FoodItem[]): RecipeMatch[] {
  const availableNames = new Set(
    foodItems
      .filter((f) => !f.consumed && f.quantity > 0)
      .map((f) => f.name)
  );

  const matches: RecipeMatch[] = [];

  for (const recipe of RECIPES) {
    const available: string[] = [];
    const missing: string[] = [];

    for (const ing of recipe.ingredients) {
      if (availableNames.has(ing.name)) {
        available.push(ing.name);
      } else {
        missing.push(ing.name);
      }
    }

    const matchPercent = recipe.ingredients.length > 0
      ? Math.round((available.length / recipe.ingredients.length) * 100)
      : 0;

    if (matchPercent > 0) {
      matches.push({
        recipe,
        matchPercent,
        availableIngredients: available,
        missingIngredients: missing,
      });
    }
  }

  return matches.sort((a, b) => b.matchPercent - a.matchPercent);
}

export function getIconForName(name: string): string {
  return FOOD_ICONS[name] || "📦";
}
