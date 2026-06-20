import { Music, Timer, Users, Guitar } from 'lucide-react';
import type { TagType } from '@/types';
import { TAG_TYPE_LABELS, TAG_TYPE_COLORS } from '@/types';

interface TagToolbarProps {
  onAddTag: (type: TagType) => void;
  currentTime: number;
}

const tagIcons: Record<TagType, typeof Music> = {
  pitch: Music,
  rhythm: Timer,
  harmony: Users,
  solo: Guitar,
};

export function TagToolbar({ onAddTag, currentTime }: TagToolbarProps) {
  const tagTypes: TagType[] = ['pitch', 'rhythm', 'harmony', 'solo'];

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <span className="text-xs text-slate-400 mr-2">快速打标：</span>
      {tagTypes.map((type) => {
        const Icon = tagIcons[type];
        const color = TAG_TYPE_COLORS[type];
        return (
          <button
            key={type}
            onClick={() => onAddTag(type)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            <Icon size={16} />
            <span>{TAG_TYPE_LABELS[type]}</span>
          </button>
        );
      })}
      <div className="ml-auto text-xs text-slate-500 font-mono">
        当前：{Math.floor(currentTime / 60).toString().padStart(2, '0')}:
        {Math.floor(currentTime % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
}
