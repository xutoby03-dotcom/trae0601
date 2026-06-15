import React from 'react';
import { Calendar, Package, User, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { Medicine } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { getMedicineStatus, getStatusBgColor } from '@/utils/statusUtils';
import { formatDate, daysUntilExpiry } from '@/utils/dateUtils';

interface MedicineCardProps {
  medicine: Medicine;
  onUse?: (medicine: Medicine) => void;
  onSupply?: (medicine: Medicine) => void;
  showActions?: boolean;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onUse, onSupply, showActions = true }) => {
  const status = getMedicineStatus(medicine);
  const bgClass = getStatusBgColor(status);
  const isExpired = status === 'expired';
  const daysLeft = daysUntilExpiry(medicine.expiryDate);
  
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${bgClass} ${isExpired ? 'animate-breathe' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
            <p className="text-gray-500 text-sm">{medicine.specification}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4 text-gray-400" />
            <span>批号: {medicine.batchNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(medicine.expiryDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>补给人: {medicine.lastSupplier}</span>
          </div>
          <div className="flex items-center gap-2">
            {daysLeft <= 30 && daysLeft > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{daysLeft}天后过期</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{medicine.currentQuantity}</span>
            <span className="text-gray-500 text-sm">/ 最低 {medicine.minimumQuantity}</span>
          </div>
          
          {showActions && !isExpired && (
            <div className="flex gap-2">
              <button
                onClick={() => onUse?.(medicine)}
                disabled={medicine.currentQuantity <= 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDownCircle className="w-4 h-4" />
                领用
              </button>
              <button
                onClick={() => onSupply?.(medicine)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                补给
              </button>
            </div>
          )}
          
          {isExpired && (
            <span className="text-red-600 font-medium text-sm">已过期，不可使用</span>
          )}
        </div>
      </div>
    </div>
  );
};
