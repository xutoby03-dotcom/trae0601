import { FLAVOR_TAGS } from '@/types';
import { cn } from '@/lib/utils';

interface FlavorTagsProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function FlavorTags({ selectedTags, onToggle }: FlavorTagsProps) {
  const tagCategories = [
    { name: '果香类', tags: ['花香', '柑橘', '莓果', '核果', '热带水果'] },
    { name: '甜香类', tags: ['焦糖', '蜂蜜', '黑糖', '巧克力', '坚果', '奶油', '香草'] },
    { name: '其他风味', tags: ['烘焙', '香料', '草本', '木质', '烟熏', '茶感', '发酵', '酒香'] },
  ];

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold text-coffee-800 block">
        风味标签
        <span className="text-coffee-400 font-normal ml-2">
          （已选 {selectedTags.length} 个）
        </span>
      </label>

      {tagCategories.map((category) => (
        <div key={category.name} className="space-y-2">
          <p className="text-xs font-medium text-coffee-500">{category.name}</p>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggle(tag)}
                  className={cn(
                    'flavor-tag',
                    isSelected ? 'flavor-tag-selected' : 'flavor-tag-unselected'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
