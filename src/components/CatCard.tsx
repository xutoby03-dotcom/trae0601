import { Edit2, Trash2 } from 'lucide-react';
import type { Cat } from '@/types';

interface CatCardProps {
  cat: Cat;
  onEdit: (cat: Cat) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

export default function CatCard({ cat, onEdit, onDelete, delay = 0 }: CatCardProps) {
  return (
    <div
      className="card group opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-cream-200">
          <img
            src={cat.photoUrl}
            alt={cat.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-display">{cat.name}</h3>
              <p className="text-sm text-warm-300">
                {cat.age}岁 · {cat.weight}kg
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(cat)}
                className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
              >
                <Edit2 size={18} className="text-warm-400" />
              </button>
              <button
                onClick={() => onDelete(cat.id)}
                className="p-2 rounded-xl hover:bg-coral-100 transition-colors"
              >
                <Trash2 size={18} className="text-coral-300" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-warm-300">饮食：</span>
              <span className="text-warm-400 truncate">{cat.diet}</span>
            </div>
            <div>
              <span className="text-warm-300">健康：</span>
              <span className="text-warm-400 truncate">{cat.healthNotes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
