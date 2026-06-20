import { useLightingStore } from '@/store/useLightingStore';
import {
  History,
  X,
  Search,
  CopyPlus,
  Upload,
  CalendarDays,
  User,
  Tag,
  Sparkles,
} from 'lucide-react';
import { formatDateTime } from '@/utils/common';
import { useMemo, useState } from 'react';
import type { DeviceType } from '@/types';
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_COLORS } from '@/types';

const ICON_EMOJI: Record<DeviceType, string> = {
  main_light: '🔴',
  fill_light: '🔵',
  rim_light: '🟣',
  reflector: '🟡',
  background: '🟢',
};

export default function HistoryPanel() {
  const showHistoryPanel = useLightingStore((s) => s.showHistoryPanel);
  const toggleHistoryPanel = useLightingStore((s) => s.toggleHistoryPanel);
  const historySetups = useLightingStore((s) => s.historySetups);
  const loadSetup = useLightingStore((s) => s.loadSetup);
  const duplicateSetup = useLightingStore((s) => s.duplicateSetup);
  const currentSetupId = useLightingStore((s) => s.currentSetup?.id);

  const [q, setQ] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    historySetups.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [historySetups]);

  const filtered = useMemo(() => {
    let list = historySetups;
    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.client.toLowerCase().includes(lower) ||
          s.author.toLowerCase().includes(lower)
      );
    }
    if (tagFilter) {
      list = list.filter((s) => s.tags.includes(tagFilter));
    }
    return list;
  }, [historySetups, q, tagFilter]);

  return (
    <>
      {showHistoryPanel && (
        <div
          onClick={toggleHistoryPanel}
          className="fixed inset-0 bg-studio-950/60 backdrop-blur-sm z-30 animate-slide-down"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] z-40 bg-studio-900/95 backdrop-blur-xl
                   border-l border-studio-800 flex flex-col shadow-2xl transition-transform duration-300 ease-out
                   ${showHistoryPanel ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-glow/15 border border-amber-glow/30 flex items-center justify-center">
              <History className="w-4 h-4 text-amber-glow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-studio-100 font-display">
                历史布光方案
              </h3>
              <p className="text-[10px] text-studio-500">
                共 {historySetups.length} 套归档方案
              </p>
            </div>
          </div>
          <button
            onClick={toggleHistoryPanel}
            className="p-2 rounded-lg text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-studio-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-studio-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索方案名、客户、摄影师..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-studio-800/60 border border-studio-700/60
                       text-[12px] text-studio-200 outline-none placeholder-studio-500
                       focus:border-amber-glow/60 focus:ring-1 focus:ring-amber-glow/20"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTagFilter(null)}
                className={`chip text-[10px] transition-colors
                           ${
                             tagFilter === null
                               ? 'border-amber-glow/50 bg-amber-glow/10 text-amber-glow'
                               : 'border-studio-700 text-studio-400 hover:border-studio-600'
                           }`}
              >
                全部
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t === tagFilter ? null : t)}
                  className={`chip text-[10px] transition-colors
                             ${
                               tagFilter === t
                                 ? 'border-amber-glow/50 bg-amber-glow/10 text-amber-glow'
                                 : 'border-studio-700 text-studio-400 hover:border-studio-600'
                             }`}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-studio-800/60 border border-studio-700 flex items-center justify-center">
                <Search className="w-7 h-7 text-studio-600" />
              </div>
              <p className="text-[12px] text-studio-400">没有匹配的方案</p>
            </div>
          ) : (
            filtered.map((s) => {
              const isCurrent = s.id === currentSetupId;
              const types = new Set(s.devices.map((d) => d.type));
              return (
                <div
                  key={s.id}
                  className={`group relative rounded-xl border overflow-hidden transition-all
                             ${
                               isCurrent
                                 ? 'border-amber-glow/60 bg-amber-glow/5'
                                 : 'border-studio-800 bg-studio-850/60 hover:border-studio-700 hover:bg-studio-800/70'
                             }`}
                >
                  {isCurrent && (
                    <div className="absolute top-2 right-2 chip bg-amber-glow text-studio-950 !border-0 z-10">
                      <Sparkles className="w-2.5 h-2.5" />
                      当前方案
                    </div>
                  )}
                  <div className="flex h-28">
                    <div className="w-40 shrink-0 relative overflow-hidden bg-studio-900">
                      <img
                        src={s.finalImage}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-studio-900/40" />
                    </div>
                    <div className="flex-1 p-3 flex flex-col min-w-0">
                      <h4
                        className="text-sm font-semibold text-studio-100 truncate group-hover:text-amber-glow transition-colors"
                        title={s.name}
                      >
                        {s.name}
                      </h4>
                      <p className="text-[11px] text-studio-500 mt-0.5 truncate">
                        {s.client || '未指定客户'}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-studio-500">
                        <span className="flex items-center gap-0.5">
                          <CalendarDays className="w-2.5 h-2.5" />
                          {s.shootDate}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <User className="w-2.5 h-2.5" />
                          {s.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {Array.from(types).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: `${DEVICE_TYPE_COLORS[t as DeviceType]}18`,
                              color: DEVICE_TYPE_COLORS[t as DeviceType],
                              border: `1px solid ${DEVICE_TYPE_COLORS[t as DeviceType]}40`,
                            }}
                            title={DEVICE_TYPE_LABELS[t as DeviceType]}
                          >
                            {ICON_EMOJI[t as DeviceType]}{' '}
                            {DEVICE_TYPE_LABELS[t as DeviceType]}
                          </span>
                        ))}
                        {s.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="chip !py-0 border-studio-700 text-studio-400 bg-studio-800/60"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] text-studio-500">
                        <CalendarDays className="w-2.5 h-2.5" />
                        更新于 {formatDateTime(s.updatedAt).slice(5)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-stretch border-t border-studio-800/80 bg-studio-900/60">
                    <button
                      onClick={() => loadSetup(s.id)}
                      className="flex-1 px-3 py-2 text-[11px] font-semibold text-studio-300
                                 hover:text-amber-glow hover:bg-amber-glow/10 transition-colors flex items-center justify-center gap-1.5
                                 border-r border-studio-800/60"
                    >
                      <Upload className="w-3 h-3" />
                      加载覆盖
                    </button>
                    <button
                      onClick={() => duplicateSetup(s.id)}
                      className="flex-1 px-3 py-2 text-[11px] font-semibold text-studio-300
                                 hover:text-amber-glow hover:bg-amber-glow/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CopyPlus className="w-3 h-3" />
                      复制复用
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-studio-800 bg-studio-950/60">
          <p className="text-[10px] text-studio-500 leading-relaxed">
            💡 提示：复制历史方案时，系统会自动检测当天的设备预约情况，
            <span className="text-amber-glow font-semibold">冲突灯具将弹窗提醒</span>
          </p>
        </div>
      </aside>
    </>
  );
}
