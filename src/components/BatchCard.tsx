import { Link } from 'react-router-dom';
import {
  Snowflake,
  Clock,
  Package,
  Edit3,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { GroupBatch } from '../types';
import { cn } from '@/lib/utils';

interface BatchCardProps {
  batch: GroupBatch;
  orderCount: number;
  pickedCount: number;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: { label: '待到货', color: 'bg-amber-100 text-amber-700', icon: Clock },
  arrived: { label: '已到货', color: 'bg-emerald-100 text-emerald-700', icon: Package },
  completed: { label: '已完成', color: 'bg-slate-100 text-slate-700', icon: CheckCircle },
};

export function BatchCard({ batch, orderCount, pickedCount, onDelete }: BatchCardProps) {
  const status = statusConfig[batch.status];
  const StatusIcon = status.icon;
  const progress = orderCount > 0 ? Math.round((pickedCount / orderCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        {batch.productImage && (
          <img
            src={batch.productImage}
            alt={batch.productName}
            className="w-full h-40 object-cover"
          />
        )}
        {batch.needRefrigeration && (
          <div className="absolute top-3 left-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md animate-pulse">
            <Snowflake className="w-3 h-3" />
            冷藏商品
          </div>
        )}
        <div className={cn('absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1', status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{batch.productName}</h3>

        <div className="space-y-2 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>到货时间：{new Date(batch.arrivalTime).toLocaleString('zh-CN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span>总份数：{batch.totalQuantity} 份</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>已预订：{orderCount} 份</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>取货进度</span>
            <span>{pickedCount} / {orderCount} ({progress}%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/batches/${batch.id}/orders`}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
          >
            订单管理
          </Link>
          <Link
            to={`/batches/${batch.id}/edit`}
            className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(batch.id)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
