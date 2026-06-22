import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Diamond,
  Scale,
  Hash,
  FileText,
  Navigation,
  Clock,
  Trash2,
  Ruler,
} from 'lucide-react';
import type { WaxModel, WaxStatus } from '@/types';
import { useWaxStore } from '@/store/useWaxStore';
import {
  STATUS_META,
  DEFECT_META,
  SETTING_SHAPE_OPTIONS,
  ROD_POSITION_OPTIONS,
  NEXT_STATUS,
  PREV_STATUS,
} from '@/utils/constants';
import { cn, timeAgo } from '@/utils/helpers';
import DefectModal from './DefectModal';

interface WaxCardProps {
  model: WaxModel;
  index: number;
}

export default function WaxCard({ model, index }: WaxCardProps) {
  const { updateStatus, removeWaxModel } = useWaxStore();
  const [showDefect, setShowDefect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = STATUS_META[model.status];
  const nextStatus = NEXT_STATUS[model.status];
  const prevStatus = PREV_STATUS[model.status];
  const hasDefect = model.defects.length > 0;
  const settingLabel =
    SETTING_SHAPE_OPTIONS.find((s) => s.value === model.settingShape)?.label ||
    model.settingShape;
  const rodLabel =
    ROD_POSITION_OPTIONS.find((r) => r.value === model.rodPosition)?.label ||
    model.rodPosition;

  function goNext() {
    if (nextStatus) {
      updateStatus(model.id, nextStatus as WaxStatus);
    }
  }

  function goPrev() {
    if (prevStatus) {
      updateStatus(model.id, prevStatus as WaxStatus);
    }
  }

  return (
    <>
      <div
        className={cn(
          'glass-card p-4 relative overflow-hidden transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-gold animate-fade-in-up',
          hasDefect &&
            'border-ruby-600/40 hover:border-ruby-500/60',
        )}
        style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      >
        {hasDefect && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-ruby-500 via-ruby-400 to-ruby-500 animate-pulse-ruby" />
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={cn(
              'px-2.5 py-1 rounded-md font-mono text-[11px] font-bold tracking-wider',
              hasDefect
                ? 'bg-ruby-600/20 text-ruby-300 border border-ruby-600/40'
                : 'bg-gradient-to-br from-gold-500/20 to-gold-700/10 text-gold-300 border border-gold-600/30',
            )}
          >
            {model.id}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDefect(true)}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                hasDefect
                  ? 'bg-ruby-600/25 text-ruby-300 hover:bg-ruby-600/40 animate-pulse-ruby'
                  : 'bg-ink-800/60 text-ink-400 hover:text-ruby-400 hover:bg-ruby-600/20',
              )}
              title="标记缺陷"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete((v) => !v)}
              className="p-1.5 rounded-md bg-ink-800/60 text-ink-500 hover:text-ruby-400 hover:bg-ruby-600/20 transition-all duration-200"
              title="删除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div className="mb-3 p-2 rounded-md bg-ruby-600/15 border border-ruby-600/40 animate-fade-in-up">
            <p className="text-xs font-serif text-ruby-300 mb-2">
              确认删除此蜡模记录？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => removeWaxModel(model.id)}
                className="btn-danger text-xs py-1 px-2 flex-1"
              >
                确认删除
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn-ghost text-xs py-1 px-2 flex-1"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 text-[12px] font-mono">
          <InfoRow
            icon={<FileText className="w-3 h-3 text-gold-500" />}
            label="客户单"
            value={model.orderNo}
            valueClass="text-gold-200"
          />
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <InfoRow
              icon={<Hash className="w-3 h-3 text-gold-500" />}
              label="戒圈"
              value={model.ringSize}
              valueClass="text-jade-500 font-semibold"
            />
            <InfoRow
              icon={<Scale className="w-3 h-3 text-gold-500" />}
              label="重量"
              value={`${model.weight.toFixed(2)}g`}
              valueClass="text-ink-200"
            />
            <InfoRow
              icon={<Diamond className="w-3 h-3 text-gold-500" />}
              label="镶口"
              value={settingLabel.split(' ')[0]}
              valueClass="text-amber-300"
            />
            <InfoRow
              icon={<Ruler className="w-3 h-3 text-gold-500" />}
              label="主石"
              value={model.stoneSize}
              valueClass="text-ink-200"
            />
          </div>
          <InfoRow
            icon={
              <Navigation
                className="w-3 h-3 text-gold-500"
                style={{ transform: 'rotate(45deg)' }}
              />
            }
            label="支撑杆"
            value={rodLabel}
            valueClass="text-ink-300"
          />
        </div>

        {hasDefect && (
          <div className="mt-3 pt-3 border-t border-ruby-600/20 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {model.defects.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 rounded text-[10px] font-serif bg-ruby-600/20 border border-ruby-600/40 text-ruby-300"
                >
                  {DEFECT_META[d].label}
                </span>
              ))}
            </div>
            {model.remakeReason && (
              <p className="text-[11px] text-ruby-400/80 leading-relaxed font-serif">
                {model.remakeReason}
              </p>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-ink-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-ink-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{timeAgo(model.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={goPrev}
                disabled={!prevStatus}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200',
                  prevStatus
                    ? 'bg-ink-800/80 text-ink-300 hover:bg-gold-600/20 hover:text-gold-300 hover:border-gold-600/40 border border-ink-700'
                    : 'bg-ink-800/30 text-ink-600 cursor-not-allowed border border-ink-800',
                )}
                title={prevStatus ? `返回：${STATUS_META[prevStatus as WaxStatus].label}` : '已是最早阶段'}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div
                className={cn(
                  'px-2 py-1 rounded-md text-[10px] font-serif font-semibold tracking-wide bg-gradient-to-br',
                  meta.accent,
                  meta.color,
                  'border border-white/5',
                )}
              >
                {meta.shortLabel}
              </div>
              <button
                onClick={goNext}
                disabled={!nextStatus}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200',
                  nextStatus
                    ? 'bg-gradient-to-br from-gold-600/80 to-gold-800 text-ink-950 hover:from-gold-500 hover:to-gold-700 shadow-gold-sm border border-gold-500/50'
                    : 'bg-ink-800/30 text-ink-600 cursor-not-allowed border border-ink-800',
                )}
                title={nextStatus ? `推进：${STATUS_META[nextStatus as WaxStatus].label}` : '等待浇铸'}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDefect && (
        <DefectModal waxId={model.id} onClose={() => setShowDefect(false)} />
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-ink-500 text-[10px] flex-shrink-0 w-10 font-serif tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          'truncate font-semibold',
          valueClass || 'text-ink-100',
        )}
      >
        {value}
      </span>
    </div>
  );
}
