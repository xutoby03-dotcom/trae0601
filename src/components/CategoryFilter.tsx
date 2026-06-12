import { cn } from '@/lib/utils';
import { CATEGORY_LIST, CATEGORY_EMOJI } from '@/types';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
  const categories = ['全部', ...CATEGORY_LIST];

  return (
    <div className="overflow-x-auto scrollbar-hide py-2">
      <div className="flex gap-2 px-4 min-w-max">
        {categories.map((cat) => {
          const isAll = cat === '全部';
          const isSelected = selectedCategory === cat;
          const emoji = isAll ? '🔥' : CATEGORY_EMOJI[cat as keyof typeof CATEGORY_EMOJI];

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                'flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                isSelected
                  ? 'bg-[#E8652E] text-white shadow-md'
                  : 'bg-[#2D2A26]/10 text-[#2D2A26] hover:bg-[#2D2A26]/20'
              )}
            >
              <span>{emoji}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
