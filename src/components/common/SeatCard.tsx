import { Link } from 'react-router-dom';
import { Armchair, Edit2, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Seat, INSTALLATION_TYPE_LABELS } from '@/types';
import { formatDate, daysFromNow } from '@/utils/date';
import { useSeatStore } from '@/store/useSeatStore';

interface SeatCardProps {
  seat: Seat;
  daysUntilExpiry?: number;
  expiryStatus?: 'normal' | 'warning' | 'danger';
}

export default function SeatCard({ seat, expiryStatus = 'normal' }: SeatCardProps) {
  const { deleteSeat } = useSeatStore();
  
  const statusConfig = {
    normal: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '正常使用' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', label: '即将到期' },
    danger: { bg: 'bg-red-100', text: 'text-red-700', label: '即将过期' }
  };

  const daysUntil = daysFromNow(seat.expiryDate);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`确定要删除座椅 ${seat.brand} ${seat.model} 吗？`)) {
      deleteSeat(seat.id);
    }
  };

  return (
    <Link to={`/seats/edit/${seat.id}`} className="block">
      <div className="card card-hover p-4 animate-fade-in-up">
        <div className="flex items-start justify-between mb-3">
          <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {seat.photo ? (
              <img src={seat.photo} alt={`${seat.brand} ${seat.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Armchair className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className={`badge ${statusConfig[expiryStatus].bg} ${statusConfig[expiryStatus].text} text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
            {expiryStatus !== 'normal' && <AlertTriangle className="w-3 h-3" />}
            {statusConfig[expiryStatus].label}
          </div>
        </div>
        
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-1">
          {seat.brand} {seat.model}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          适用体重: {seat.weightRange}
        </p>
        
        <div className="space-y-2 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">安装方式:</span>
            <span>{INSTALLATION_TYPE_LABELS[seat.installationType]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>生产日期: {formatDate(seat.manufactureDate)}</span>
          </div>
          <div className={`flex items-center gap-1 ${expiryStatus !== 'normal' ? 'font-medium' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span>
              过期日期: {formatDate(seat.expiryDate)}
              {daysUntil > 0 && ` (剩余 ${daysUntil} 天)`}
              {daysUntil <= 0 && ` (已过期 ${Math.abs(daysUntil)} 天)`}
            </span>
          </div>
        </div>

        <div className={`text-sm font-medium ${statusConfig[expiryStatus].text} mb-3`}>
          {daysUntil > 180 && `剩余 ${daysUntil} 天过期`}
          {daysUntil <= 180 && daysUntil > 90 && `警告: 剩余 ${daysUntil} 天过期`}
          {daysUntil <= 90 && daysUntil > 0 && `危险: 剩余 ${daysUntil} 天过期`}
          {daysUntil <= 0 && `已过期! 请立即更换`}
        </div>
        
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Link
            to={`/seats/edit/${seat.id}`}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit2 className="w-3 h-3" />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            删除
          </button>
        </div>
      </div>
    </Link>
  );
}
