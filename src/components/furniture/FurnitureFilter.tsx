import { Input, Select } from '@/components/ui';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import type { FurnitureArea, FurnitureType, FurnitureMaterial, FurnitureStatus } from '@/types';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const areaOptions = [
  { value: '', label: '全部区域' },
  { value: 'outdoor-east', label: '东区' },
  { value: 'outdoor-west', label: '西区' },
  { value: 'outdoor-south', label: '南区' },
  { value: 'outdoor-north', label: '北区' },
];

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'chair', label: '椅子' },
  { value: 'table', label: '桌子' },
  { value: 'umbrella', label: '遮阳伞' },
];

const materialOptions = [
  { value: '', label: '全部材质' },
  { value: 'wood', label: '木质' },
  { value: 'metal', label: '金属' },
  { value: 'plastic', label: '塑料' },
  { value: 'rattan', label: '藤编' },
];

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'repairing', label: '维修中' },
  { value: 'lost', label: '已丢失' },
];

interface FurnitureFilterProps {
  className?: string;
  showKeyword?: boolean;
  compact?: boolean;
}

export default function FurnitureFilter({ 
  className, 
  showKeyword = true,
  compact = false 
}: FurnitureFilterProps) {
  const { filters, setFilters, clearFilters } = useFurnitureStore();

  const hasActiveFilters = filters.area || filters.type || filters.material || filters.status || filters.keyword;

  const handleAreaChange = (value: string) => {
    setFilters({ area: value as FurnitureArea | undefined });
  };

  const handleTypeChange = (value: string) => {
    setFilters({ type: value as FurnitureType | undefined });
  };

  const handleMaterialChange = (value: string) => {
    setFilters({ material: value as FurnitureMaterial | undefined });
  };

  const handleStatusChange = (value: string) => {
    setFilters({ status: value as FurnitureStatus | undefined });
  };

  const handleKeywordChange = (value: string) => {
    setFilters({ keyword: value || undefined });
  };

  return (
    <div className={cn(
      'rounded-xl border border-gray-200 bg-white p-4',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          <span>筛选条件</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-danger"
          >
            <X className="h-3 w-3" />
            清除筛选
          </button>
        )}
      </div>

      <div className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}>
        {showKeyword && (
          <Input
            placeholder="搜索编号、名称..."
            icon={<Search className="h-4 w-4" />}
            value={filters.keyword || ''}
            onChange={(e) => handleKeywordChange(e.target.value)}
            wrapperClassName={compact ? 'md:col-span-3' : 'lg:col-span-4'}
          />
        )}

        <Select
          label="区域"
          options={areaOptions}
          value={filters.area || ''}
          onChange={(e) => handleAreaChange(e.target.value)}
        />

        <Select
          label="类型"
          options={typeOptions}
          value={filters.type || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
        />

        <Select
          label="材质"
          options={materialOptions}
          value={filters.material || ''}
          onChange={(e) => handleMaterialChange(e.target.value)}
        />

        <Select
          label="状态"
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
        />
      </div>
    </div>
  );
}
