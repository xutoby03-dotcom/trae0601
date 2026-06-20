import { useMemo } from 'react';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  SEVERITY_LABELS,
  type Annotation,
} from '@/types';
import { formatDateTime } from '@/utils/common';
import { Trash2, MessageSquare, AlertTriangle, Eye } from 'lucide-react';

interface Props {
  annotations: Annotation[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onJumpTo: (id: string) => void;
  onDelete: (id: string) => void;
}

const SEVERITY_CLASS: Record<Annotation['severity'], string> = {
  low: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  medium: 'border-amber-500/40 text-amber-glow bg-amber-500/10',
  high: 'border-alert-danger/50 text-alert-danger bg-alert-dangerBg',
};

export default function AnnotationListPanel({
  annotations,
  activeId,
  onHover,
  onJumpTo,
  onDelete,
}: Props) {
  const finalAnns = useMemo(
    () => annotations.filter((a) => a.imageType === 'final'),
    [annotations]
  );
  const btsAnns = useMemo(
    () => annotations.filter((a) => a.imageType === 'bts'),
    [annotations]
  );

  const Section = ({
    title,
    list,
    type,
  }: {
    title: string;
    list: Annotation[];
    type: '成片' | '花絮';
  }) => (
    <section className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-studio-500 font-semibold">
            {title}
          </span>
          <span className="chip border-studio-700 text-studio-400 bg-studio-800/40">
            {list.length}条
          </span>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="py-5 text-center rounded-lg border border-dashed border-studio-700/60">
          <Eye className="w-5 h-5 text-studio-600 mx-auto mb-1" />
          <p className="text-[11px] text-studio-500">
            点击{type}图任意位置添加问题标注
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => {
            const color = ANNOTATION_COLORS[a.type];
            const active = activeId === a.id;
            return (
              <div
                key={a.id}
                onMouseEnter={() => onHover(a.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onJumpTo(a.id)}
                className={`group relative p-3 rounded-lg border cursor-pointer transition-all
                           ${
                             active
                               ? 'border-amber-glow/60 bg-amber-glow/5'
                               : 'border-studio-700/50 bg-studio-850/40 hover:border-studio-600 hover:bg-studio-800/60'
                           }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="relative shrink-0 mt-0.5"
                    style={{ color }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center border-2"
                      style={{
                        borderColor: color,
                        background: `${color}18`,
                        boxShadow: active ? `0 0 8px ${color}70` : 'none',
                      }}
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </div>
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full border animate-pulse-ring"
                        style={{ borderColor: color }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      <span
                        className="chip text-[10px]"
                        style={{
                          borderColor: `${color}50`,
                          background: `${color}14`,
                          color,
                        }}
                      >
                        {ANNOTATION_LABELS[a.type]}
                      </span>
                      <span
                        className={`chip text-[10px] ${SEVERITY_CLASS[a.severity]}`}
                      >
                        {SEVERITY_LABELS[a.severity]}
                      </span>
                      <span className="ml-auto text-[10px] font-mono text-studio-600">
                        {Math.round(a.x)},{Math.round(a.y)}
                      </span>
                    </div>
                    <p className="text-[12px] text-studio-300 leading-relaxed">
                      {a.comment}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-studio-500">
                        <MessageSquare className="w-3 h-3" />
                        {a.author} · {formatDateTime(a.createdAt)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(a.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-studio-500 hover:text-alert-danger hover:bg-alert-dangerBg transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <div className="p-4">
      <Section title="成片标注" list={finalAnns} type="成片" />
      <Section title="花絮标注" list={btsAnns} type="花絮" />
    </div>
  );
}
