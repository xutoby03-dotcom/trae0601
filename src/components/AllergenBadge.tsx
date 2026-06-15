import { AlertTriangle } from 'lucide-react';
import { AllergenType, ALLERGEN_LABELS } from '../types';

interface AllergenBadgeProps {
  allergens: AllergenType[];
  size?: 'sm' | 'md';
}

export function AllergenBadge({ allergens, size = 'sm' }: AllergenBadgeProps) {
  const hasImportantAllergens = allergens.some((a) => a === 'nuts' || a === 'dairy');

  if (allergens.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {allergens.map((allergen) => {
        const isImportant = allergen === 'nuts' || allergen === 'dairy';
        return (
          <span
            key={allergen}
            className={`
              inline-flex items-center gap-1 font-medium
              ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
              rounded-full
              ${isImportant
                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse-soft'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
              }
            `}
          >
            {isImportant && <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            {ALLERGEN_LABELS[allergen]}
          </span>
        );
      })}
      {hasImportantAllergens && (
        <span className="sr-only">
          含有坚果或乳制品，过敏者请注意
        </span>
      )}
    </div>
  );
}
