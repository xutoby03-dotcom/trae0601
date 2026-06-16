import { Search, Filter } from 'lucide-react';
import type { SizeCode, ProductionStatus } from '@/types';
import { getProductionStatusLabel } from '@/utils/format';

interface SampleFilterBarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedSize: SizeCode | 'all';
  onSizeChange: (value: SizeCode | 'all') => void;
  statusFilter: ProductionStatus | 'all';
  onStatusChange: (value: ProductionStatus | 'all') => void;
}

const SIZE_OPTIONS: (SizeCode | 'all')[] = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const STATUS_OPTIONS: (ProductionStatus | 'all')[] = ['all', 'pending', 'approved', 'rejected'];

export default function SampleFilterBar({
  searchText,
  onSearchChange,
  selectedSize,
  onSizeChange,
  statusFilter,
  onStatusChange,
}: SampleFilterBarProps) {
  return (
    <div className="rounded-xl bg-cream-50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="按款号搜索..."
            className="input-field pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-charcoal-500" />
          <select
            value={selectedSize}
            onChange={(e) => onSizeChange(e.target.value as SizeCode | 'all')}
            className="input-field w-auto min-w-[100px]"
          >
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size === 'all' ? '全部尺码' : size}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as ProductionStatus | 'all')}
            className="input-field w-auto min-w-[110px]"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? '全部状态' : getProductionStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
