import { useState, useEffect } from 'react';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { Button, Loading, Select } from '@/components/ui';
import FurnitureCard from '../furniture/FurnitureCard';
import type { FurnitureArea } from '@/types';
import { CheckSquare, Square, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FurnitureSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const areaOptions = [
  { value: '', label: '全部区域' },
  { value: 'outdoor-east', label: '东区' },
  { value: 'outdoor-west', label: '西区' },
  { value: 'outdoor-south', label: '南区' },
  { value: 'outdoor-north', label: '北区' },
];

export default function FurnitureSelector({
  selectedIds,
  onChange,
  disabled = false,
}: FurnitureSelectorProps) {
  const { furniture, filteredFurniture, loading, fetchFurniture, setFilters, clearFilters } = useFurnitureStore();
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  const availableFurniture = filteredFurniture.filter(f => f.status === 'normal');

  const allSelected = availableFurniture.length > 0 &&
    availableFurniture.every(f => selectedIds.includes(f.id));

  const handleToggleAll = () => {
    if (disabled) return;
    if (allSelected) {
      onChange([]);
    } else {
      onChange(availableFurniture.map(f => f.id));
    }
  };

  const handleToggleItem = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleAreaChange = (value: string) => {
    setAreaFilter(value);
    if (value) {
      setFilters({ area: value as FurnitureArea });
    } else {
      clearFilters();
    }
  };

  const displayFurniture = areaFilter
    ? availableFurniture.filter(f => f.area === areaFilter)
    : availableFurniture;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">选择外摆桌椅</h4>
          <p className="mt-1 text-sm text-gray-500">
            已选择 <span className="font-semibold text-primary-500">{selectedIds.length}</span> / {availableFurniture.length} 件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleAll}
            disabled={disabled || availableFurniture.length === 0}
            icon={allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          >
            {allSelected ? '取消全选' : '全选'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="h-4 w-4" />}
          >
            筛选
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <Select
            label="按区域筛选"
            options={areaOptions}
            value={areaFilter}
            onChange={(e) => handleAreaChange(e.target.value)}
            wrapperClassName="max-w-xs"
          />
        </div>
      )}

      {displayFurniture.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {areaFilter ? '该区域暂无可用桌椅' : '暂无可用桌椅'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayFurniture.map((item) => (
            <FurnitureCard
              key={item.id}
              furniture={item}
              selected={selectedIds.includes(item.id)}
              selectable={!disabled}
              onClick={() => handleToggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
