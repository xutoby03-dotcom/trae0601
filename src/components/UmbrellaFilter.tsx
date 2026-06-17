import React from 'react';
import { Search, MapPin, Calendar, Palette, X, Filter } from 'lucide-react';
import { COLOR_OPTIONS, BUILDING_OPTIONS } from '@/utils/constants';
import type { UmbrellaFilters } from '@/types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface UmbrellaFilterProps {
  filters: UmbrellaFilters;
  onChange: (filters: UmbrellaFilters) => void;
  onReset: () => void;
}

export const UmbrellaFilter: React.FC<UmbrellaFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#4A90D9]" />
          筛选条件
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" />
            重置
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Input
          placeholder="搜索伞面特征、品牌..."
          icon={<Search className="w-5 h-5" />}
          value={filters.feature || ''}
          onChange={(e) => onChange({ ...filters, feature: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Palette className="w-4 h-4" />
            颜色
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ ...filters, color: undefined })}
              className={twMerge(
                clsx(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  !filters.color
                    ? 'bg-[#4A90D9] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )
              )}
            >
              全部
            </button>
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.name}
                onClick={() => onChange({ ...filters, color: color.name })}
                className={twMerge(
                  clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    filters.color === color.name
                      ? 'bg-[#4A90D9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )
                )}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="拾获楼栋"
            value={filters.building || ''}
            onChange={(e) => onChange({ ...filters, building: e.target.value || undefined })}
            options={BUILDING_OPTIONS.map(b => ({ value: b.name, label: b.name }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              开始日期
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              结束日期
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9] transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
