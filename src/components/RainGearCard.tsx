import type { RainGear } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, User, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface RainGearCardProps {
  gear: RainGear;
  onClick?: () => void;
  selected?: boolean;
  showFrequency?: boolean;
}

const typeLabels: Record<string, string> = {
  umbrella: '雨伞',
  raincoat: '雨衣',
  shoecover: '鞋套',
  other: '其他',
};

export function RainGearCard({ gear, onClick, selected, showFrequency }: RainGearCardProps) {
  const isHighFrequency = gear.borrowCount >= 15;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        selected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
    >
      <div className="aspect-video overflow-hidden bg-slate-100 relative">
        <img
          src={gear.photoUrl}
          alt={gear.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={gear.status} />
        </div>
        {isHighFrequency && showFrequency && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-md">
            <Zap className="w-3 h-3" />
            高频使用
          </div>
        )}
        {gear.isDamaged && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-md">
            <AlertTriangle className="w-3 h-3" />
            待维修
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900">{gear.name}</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {typeLabels[gear.type]}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-4 h-4 rounded-full border-2 border-slate-200" style={{ backgroundColor: gear.color }} />
            <span>{gear.color}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="truncate">{gear.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4 text-slate-400" />
            <span>{gear.suitableFor}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>已借出 {gear.borrowCount} 次</span>
          </div>
        </div>
      </div>
    </div>
  );
}
