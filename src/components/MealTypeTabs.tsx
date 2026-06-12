import { cn } from "@/lib/utils";
import type { MealType } from "@/types";
import { MEAL_TYPE_LABELS } from "@/types";

const mealEmojis: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

interface Props {
  value: MealType;
  onChange: (v: MealType) => void;
}

export default function MealTypeTabs({ value, onChange }: Props) {
  const types: MealType[] = ["breakfast", "lunch", "dinner"];
  return (
    <div className="inline-flex rounded-xl bg-brand-100/60 p-1">
      {types.map((t) => {
        const isActive = t === value;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-brand-800 shadow-sm"
                : "text-brand-600 hover:text-brand-800"
            )}
          >
            <span>{mealEmojis[t]}</span>
            <span>{MEAL_TYPE_LABELS[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
