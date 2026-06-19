import { Edit2, Trash2, MapPin, Ruler, Box, RefreshCw } from 'lucide-react';
import type { LitterBox } from '@/types';
import { formatDate } from '@/utils/calculation';

interface LitterBoxCardProps {
  box: LitterBox;
  onEdit: (box: LitterBox) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

export default function LitterBoxCard({ box, onEdit, onDelete, delay = 0 }: LitterBoxCardProps) {
  return (
    <div
      className="card group opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-sand-100">
            <Box size={24} className="text-sand-300" />
          </div>
          <div>
            <h3 className="text-xl font-display">{box.location}</h3>
            <p className="text-sm text-warm-300">{box.litterType}</p>
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(box)}
            className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
          >
            <Edit2 size={18} className="text-warm-400" />
          </button>
          <button
            onClick={() => onDelete(box.id)}
            className="p-2 rounded-xl hover:bg-coral-100 transition-colors"
          >
            <Trash2 size={18} className="text-coral-300" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Ruler size={16} className="text-warm-300" />
          <span className="text-warm-400">{box.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-warm-300" />
          <span className="text-warm-400">{box.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-warm-300" />
          <span className="text-warm-400">
            每日{box.cleaningFrequency}次 · {box.fullChangeInterval}天换砂
          </span>
        </div>
        <div>
          <span className="text-warm-300">除臭：</span>
          <span className="text-warm-400">{box.deodorizer}</span>
        </div>
      </div>
      
      {box.lastFullChangeDate && (
        <div className="mt-4 pt-4 border-t border-warm-100 text-sm">
          <span className="text-warm-300">上次整盆换砂：</span>
          <span className="text-forest-300 font-medium">
            {formatDate(box.lastFullChangeDate)}
          </span>
        </div>
      )}
    </div>
  );
}
