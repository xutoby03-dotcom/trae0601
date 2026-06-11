import { Ruler, Store, Banknote, Clock, User } from 'lucide-react';
import type { Equipment } from '../types';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '../types';
import { formatCurrency } from '../utils/costCalculator';

interface EquipmentCardProps {
  equipment: Equipment;
  onRent?: () => void;
  currentUser?: string;
}

const statusColors = {
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rented: 'bg-amber-100 text-amber-700 border-amber-200',
  returned: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function EquipmentCard({ equipment, onRent, currentUser }: EquipmentCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={equipment.photo}
          alt={equipment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[equipment.status]}`}>
            {EQUIPMENT_STATUS_LABELS[equipment.status]}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-sky-700 backdrop-blur-sm">
            {EQUIPMENT_TYPE_LABELS[equipment.type]}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-lg drop-shadow-md">{equipment.name}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Ruler className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span className="truncate">{equipment.size}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Store className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span className="truncate">{equipment.rentalShop}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Banknote className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>押金 {formatCurrency(equipment.deposit)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{formatCurrency(equipment.dailyPrice)}/天</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-100">
          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>适合身高：{equipment.suitableHeight}</span>
        </div>

        {currentUser && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              使用人：<span className="font-medium text-slate-700">{currentUser}</span>
            </p>
          </div>
        )}

        {onRent && equipment.status === 'available' && (
          <button
            onClick={onRent}
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-medium hover:from-sky-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
          >
            立即认领
          </button>
        )}
      </div>
    </div>
  );
}
