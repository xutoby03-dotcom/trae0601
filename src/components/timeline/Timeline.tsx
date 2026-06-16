import {
  Droplets,
  Move,
  Scissors,
  Flower2,
  Camera,
  MoreHorizontal,
  Repeat,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TimelineEvent } from '../../types';

interface TimelineProps {
  events: TimelineEvent[];
}

const eventConfig = {
  water: { icon: Droplets, label: '浇水', color: 'bg-forest-100 text-forest-700 border-forest-200' },
  move: { icon: Move, label: '移位', color: 'bg-clay-100 text-clay-700 border-clay-200' },
  prune: { icon: Scissors, label: '修剪', color: 'bg-forest-100 text-forest-700 border-forest-200' },
  fertilize: { icon: Flower2, label: '施肥', color: 'bg-leaf-100 text-leaf-700 border-leaf-200' },
  photo: { icon: Camera, label: '拍照', color: 'bg-cream-200 text-forest-700 border-cream-300' },
  repot: { icon: Repeat, label: '换盆', color: 'bg-clay-100 text-clay-700 border-clay-200' },
  other: { icon: MoreHorizontal, label: '其他', color: 'bg-cream-200 text-forest-700 border-cream-300' },
};

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-forest-400 text-sm">
        暂无养护记录
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-2 bottom-2 w-px bg-cream-300" />

      <div className="space-y-4">
        {events.map((event) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative pl-14 animate-slide-up">
              <div
                className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${config.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`tag ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-forest-400">
                      {format(parseISO(event.date), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                    </span>
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-forest-700">{event.description}</p>
                )}
                {event.photoUrl && (
                  <img
                    src={event.photoUrl}
                    alt="记录照片"
                    className="mt-3 w-full h-40 object-cover rounded-xl"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
