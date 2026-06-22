import { useState, useEffect } from 'react';
import { X, Zap, Squircle, Eraser, AlertTriangle, RotateCcw } from 'lucide-react';
import { useWaxStore } from '@/store/useWaxStore';
import { DEFECT_META } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import type { DefectType } from '@/types';

interface DefectModalProps {
  waxId: string;
  onClose: () => void;
}

const DEFECT_LIST: { value: DefectType; icon: typeof Zap }[] = [
  { value: 'crack', icon: Zap },
  { value: 'deform', icon: Squircle },
  { value: 'unclear', icon: Eraser },
];

export default function DefectModal({ waxId, onClose }: DefectModalProps) {
  const { items, markDefects, clearDefects } = useWaxStore();
  const current = items.find((i) => i.id === waxId);
  const [selected, setSelected] = useState<DefectType[]>(current?.defects || []);
  const [reason, setReason] = useState(current?.remakeReason || '');
  const [resetToWaxing, setResetToWaxing] = useState(true);

  useEffect(() => {
    if (current) {
      setSelected(current.defects);
      setReason(current.remakeReason || '');
    }
  }, [current]);

  if (!current) return null;

  function toggleDefect(d: DefectType) {
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      clearDefects(waxId);
      onClose();
      return;
    }
    markDefects(waxId, selected, reason.trim(), resetToWaxing);
    onClose();
  }

  const hasDefects = selected.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div
        className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="gold-border relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="glass-card p-6 max-h-[85vh] overflow-y-auto scrollbar-thin"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ruby-600/20 border border-ruby-600/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-ruby-400" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-ruby-300">
                  标记缺陷
                </h2>
                <p className="text-xs font-mono text-ink-500 mt-0.5">
                  蜡模编号：<span className="text-gold-400">{current.id}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost p-1.5"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            <p className="text-xs font-serif text-ink-400 tracking-wider">
              选择缺陷类型（可多选）：
            </p>
            {DEFECT_LIST.map(({ value, icon: Icon }) => {
              const meta = DEFECT_META[value];
              const active = selected.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDefect(value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200',
                    active
                      ? 'bg-ruby-600/15 border-ruby-500/70 shadow-gold-sm'
                      : 'bg-ink-800/40 border-ink-700 hover:border-ink-600',
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center',
                      active
                        ? 'bg-ruby-600/30 border border-ruby-500/60'
                        : 'bg-ink-700/50 border border-ink-600',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        active ? 'text-ruby-400' : 'text-ink-400',
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-sm font-serif',
                        active ? 'text-ruby-300 font-semibold' : 'text-ink-200',
                      )}
                    >
                      {meta.label}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5 font-mono">
                      {value === 'crack' && '蜡模表面或内部存在细微裂纹'}
                      {value === 'deform' && '形状与图纸不符，产生变形'}
                      {value === 'unclear' && '编号刻字不清或被覆盖'}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      active
                        ? 'bg-ruby-500 border-ruby-400'
                        : 'border-ink-600',
                    )}
                  >
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-ink-950" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {hasDefects && (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <label className="label-text">重做 / 返修原因</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="详细说明缺陷原因，如：内侧有 0.3mm 横向裂纹..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-ink-800/40 border border-ink-700 hover:border-gold-600/40 transition-all">
                <input
                  type="checkbox"
                  checked={resetToWaxing}
                  onChange={(e) => setResetToWaxing(e.target.checked)}
                  className="w-4 h-4 rounded accent-gold-600"
                />
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-serif text-ink-200">
                    标记后自动返回「修蜡中」
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ink-700/50">
            <button type="button" onClick={onClose} className="btn-ghost">
              取消
            </button>
            <button
              type="submit"
              className={cn(
                hasDefects
                  ? 'bg-gradient-to-br from-ruby-500 to-ruby-700 text-white hover:from-ruby-400 hover:to-ruby-600'
                  : '',
                'px-4 py-2 rounded-lg font-medium text-sm shadow-gold-sm transition-all duration-200 active:scale-[0.98]',
                !hasDefects && 'btn-primary',
              )}
              style={
                hasDefects
                  ? {
                      boxShadow:
                        '0 1px 2px 0 rgba(220,38,38,0.25), 0 0 0 1px rgba(220,38,38,0.3)',
                    }
                  : undefined
              }
            >
              {hasDefects ? '提交缺陷标记' : '清除缺陷标记'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
