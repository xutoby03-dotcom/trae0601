import type { EquipmentType, EquipmentStatus } from '../types';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '../types';

interface FilterBarProps {
  selectedType: EquipmentType | 'all';
  selectedStatus: EquipmentStatus | 'all';
  onTypeChange: (type: EquipmentType | 'all') => void;
  onStatusChange: (status: EquipmentStatus | 'all') => void;
}

const allTypes: (EquipmentType | 'all')[] = ['all', 'snowboard', 'ski', 'helmet', 'goggles', 'gloves', 'boots', 'jacket', 'pants'];
const allStatuses: (EquipmentStatus | 'all')[] = ['all', 'available', 'rented', 'returned'];

const typeLabels: Record<EquipmentType | 'all', string> = {
  all: '全部类型',
  ...EQUIPMENT_TYPE_LABELS,
};

const statusLabels: Record<EquipmentStatus | 'all', string> = {
  all: '全部状态',
  ...EQUIPMENT_STATUS_LABELS,
};

export default function FilterBar({ selectedType, selectedStatus, onTypeChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-slate-600 mb-2">装备类型</label>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedType === type
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {typeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-slate-600 mb-2">装备状态</label>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedStatus === status
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
