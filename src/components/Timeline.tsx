import { Clock, Waves } from 'lucide-react';
import { TIME_POINT_LABELS, TIME_POINTS } from '@/types';
import type { ScentNote, TimePoint } from '@/types';

interface TimelineProps {
  timeline: Record<TimePoint, ScentNote>;
}

export function Timeline({ timeline }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-300 via-rose-300 to-violet-300"></div>
      
      <div className="space-y-8">
        {TIME_POINTS.map((timePoint, index) => {
          const note = timeline[timePoint];
          
          return (
            <div key={timePoint} className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-amber-200">
                <Clock className="h-5 w-5 text-amber-700" />
              </div>
              
              <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 transition-all duration-300 hover:shadow-md hover:ring-stone-200">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-serif text-lg font-semibold text-stone-800">
                    {TIME_POINT_LABELS[timePoint]}
                  </h4>
                  <DiffusionBadge level={note.diffusion} />
                </div>
                
                <div className="space-y-2.5">
                  <NoteRow label="前调" value={note.top} color="amber" delay={index * 0.1} />
                  <NoteRow label="中调" value={note.middle} color="rose" delay={index * 0.1 + 0.05} />
                  <NoteRow label="尾调" value={note.base} color="violet" delay={index * 0.1 + 0.1} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface NoteRowProps {
  label: string;
  value: string;
  color: 'amber' | 'rose' | 'violet';
  delay: number;
}

function NoteRow({ label, value, color }: NoteRowProps) {
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]}`}>
        {label}
      </span>
      <p className="text-sm leading-relaxed text-stone-600">{value}</p>
    </div>
  );
}

interface DiffusionBadgeProps {
  level: number;
}

function DiffusionBadge({ level }: DiffusionBadgeProps) {
  const labels = ['极弱', '较弱', '适中', '较强', '极强'];
  
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
      <Waves className="h-4 w-4 text-stone-500" />
      <span className="text-xs font-medium text-stone-600">扩散 {level}/5</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              i <= level ? 'bg-amber-400' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function DiffusionVisual({ level }: { level: number }) {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`absolute rounded-full border transition-all duration-500 ${
            i <= level
              ? 'border-amber-300 bg-amber-100/30'
              : 'border-stone-200 bg-transparent'
          }`}
          style={{
            width: `${i * 16 + 20}%`,
            height: `${i * 16 + 20}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <div className="relative z-10 text-sm font-bold text-amber-700">{level}</div>
    </div>
  );
}
