import { Package, AlertTriangle, Clock } from 'lucide-react';
import type { ProcurementItem } from '../types';

interface ProcurementItemCardProps {
  item: ProcurementItem;
}

const urgencyConfig = {
  high: {
    label: '紧急',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle size={16} />,
  },
  medium: {
    label: '中',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock size={16} />,
  },
  low: {
    label: '低',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <Package size={16} />,
  },
};

export const ProcurementItemCard = ({ item }: ProcurementItemCardProps) => {
  const urgency = urgencyConfig[item.urgency];

  return (
    <div className={`rounded-2xl border-2 ${urgency.bg} ${urgency.border} p-5 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200">
            <Package size={24} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{item.spec.name}</h3>
            <p className="text-sm text-gray-500">{item.bathroomName}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgency.bg} ${urgency.color} border ${urgency.border} flex items-center gap-1`}>
          {urgency.icon}
          {urgency.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">尺寸</div>
          <div className="text-gray-800 font-medium">{item.spec.size}</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">材质</div>
          <div className="text-gray-800 font-medium">{item.spec.material}</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">吸盘</div>
          <div className="text-gray-800 font-medium">{item.spec.suctionCups} 个</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">数量</div>
          <div className="text-gray-800 font-medium">{item.spec.quantity} 件</div>
        </div>
      </div>

      {item.spec.notes && (
        <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
          <span className="font-medium text-gray-700">备注：</span>
          {item.spec.notes}
        </div>
      )}
    </div>
  );
};
