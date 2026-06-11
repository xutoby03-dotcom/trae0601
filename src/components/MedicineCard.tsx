import { useNavigate } from 'react-router-dom';
import { Minus, Plus, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import type { Medicine } from '@/types';
import { daysUntil, isExpired, isExpiringSoon, formatDate } from '@/utils/dateUtils';
import clsx from 'clsx';

interface Props {
  medicine: Medicine;
  onUse?: (m: Medicine) => void;
  onRestock?: (m: Medicine) => void;
  compact?: boolean;
}

export default function MedicineCard({ medicine, onUse, onRestock, compact }: Props) {
  const navigate = useNavigate();
  const expired = isExpired(medicine.expiryDate);
  const expiringSoon = !expired && isExpiringSoon(medicine.expiryDate);
  const lowStock = medicine.quantity <= medicine.lowStockThreshold;
  const daysLeft = daysUntil(medicine.expiryDate);

  const statusBadge = expired
    ? { cls: 'badge-danger', text: '已过期' }
    : expiringSoon
    ? { cls: 'badge-warning animate-pulse-slow', text: `${daysLeft}天后过期` }
    : lowStock
    ? { cls: 'badge-warning', text: '库存低' }
    : { cls: 'badge-success', text: '正常' };

  return (
    <div
      className={clsx(
        'card p-4 cursor-pointer group relative overflow-hidden',
        expired && 'ring-2 ring-danger-200 bg-danger-50/50',
        expiringSoon && 'ring-2 ring-warning-200'
      )}
      onClick={() => navigate(`/medicines/${medicine.id}`)}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110',
            expired
              ? 'bg-danger-100'
              : expiringSoon
              ? 'bg-warning-100'
              : 'bg-gradient-to-br from-primary-100 to-accent-100'
          )}
        >
          {medicine.image ? (
            <img src={medicine.image} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span>{medicine.emoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{medicine.name}</h3>
              <p className="text-xs text-gray-500">{medicine.category} · {medicine.applicableTo}</p>
            </div>
            <span className={statusBadge.cls}>{statusBadge.text}</span>
          </div>

          {!compact && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className={clsx(
                    'font-bold',
                    lowStock ? 'text-danger-600 text-base' : 'text-gray-800 text-base'
                  )}>
                    {medicine.quantity}
                  </span>
                  <span>{medicine.unit}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(medicine.expiryDate)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {medicine.storageLocation}
              </div>
            </div>
          )}

          {medicine.childWarning && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              儿童慎用
            </div>
          )}
        </div>
      </div>

      {!expired && (onUse || onRestock) && (
        <div
          className="mt-3 pt-3 border-t border-gray-100 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {onUse && (
            <button
              onClick={() => onUse(medicine)}
              disabled={medicine.quantity <= 0}
              className="flex-1 btn-sm btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
              用了
            </button>
          )}
          {onRestock && (
            <button
              onClick={() => onRestock(medicine)}
              className="flex-1 btn-sm btn-primary"
            >
              <Plus className="w-4 h-4" />
              补货
            </button>
          )}
        </div>
      )}
    </div>
  );
}
