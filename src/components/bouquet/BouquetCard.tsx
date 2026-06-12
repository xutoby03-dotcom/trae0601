import { Bouquet } from '@/types';
import { formatPrice, daysUntil } from '@/utils/date';
import { MapPin, Clock, Plus, AlertTriangle } from 'lucide-react';

interface BouquetCardProps {
  bouquet: Bouquet;
  onReserve: (bouquet: Bouquet) => void;
}

export default function BouquetCard({ bouquet, onReserve }: BouquetCardProps) {
  const availableStock = bouquet.stock - bouquet.reservedCount;
  const freshDays = daysUntil(bouquet.freshUntil);
  const isFreshWarning = freshDays <= 2;

  return (
    <div className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={bouquet.photo}
          alt={bouquet.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-forest-600">
            {bouquet.category}
          </span>
        </div>
        
        {isFreshWarning && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-rose-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            仅剩{freshDays}天
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-white mb-1 drop-shadow">
                {bouquet.name}
              </h3>
              <p className="text-white/80 text-xs">{bouquet.color}</p>
            </div>
            <p className="text-xl font-bold text-white drop-shadow">
              {formatPrice(bouquet.price)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-forest-500 line-clamp-2 mb-3 h-10">
          {bouquet.materials}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-forest-400 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{bouquet.freshLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>保鲜期 {freshDays}天</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${availableStock <= 2 ? 'text-rose-500' : 'text-forest-600'}`}>
              剩余 {availableStock} 束
            </span>
            {bouquet.reservedCount > 0 && (
              <span className="text-xs text-forest-400">
                (已预留 {bouquet.reservedCount})
              </span>
            )}
          </div>
          
          <button
            onClick={() => onReserve(bouquet)}
            disabled={availableStock <= 0}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white text-sm font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200/50"
          >
            <Plus className="w-4 h-4" />
            预留
          </button>
        </div>
      </div>
    </div>
  );
}
