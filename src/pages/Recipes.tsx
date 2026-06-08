import { useState, useMemo } from "react";
import { useFridgeStore } from "@/store/useFridgeStore";
import { matchRecipes } from "@/utils/recipeMatcher";
import type { RecipeMatch } from "@/utils/recipeMatcher";

import { ChefHat, ChevronDown, ChevronUp } from "lucide-react";

function getMatchColor(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-orange-500";
}

function getMatchTextColor(pct: number) {
  if (pct >= 80) return "text-green-500";
  if (pct >= 50) return "text-yellow-500";
  return "text-orange-500";
}

function getDifficultyStyle(d: "easy" | "medium" | "hard") {
  switch (d) {
    case "easy":
      return { bg: "bg-green-100", text: "text-green-700", label: "简单" };
    case "medium":
      return { bg: "bg-yellow-100", text: "text-yellow-700", label: "中等" };
    case "hard":
      return { bg: "bg-red-100", text: "text-red-700", label: "困难" };
  }
}

export default function Recipes() {
  const foodItems = useFridgeStore((s) => s.foodItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recipes = useMemo(() => {
    const active = foodItems.filter((f) => !f.consumed && f.quantity > 0);
    return matchRecipes(active);
  }, [foodItems]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">🍳 做饭建议</h1>
        </div>
        <p className="mt-1 text-sm text-gray-400">根据现有食材推荐</p>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ChefHat className="mb-4 h-16 w-16 stroke-1" />
          <p className="text-lg font-medium">暂无匹配的菜谱</p>
          <p className="mt-1 text-sm">添加更多食材试试吧~</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {recipes.map((match) => (
            <RecipeCard
              key={match.recipe.id}
              match={match}
              expanded={expandedId === match.recipe.id}
              onToggle={() => toggleExpand(match.recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  match,
  expanded,
  onToggle,
}: {
  match: RecipeMatch;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { recipe, matchPercent, availableIngredients } = match;
  const difficulty = getDifficultyStyle(recipe.difficulty);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{recipe.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-800">
              {recipe.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getMatchColor(matchPercent)}`}
            >
              {matchPercent}%
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${difficulty.bg} ${difficulty.text}`}
            >
              {difficulty.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-gray-500">所需食材</p>
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.map((ing) => {
            const available = availableIngredients.includes(ing.name);
            return (
              <span
                key={ing.name}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  available
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-400"
                }`}
              >
                {ing.name}
              </span>
            );
          })}
        </div>
      </div>

      <button
        onClick={onToggle}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-gray-50 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        {expanded ? (
          <>
            收起步骤 <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            查看步骤 <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">
          {recipe.instructions.map((step, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-600">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${getMatchTextColor(matchPercent)} bg-opacity-10 text-[10px] font-bold`}
                style={{
                  backgroundColor:
                    matchPercent >= 80
                      ? "rgba(34,197,94,0.1)"
                      : matchPercent >= 50
                        ? "rgba(234,179,8,0.1)"
                        : "rgba(249,115,22,0.1)",
                  color:
                    matchPercent >= 80
                      ? "#22c55e"
                      : matchPercent >= 50
                        ? "#eab308"
                        : "#f97316",
                }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
