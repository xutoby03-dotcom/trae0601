import { Link } from 'react-router-dom';
import { Car, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatDate } from '@/utils/date';
import { useVehicleStore } from '@/store/useVehicleStore';

interface VehicleCardProps {
  vehicle: Vehicle;
  lastInspectionDate?: string | null;
  daysSinceLastInspection?: number;
  status?: 'normal' | 'warning' | 'danger';
  onDelete?: (id: string) => void;
}

export default function VehicleCard({ vehicle, lastInspectionDate, daysSinceLastInspection, status = 'normal' }: VehicleCardProps) {
  const { deleteVehicle } = useVehicleStore();
  
  const statusConfig = {
    normal: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '正常' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', label: '需关注' },
    danger: { bg: 'bg-red-100', text: 'text-red-700', label: '需立即检查' }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`确定要删除车辆 ${vehicle.brand} ${vehicle.model} 吗？`)) {
      deleteVehicle(vehicle.id);
    }
  };

  return (
    <Link to={`/vehicles/edit/${vehicle.id}`} className="block">
      <div className="card card-hover p-4 animate-fade-in-up">
        <div className="flex items-start justify-between mb-3">
          <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {vehicle.photo ? (
              <img src={vehicle.photo} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Car className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className={`badge ${statusConfig[status].bg} ${statusConfig[status].text} text-xs px-2 py-1 rounded-full`}>
            {statusConfig[status].label}
          </div>
        </div>
        
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-1">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{vehicle.plateNumber}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {lastInspectionDate ? (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>上次检查: {formatDate(lastInspectionDate)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <Clock className="w-3 h-3" />
              <span>暂无检查记录</span>
            </div>
          )}
        </div>

        {typeof daysSinceLastInspection !== 'undefined' && daysSinceLastInspection !== 999 && (
          <div className={`text-sm font-medium ${statusConfig[status].text}`}>
            距上次检查 {daysSinceLastInspection} 天
          </div>
        )}
        
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Link
            to={`/vehicles/edit/${vehicle.id}`}
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
