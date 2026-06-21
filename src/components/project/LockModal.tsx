import { useState, useEffect } from 'react';
import { X, AlertTriangle, Lock, Check } from 'lucide-react';
import type { LicenseType } from '@/types';
import { useUIStore, type Recording } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface LockModalProps {
  recordingId?: string;
  recordingIds?: string[];
  onClose?: () => void;
}

export default function LockModal({ recordingId, recordingIds: propIds, onClose }: LockModalProps) {
  const isOpen = useUIStore((s) => s.isLockModalOpen);
  const closeFn = useUIStore((s) => s.closeLockModal);
  const projects = useUIStore((s) => s.projects);
  const recordings = useUIStore((s) => s.recordings);
  const modalIds = useUIStore((s) => s.lockModalRecordingIds);
  const toggleRecordingLock = useUIStore((s) => s.toggleRecordingLock);
  const targetIds = propIds ?? (recordingId ? [recordingId] : modalIds);
  const targetRecordings = recordings.filter((r) => targetIds.includes(r.id));

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [licenseType, setLicenseType] = useState<LicenseType>('non_exclusive');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState(true);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedProjectId(projects[0]?.id ?? '');
      setLicenseType('non_exclusive');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setIsPermanent(true);
      setNotes('');
    }
  }, [isOpen, projects]);

  const handleClose = () => {
    closeFn?.();
    onClose?.();
  };

  const handleConfirm = () => {
    targetRecordings.forEach((r) => {
      if (!r.isLocked) {
        toggleRecordingLock(r.id);
      }
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in" onClick={handleClose} />

      <div className="relative w-full max-w-[520px] rounded-2xl bg-slate-panel border border-forest-700/60 shadow-2xl shadow-black/60 overflow-hidden animate-bounce-in">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-moss-400 via-amber-400 to-amber-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-forest-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-cream">锁定并授权素材</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                已选择 <span className="text-amber-400 font-mono">{targetRecordings.length}</span> 条录音素材
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-forest-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {step === 'form' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  授权给项目 <span className="text-rust-500">*</span>
                </label>
                <div className="space-y-2">
                  {projects.map((p) => {
                    const gradientClass =
                      p.status === 'active'
                        ? 'bg-gradient-to-br from-emerald-600 to-forest-700'
                        : p.status === 'completed'
                          ? 'bg-gradient-to-br from-amber-600 to-orange-700'
                          : 'bg-gradient-to-br from-sky-600 to-indigo-700';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProjectId(p.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                          selectedProjectId === p.id
                            ? 'border-amber-500/60 bg-amber-500/10'
                            : 'border-forest-700/50 bg-forest-900/40 hover:border-forest-600'
                        )}
                      >
                        <div className={cn('w-10 h-10 rounded-lg flex-shrink-0', gradientClass)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-cream truncate">{p.name}</p>
                          {p.clientName && (
                            <p className="text-xs text-slate-400 truncate">{p.clientName}</p>
                          )}
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                            selectedProjectId === p.id
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-slate-500/60'
                          )}
                        >
                          {selectedProjectId === p.id && (
                            <Check className="w-3 h-3 text-forest-950" strokeWidth={3.5} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">授权类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLicenseType('non_exclusive')}
                    className={cn(
                      'p-4 rounded-xl border transition-all text-left',
                      licenseType === 'non_exclusive'
                        ? 'border-moss-400/60 bg-moss-400/10'
                        : 'border-forest-700/50 bg-forest-900/40 hover:border-forest-600'
                    )}
                  >
                    <div className="text-lg mb-1">🌿</div>
                    <p className="font-medium text-sm text-moss-400">非独家授权</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      可同时授权给多个项目，风险较低
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLicenseType('exclusive')}
                    className={cn(
                      'p-4 rounded-xl border transition-all text-left',
                      licenseType === 'exclusive'
                        ? 'border-amber-500/60 bg-amber-500/10'
                        : 'border-forest-700/50 bg-forest-900/40 hover:border-forest-600'
                    )}
                  >
                    <div className="text-lg mb-1">👑</div>
                    <p className="font-medium text-sm text-amber-400">独家授权</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      仅限本项目使用，授权费更高
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-200">授权期限</label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPermanent}
                      onChange={(e) => setIsPermanent(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    永久授权
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">起始日期</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-forest-900/60 border border-forest-700/60 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      截止日期 {isPermanent && <span className="text-slate-500">（永久已启用）</span>}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isPermanent}
                      className="w-full px-3 py-2 rounded-lg bg-forest-900/60 border border-forest-700/60 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">备注（可选）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="例如：用于纪录片第3集开场、游戏背景循环、限制使用场景..."
                  className="w-full px-3 py-2 rounded-lg bg-forest-900/60 border border-forest-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-amber-400" strokeWidth={2} />
              </div>
              <h3 className="font-display text-xl text-cream mb-2">确认锁定素材？</h3>
              <p className="text-sm text-slate-400 mb-4">
                将锁定 <span className="text-amber-400 font-mono">{targetRecordings.length}</span> 条素材到
                <span className="text-cream">
                  「{projects.find((p) => p.id === selectedProjectId)?.name}」
                </span>
              </p>
              <div className="p-4 rounded-xl bg-forest-900/60 border border-forest-700/60 text-left text-xs space-y-2 max-h-40 overflow-y-auto">
                <div className="flex justify-between text-slate-400">
                  <span>授权类型</span>
                  <span className={licenseType === 'exclusive' ? 'text-amber-400' : 'text-moss-400'}>
                    {licenseType === 'exclusive' ? '👑 独家' : '🌿 非独家'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>期限</span>
                  <span className="text-slate-200">
                    {isPermanent ? '永久' : `${startDate} 至 ${endDate || '未设'}`}
                  </span>
                </div>
                {notes && (
                  <div className="pt-2 border-t border-forest-700/50">
                    <p className="text-slate-400 mb-1">备注</p>
                    <p className="text-slate-200">{notes}</p>
                  </div>
                )}
              </div>

              {targetRecordings.some((r) => r.isLocked) && (
                <div className="mt-4 p-3 rounded-xl bg-rust-500/10 border border-rust-500/40 text-left">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-rust-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-rust-400 font-medium">⚠️ 部分素材已处于锁定状态</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {targetRecordings.filter((r) => r.isLocked).length} 条素材将切换为未锁定状态
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-forest-800/60 bg-forest-950/50">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-forest-700/60 text-slate-300 hover:bg-forest-800/60 transition-all text-sm font-medium"
          >
            取消
          </button>
          {step === 'form' ? (
            <button
              onClick={() => setStep('confirm')}
              disabled={!selectedProjectId}
              className={cn(
                'flex-1 py-2.5 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2',
                selectedProjectId
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-forest-700/50 text-slate-400 cursor-not-allowed'
              )}
            >
              继续下一步
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" strokeWidth={2.2} />
              确认锁定
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
