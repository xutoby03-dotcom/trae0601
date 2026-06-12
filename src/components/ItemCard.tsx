import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle } from 'lucide-react';
import type { Item } from '@/types';
import StatusBadge from './StatusBadge';

interface Props {
  item: Item;
}

export default function ItemCard({ item }: Props) {
  const stockPercent = Math.min(100, Math.round((item.currentStock / Math.max(item.minStock, 1)) * 50));
  const isDanger = item.currentStock < item.minStock;
  const stockStatus = isDanger ? 'danger' : item.currentStock <= item.minStock * 1.5 ? 'warn' : 'normal';

  return (
    <Link
      to={`/items/${item.id}`}
      className="card-hover block overflow-hidden group"
    >
      <div className="relative h-36 bg-slate-100 overflow-hidden">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-display">
            {item.name.charAt(0)}
          </div>
        )}
        {isDanger && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-danger-500 text-white text-xs font-medium shadow-sm animate-pulse-slow">
            <AlertTriangle className="w-3.5 h-3.5" />
            库存不足
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge type="stock" value={stockStatus} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
          <span className="text-sm font-medium text-brand-600">¥{item.unitPrice}</span>
        </div>
        <p className="text-xs text-slate-500 mb-3 truncate">{item.specification}</p>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">库存</span>
            <span className={isDanger ? 'text-danger-600 font-semibold' : 'text-slate-700 font-medium'}>
              {item.currentStock} / 下限 {item.minStock}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDanger ? 'bg-danger-500' : stockPercent < 70 ? 'bg-warn-400' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.max(4, stockPercent)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          {item.location}
        </div>
      </div>
    </Link>
  );
}
