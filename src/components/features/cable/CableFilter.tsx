import { Search, Filter, X } from 'lucide-react';
import type { InterfaceType, CableStatus } from '@/types';
import { INTERFACE_TYPE_LABELS, CABLE_STATUS_LABELS } from '@/types';

interface CableFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  interfaceFilter: InterfaceType | 'all';
  onInterfaceChange: (value: InterfaceType | 'all') => void;
  statusFilter: CableStatus | 'all';
  onStatusChange: (value: CableStatus | 'all') => void;
}

export const CableFilter = ({
  search,
  onSearchChange,
  interfaceFilter,
  onInterfaceChange,
  statusFilter,
  onStatusChange,
}: CableFilterProps) => {
  const hasFilters = search || interfaceFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onInterfaceChange('all');
    onStatusChange('all');
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索线材编号、位置..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={interfaceFilter}
              onChange={(e) => onInterfaceChange(e.target.value as InterfaceType | 'all')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">全部接口</option>
              {(Object.keys(INTERFACE_TYPE_LABELS) as InterfaceType[]).map(type => (
                <option key={type} value={type}>{INTERFACE_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as CableStatus | 'all')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">全部状态</option>
              {(Object.keys(CABLE_STATUS_LABELS) as CableStatus[]).map(status => (
                <option key={status} value={status}>{CABLE_STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              清除筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
