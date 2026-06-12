import { FC } from 'react';
import { FlavorTag, FLAVOR_TAG_LABELS } from '../../types';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import Tag from '../ui/Tag';
import { FilterX } from 'lucide-react';

const allFlavorTags: FlavorTag[] = [
  'sour',
  'sweet',
  'bitter',
  'nutty',
  'floral',
  'fruity',
  'chocolate',
  'caramel',
];

const FlavorFilter: FC = () => {
  const { activeFlavorFilter, toggleFlavorFilter, clearFlavorFilter } = useCoffeeStore();

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#6B5748]">风味筛选</span>
        {activeFlavorFilter.length > 0 && (
          <button
            onClick={clearFlavorFilter}
            className="flex items-center gap-1 text-xs text-[#9B8B7D] hover:text-[#C2563B] transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allFlavorTags.map((tag) => (
          <Tag
            key={tag}
            tag={tag}
            selected={activeFlavorFilter.includes(tag)}
            onClick={() => toggleFlavorFilter(tag)}
            size="md"
          />
        ))}
      </div>
      {activeFlavorFilter.length > 0 && (
        <p className="text-xs text-[#9B8B7D]">
          已选 {activeFlavorFilter.length} 个风味标签
          {activeFlavorFilter.map((t) => FLAVOR_TAG_LABELS[t]).join('、')}
        </p>
      )}
    </div>
  );
};

export default FlavorFilter;
