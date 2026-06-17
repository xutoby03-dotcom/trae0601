import { useNavigate } from 'react-router-dom';
import { MapPin, Shirt } from 'lucide-react';
import { useMemo } from 'react';
import type { Box } from '@/types';
import { useStore } from '@/store/useStore';
import ProgressBar from '@/components/ui/ProgressBar';
import { getBoxOccupancyRate } from '@/utils/helpers';

interface BoxCardProps {
  box: Box;
  variant?: 'grid' | 'list';
}

export default function BoxCard({ box, variant = 'grid' }: BoxCardProps) {
  const navigate = useNavigate();
  const allClothes = useStore((state) => state.clothes);
  
  const clothes = useMemo(() => 
    allClothes.filter(c => c.boxId === box.id && c.status === 'in_box'),
    [allClothes, box.id]
  );
  
  const occupancyRate = getBoxOccupancyRate(clothes.length, box.capacity);

  if (variant === 'list') {
    return (
      <div
        onClick={() => navigate(`/boxes/${box.id}`)}
        className="card p-4 card-hover cursor-pointer opacity-0 animate-fade-in-up"
        style={{ backgroundColor: box.labelColor + '10' }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: box.labelColor + '30' }}
          >
            <span className="text-sm font-bold" style={{ color: box.labelColor }}>
              {box.code}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-warm-800 truncate">{box.code}</h3>
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: box.labelColor }}
              />
            </div>
            <div className="flex items-center gap-1 text-sm text-warm-500 mb-2">
              <MapPin size={14} />
              <span className="truncate">{box.location}</span>
            </div>
            <ProgressBar value={clothes.length} max={box.capacity} size="sm" />
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-semibold text-warm-700">{clothes.length}</div>
            <div className="text-xs text-warm-400">/ {box.capacity} 件</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/boxes/${box.id}`)}
      className="card overflow-hidden card-hover cursor-pointer opacity-0 animate-fade-in-up"
    >
      <div 
        className="h-24 relative"
        style={{ 
          background: `linear-gradient(135deg, ${box.labelColor}40 0%, ${box.labelColor}10 100%)`,
          backgroundColor: box.labelColor + '15'
        }}
      >
        {box.photo && (
          <img 
            src={box.photo} 
            alt={box.code}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute top-3 left-3">
          <span 
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: box.labelColor, color: 'white' }}
          >
            {box.code}
          </span>
        </div>
        <div 
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: box.labelColor }}
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 text-sm text-warm-500 mb-2">
          <MapPin size={14} />
          <span className="truncate">{box.location}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-warm-600">
            <Shirt size={16} />
            <span className="text-sm font-medium">{clothes.length} 件</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: occupancyRate >= 80 ? '#E8998D' : '#9CAF88' }}>
            {occupancyRate}%
          </span>
        </div>
        <ProgressBar value={clothes.length} max={box.capacity} size="sm" />
      </div>
    </div>
  );
}
