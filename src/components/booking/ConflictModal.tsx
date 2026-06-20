import { useLightingStore } from '@/store/useLightingStore';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  CalendarClock,
  User,
  Clock,
  Lightbulb,
  ArrowRight,
  Shuffle,
} from 'lucide-react';
import type { CanvasDevice } from '@/types';
import { DEVICE_TYPE_COLORS, DEVICE_TYPE_LABELS } from '@/types';

export default function ConflictModal() {
  const show = useLightingStore((s) => s.showConflictModal);
  const conflicts = useLightingStore((s) => s.conflictDevices);
  const setup = useLightingStore((s) => s.currentSetup);
  const historySetups = useLightingStore((s) => s.historySetups);
  const pendingId = useLightingStore((s) => s.pendingDuplicateId);
  const confirmDuplicate = useLightingStore((s) => s.confirmDuplicate);
  const cancelDuplicate = useLightingStore((s) => s.cancelDuplicate);
  const dismiss = useLightingStore((s) => s.dismissConflictModal);

  if (!show) return null;

  const srcSetup = pendingId
    ? historySetups.find((s) => s.id === pendingId)
    : null;
  const pendingDevices: CanvasDevice[] = srcSetup?.devices ?? setup?.devices ?? [];
  const conflictModelNames = new Set(conflicts.map((c) => c.deviceModel));

  const safeDevices = pendingDevices.filter(
    (d) =>
      !conflictModelNames.has(d.model) &&
      !conflicts.some((c) => d.model.toLowerCase().includes(c.deviceName.toLowerCase()))
  );

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 bg-studio-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl studio-card border-alert-danger/50 shadow-2xl animate-shake animate-slide-down overflow-hidden"
        style={{
          boxShadow: '0 0 80px rgba(239, 68, 68, 0.18)',
        }}
      >
        <div
          className="relative px-6 py-5 border-b border-alert-danger/30"
          style={{
            background:
              'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(15, 23, 42, 0.95) 70%)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-alert-danger/15 border-2 border-alert-danger/50 flex items-center justify-center">
                  <AlertTriangle className="w-5.5 h-5.5 text-alert-danger" />
                </div>
                <span className="absolute inset-0 rounded-xl border border-alert-danger/40 animate-pulse-ring" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-studio-100 font-display">
                    设备预约冲突
                  </h3>
                  <span className="chip border-alert-danger/50 bg-alert-danger/15 text-alert-danger !py-0">
                    {conflicts.length} 件冲突
                  </span>
                </div>
                <p className="text-[12px] text-studio-400 leading-relaxed max-w-lg">
                  {srcSetup
                    ? `即将从「${srcSetup.name}」复制布光方案，但以下设备今日已有他人预约记录。`
                    : '以下设备今日已有他人预约记录。'}
                  请更换替代灯具或调整拍摄时段。
                </p>
                {srcSetup && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-studio-500">
                    <Lightbulb className="w-3 h-3" />
                    源方案包含 {pendingDevices.length} 件设备，其中 {conflicts.length} 件冲突、
                    {safeDevices.length} 件可用
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-md text-studio-400 hover:text-studio-200 hover:bg-studio-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[440px] overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-alert-danger" />
              <h4 className="text-sm font-semibold text-studio-200">
                存在冲突的设备
              </h4>
            </div>
            <div className="space-y-2">
              {conflicts.map((c, idx) => (
                <div
                  key={`${c.deviceId}-${idx}`}
                  className="relative p-3.5 rounded-xl border-alert-danger/30 bg-alert-dangerBg border-2"
                  style={{
                    boxShadow: 'inset 3px 0 0 0 #EF4444',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-alert-danger/15 border border-alert-danger/30 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4.5 h-4.5 text-alert-danger" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[13px] font-semibold text-studio-100">
                          {c.deviceName}
                        </h5>
                        <p className="text-[11px] font-mono text-studio-500 truncate">
                          {c.deviceModel}
                        </p>
                        {c.matchedDevice && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className="chip !py-0"
                              style={{
                                borderColor: `${
                                  DEVICE_TYPE_COLORS[c.matchedDevice.type]
                                }50`,
                                background: `${
                                  DEVICE_TYPE_COLORS[c.matchedDevice.type]
                                }14`,
                                color: DEVICE_TYPE_COLORS[c.matchedDevice.type],
                              }}
                            >
                              {DEVICE_TYPE_LABELS[c.matchedDevice.type]}
                            </span>
                            <span className="text-[10px] text-studio-500">
                              原方案: {c.matchedDevice.modifier || '标准罩'}
                              · {c.matchedDevice.power || '?'}% ·{' '}
                              {c.matchedDevice.distance || '?'}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-[11px] text-studio-400 justify-end">
                        <CalendarClock className="w-3 h-3" />
                        {c.date}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-alert-danger font-mono justify-end">
                        <Clock className="w-3 h-3" />
                        {c.startTime} – {c.endTime}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-studio-400 justify-end">
                        <User className="w-2.5 h-2.5" />
                        {c.bookedBy}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-alert-danger/20 flex items-center justify-between">
                    <span className="text-[10px] text-alert-danger/80 flex items-center gap-1">
                      <Shuffle className="w-3 h-3" />
                      建议：换同功率替代型号 / 改期至设备空闲时段
                    </span>
                    <ArrowRight className="w-4 h-4 text-studio-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {safeDevices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-studio-200">
                  今日可用设备（{safeDevices.length}）
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {safeDevices.map((d, i) => (
                  <span
                    key={`${d.id}-${i}`}
                    className="chip border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {d.model.slice(0, 22)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-studio-800 bg-studio-900/60 flex items-center gap-2.5">
          <button
            onClick={cancelDuplicate}
            className="flex-1 studio-btn-ghost"
          >
            <X className="w-4 h-4" />
            取消复制
          </button>
          <button
            onClick={confirmDuplicate}
            className="flex-[1.3] studio-btn-primary"
          >
            <Shuffle className="w-4 h-4" />
            仍然复制，稍后手动调整冲突灯具
          </button>
        </div>
      </div>
    </div>
  );
}
