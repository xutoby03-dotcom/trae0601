import { Link } from 'react-router-dom';
import { Package, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import type { Medicine } from '@/types';
import { getMedicineStatus, formatDate, getDaysUntilExpiry } from '@/utils/medicine';
import StatusBadge from './StatusBadge';

interface MedicineCardProps {
  medicine: Medicine;
  showDetails?: boolean;
}

export default function MedicineCard({ medicine, showDetails = false }: MedicineCardProps) {
  const status = getMedicineStatus(medicine);
  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);

  return (
    <Link
      to={`/medicines/${medicine.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
    >
      <div className="flex gap-4 p-4">
        {medicine.photo ? (
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={medicine.photo}
              alt={medicine.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{medicine.name}</h3>
            <StatusBadge status={status} />
          </div>
          
          <p className="text-sm text-gray-500 mb-2 truncate">{medicine.specification}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {status.color === 'red' ? (
                  <span className="text-danger-600 font-medium">已过期 {Math.abs(daysUntilExpiry)} 天</span>
                ) : status.color === 'orange' ? (
                  <span className="text-warning-600 font-medium">还剩 {daysUntilExpiry} 天</span>
                ) : (
                  <span>有效期至 {formatDate(medicine.expiryDate)}</span>
                )}
              </span>
            </div>
          </div>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{medicine.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">剩余 {medicine.quantity} 份</span>
              </div>
              {medicine.quantity <= 2 && (
                <div className="flex items-center gap-2 text-sm text-warning-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">库存不足</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
