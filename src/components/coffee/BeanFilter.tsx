import { FC } from 'react';
import { FlavorTag, FLAVOR_TAG_LABELS, StockStatus } from '../../types';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import Tag from '../ui/Tag';
import { FilterX, Package, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { cn } from '../../lib/utils';

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

type StockFilter = 'all' | StockStatus;

const stockOptions: Array<{
  value: StockFilter;
  label: string;
  icon: FC<{ className?: string }>;
  activeColor: string;
  activeBg: string;
}> = [
  {
    value: 'all',
    label: '全部',
    icon: Package,
    activeColor: 'text-[#F5EFE6]',
    activeBg: 'bg-[#4A3728]',
  },
  {
    value: 'normal',
    label: '充足',
    icon: CheckCircle,
    activeColor: 'text-white',
    activeBg: 'bg-[#5A8A3B]',
  },
  {
    value: 'low',
    label: '快喝完',
    icon: AlertTriangle,
    activeColor: 'text-white',
    activeBg: 'bg-[#C28B3B]',
  },
  {
    value: 'empty',
    label: '已喝完',
    icon: Ban,
    activeColor: 'text-white',
    activeBg: 'bg-[#C2563B]',
  },
];

const BeanFilter: FC = () => {
  const {
    activeFlavorFilter,
    activeStockFilter,
    toggleFlavorFilter,
    setStockFilter,
    clearAllFilters,
  } = useCoffeeStore();

  const hasAnyFilter = activeFlavorFilter.length > 0 || activeStockFilter !== 'all';

  return (
    <div className="flex flex-col gap-5 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-[#6B5748]">库存状态</span>
          <span className="text-sm font-medium text-[#6B5748]">风味筛选</span>
        </div>
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-[#9B8B7D] hover:text-[#C2563B] transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-2 pr-4 border-r border-[#E8DFD3]">
          {stockOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeStockFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setStockFilter(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? `${option.activeBg} ${option.activeColor} shadow-sm scale-105`
                    : 'bg-[#F5EFE6] text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728]',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>

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

      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9B8B7D]">
          {activeStockFilter !== 'all' && (
            <span>
              库存：
              <span className="text-[#6B5748] font-medium">
                {stockOptions.find((o) => o.value === activeStockFilter)?.label}
              </span>
            </span>
          )}
          {activeFlavorFilter.length > 0 && (
            <span>
              风味：
              <span className="text-[#6B5748] font-medium">
                {activeFlavorFilter.map((t) => FLAVOR_TAG_LABELS[t]).join('、')}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BeanFilter;
