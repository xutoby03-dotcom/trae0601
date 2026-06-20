import { useMemo, useState } from 'react';
import {
  BookOpen, TrendingUp, Clock, Target, Award, AlertTriangle,
  Eye, EyeOff, ChevronRight, X, Trash2, Calendar, RotateCcw
} from 'lucide-react';
import { useAstroStore } from '@/store/useAstroStore';
import { DEEP_SKY_TARGETS } from '@/data/constellations';
import { formatDateChinese } from '@/utils/astro';
import type { DeepSkyTarget, ObservationRecord } from '@/types';

function getTargetById(id: string): DeepSkyTarget | undefined {
  return DEEP_SKY_TARGETS.find(t => t.id === id);
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass-card p-5 relative overflow-hidden">
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${color} blur-2xl opacity-30`} />
      <div className={`w-11 h-11 rounded-xl ${color} bg-opacity-15 flex items-center justify-center mb-3 relative`}>
        <Icon className="w-5 h-5" style={{ color: color.replace('bg-', '').includes('aurora') ? '#10b981' : color.replace('bg-', '').includes('moonlight') ? '#fbbf24' : '#4f46e5' }} />
      </div>
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-white font-display">{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  );
}

function RecordDetailModal({ record, onClose }: { record: ObservationRecord; onClose: () => void }) {
  const target = getTargetById(record.targetId);
  const editUrl = `#/record/${record.date}?targetId=${record.targetId}`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 bg-space-900/80 backdrop-blur">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{record.targetName}</h3>
            {target?.commonName && <p className="text-sm text-white/50">{target.commonName}</p>}
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> {formatDateChinese(record.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-xl p-3 text-center border
              ${record.seen
                ? 'bg-aurora-green/10 border-aurora-green/20'
                : 'bg-red-500/10 border-red-500/20'}`}>
              {record.seen ? (
                <>
                  <Eye className="w-5 h-5 text-aurora-green mx-auto mb-1" />
                  <p className="text-xs font-semibold text-aurora-green">成功观测</p>
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-red-400">未观测到</p>
                </>
              )}
            </div>
            <div className="rounded-xl p-3 text-center bg-white/[0.03] border border-white/5">
              <p className="text-lg font-bold text-moonlight">{record.seeing}/5</p>
              <p className="text-[11px] text-white/40">视宁度</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-white/[0.03] border border-white/5">
              <p className="text-lg font-bold text-white">{record.frames || '-'}</p>
              <p className="text-[11px] text-white/40">总张数</p>
            </div>
          </div>

          {!record.seen && record.failReason && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-400 mb-1">失败原因</p>
                <p className="text-sm text-red-400/80">{record.failReasonLabel}</p>
              </div>
            </div>
          )}

          {record.seen && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">📷 曝光参数</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { k: 'ISO', v: record.iso },
                  { k: '光圈', v: record.aperture },
                  { k: '快门', v: record.shutter },
                  { k: '张数', v: record.frames ? `${record.frames}张` : '' },
                ].map(r => r.v && (
                  <div key={r.k} className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-white/40">{r.k}</p>
                    <p className="text-sm text-white/85 font-medium">{r.v}</p>
                  </div>
                ))}
              </div>
              {(record.darkFrames || record.flatFrames || record.biasFrames) && (
                <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-2">
                  {record.darkFrames && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40">暗场</p>
                      <p className="text-xs text-white/70">{record.darkFrames}</p>
                    </div>
                  )}
                  {record.flatFrames && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40">平场</p>
                      <p className="text-xs text-white/70">{record.flatFrames}</p>
                    </div>
                  )}
                  {record.biasFrames && (
                    <div className="p-2 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40">偏置</p>
                      <p className="text-xs text-white/70">{record.biasFrames}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(record.software || record.totalExposure || record.stackNotes) && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">🖼️ 后期叠加</h4>
              <div className="grid grid-cols-2 gap-2">
                {record.software && (
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-white/40">处理软件</p>
                    <p className="text-xs text-white/70">{record.software}</p>
                  </div>
                )}
                {record.totalExposure && (
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-white/40">累计曝光</p>
                    <p className="text-xs text-white/70">{record.totalExposure}</p>
                  </div>
                )}
              </div>
              {record.stackNotes && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-white/40 mb-1">处理备注</p>
                  <p className="text-sm text-white/70 leading-relaxed">{record.stackNotes}</p>
                </div>
              )}
            </div>
          )}

          {record.notes && (
            <div className="rounded-xl bg-moonlight/[0.04] border border-moonlight/15 p-4">
              <h4 className="text-sm font-semibold text-moonlight mb-2 flex items-center gap-2">💡 心得备注</h4>
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{record.notes}</p>
            </div>
          )}

          {target && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-[11px] text-white/40 mb-2">目标参考信息</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip bg-white/5 border-white/10 text-[11px] text-white/60">{target.typeLabel}</span>
                <span className="chip bg-white/5 border-white/10 text-[11px] text-white/60">星等 {target.magnitude}</span>
                <span className="chip bg-white/5 border-white/10 text-[11px] text-white/60">{target.size}</span>
                <span className="chip bg-white/5 border-white/10 text-[11px] text-white/60">{target.distance}</span>
                <span className="chip bg-white/5 border-white/10 text-[11px] text-white/60">📍 {target.constellation}</span>
              </div>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">{target.description}</p>
              <p className="text-[11px] text-nebula-purple/80 mt-1">💡 建议参数：{target.exposureSuggestion}</p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <a
              href={editUrl}
              onClick={(e) => { e.preventDefault(); onClose(); window.location.hash = editUrl; }}
              className="btn-primary w-full justify-center"
            >
              ✏️ 去修改这条记录
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const records = useAstroStore(s => s.records);
  const deleteRecord = useAstroStore(s => s.deleteRecord);
  const stats = useAstroStore(s => s.getStatistics());

  const [selected, setSelected] = useState<ObservationRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'fail'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sessions = useMemo(() => {
    const map = new Map<string, ObservationRecord[]>();
    records.forEach(r => {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [records]);

  const filtered = sessions
    .filter(([date]) => !selectedDate || date === selectedDate)
    .map(([date, list]) => [
      date,
      list.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'success') return r.seen;
        return !r.seen;
      }),
    ] as const)
    .filter(([, list]) => list.length > 0);

  const hasDateFilter = selectedDate !== null;
  const dateFilterHasRecords = hasDateFilter && filtered.length > 0;
  const dateFilterNoRecords = hasDateFilter && filtered.length === 0;

  const exposureStr = stats.totalExposureMinutes >= 60
    ? `${Math.floor(stats.totalExposureMinutes / 60)}h ${stats.totalExposureMinutes % 60}m`
    : `${stats.totalExposureMinutes} 分钟`;

  return (
    <div className="space-y-8">
      <section>
        <div className="inline-flex items-center gap-2 chip bg-nebula-cyan/15 border border-nebula-cyan/30 text-nebula-cyan mb-3 px-3 py-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-medium">经验档案</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
          <span className="text-gradient">历史复盘</span>
        </h1>
        <p className="text-white/50 text-base">
          共 {stats.totalSessions} 次观测 · {stats.totalTargets} 个目标 · 累计曝光 {exposureStr}
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="总观测次数"
          value={stats.totalSessions}
          sub={`${stats.totalTargets} 个目标记录`}
          color="bg-nebula-purple"
        />
        <StatCard
          icon={Award}
          label="成功率"
          value={`${stats.successRate}%`}
          sub={`${stats.successCount}/${stats.totalTargets} 成功`}
          color="bg-aurora-green"
        />
        <StatCard
          icon={Clock}
          label="累计曝光"
          value={exposureStr}
          sub="所有目标合计"
          color="bg-nebula-blue"
        />
        <StatCard
          icon={TrendingUp}
          label="坚持观测"
          value={stats.totalTargets >= 10 ? '大佬' : stats.totalTargets >= 5 ? '进阶' : '新手'}
          sub={stats.totalTargets >= 10 ? '继续保持 ✨' : '多多出摊吧！'}
          color="bg-moonlight"
        />
      </section>

      {Object.keys(stats.typeBreakdown).length > 0 && (
        <section className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">目标类型分布</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.typeBreakdown).map(([k, v]) => {
              const pct = Math.round((v / stats.totalTargets) * 100);
              return (
                <div key={k} className="flex-1 min-w-[140px] rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80 font-medium">{k}</span>
                    <span className="text-xs text-white/40">{v} 次</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-nebula-purple to-nebula-cyan rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
            📅 观测历史
            <span className="chip bg-white/5 border-white/10 text-white/50 !text-[11px]">
              {sessions.length} 个夜晚
            </span>
          </h2>
          <div className="flex gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            {(['all', 'success', 'fail'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${filter === f
                    ? 'bg-nebula-purple/30 text-white border border-nebula-purple/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                {f === 'all' ? '全部' : f === 'success' ? '成功' : '失败'}
              </button>
            ))}
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="glass-card p-4 mb-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-xs text-white/50 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 按日期筛选：点击查看那晚的记录
              </p>
              {hasDateFilter && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]
                    bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <RotateCcw className="w-3 h-3" /> 清空筛选
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sessions.map(([date, list]) => {
                const successNum = list.filter(r => r.seen).length;
                const isActive = selectedDate === date;
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(isActive ? null : date)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2
                      ${isActive
                        ? 'bg-gradient-to-r from-nebula-purple/40 to-nebula-cyan/30 text-white border border-nebula-cyan/40 shadow-lg shadow-nebula-purple/20'
                        : 'bg-white/[0.03] border border-white/5 text-white/70 hover:text-white hover:bg-white/[0.06]'}`}
                  >
                    <span className="font-mono text-sm">{date.slice(5)}</span>
                    <span className="text-[10px] opacity-70">
                      {successNum}/{list.length} ✓
                    </span>
                  </button>
                );
              })}
            </div>
            {hasDateFilter && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[11px] text-white/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula-cyan animate-pulse" />
                  当前筛选：<span className="text-white/70 font-medium">{formatDateChinese(selectedDate!)}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {dateFilterNoRecords ? (
          <div className="glass-card p-12 text-center border-dashed border-2 border-moonlight/30">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-moonlight/5 flex items-center justify-center text-5xl">
              🌙
            </div>
            <p className="text-white/70 text-lg mb-1 font-display">
              {formatDateChinese(selectedDate!)} 还没记录
            </p>
            <p className="text-xs text-white/40 mb-5 max-w-md mx-auto leading-relaxed">
              那晚可能还没来得及填观测记录，或者状态被筛选过滤了。
              <br />试试切换筛选条件，或清空日期筛选看看全部记录～
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFilter('all')}
                className="btn-secondary"
              >
                显示全部状态
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="btn-primary"
              >
                <RotateCcw className="w-4 h-4" /> 清空筛选
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-white/5 flex items-center justify-center text-6xl">
              🌌
            </div>
            <p className="text-white/70 text-lg mb-2 font-display">还没有观测记录</p>
            <p className="text-xs text-white/40 mb-6 max-w-md mx-auto leading-relaxed">
              每次结束观测后，记得回到「观测记录」补充目标情况。
              <br />长期记录可以帮你找到最适合的参数和目标哦！
            </p>
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
              className="btn-primary"
            >
              去规划下一次观测 <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map(([date, list]) => {
              const seen = list.filter(r => r.seen).length;
              const total = list.length;
              return (
                <div key={date} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-cyan flex items-center justify-center text-sm font-bold shadow-lg shadow-nebula-purple/30 flex-shrink-0 z-10">
                        {date.slice(8)}
                      </div>
                      <div className="w-px flex-1 bg-gradient-to-b from-nebula-purple/40 to-transparent mt-2" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
                        <div>
                          <p className="font-display text-lg font-bold text-white">
                            {formatDateChinese(date)}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="chip chip-easy text-[11px]">{seen} 成功</span>
                          {total - seen > 0 && (
                            <span className="chip chip-hard text-[11px]">{total - seen} 失败</span>
                          )}
                          <span className="chip bg-white/5 border-white/10 text-[11px] text-white/50">
                            {total} 目标
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {list.map(r => {
                          const target = getTargetById(r.targetId);
                          return (
                            <button
                              key={r.id}
                              onClick={() => setSelected(r)}
                              className={`glass-card-hover w-full p-4 text-left flex items-center gap-4 group
                                ${!r.seen ? 'border-red-500/15' : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                ${r.seen ? 'bg-aurora-green/15 text-aurora-green' : 'bg-red-500/15 text-red-400'}`}>
                                {r.seen ? (
                                  <Eye className="w-5 h-5" />
                                ) : (
                                  <EyeOff className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-semibold text-white truncate">
                                    {r.targetName}
                                    {target?.commonName && (
                                      <span className="text-white/50 font-normal"> · {target.commonName}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-white/50 flex-wrap">
                                  {r.seen ? (
                                    <>
                                      {r.iso && <span>ISO {r.iso}</span>}
                                      {r.shutter && <span>{r.shutter}</span>}
                                      {r.aperture && <span>{r.aperture}</span>}
                                      {r.frames > 0 && <span>{r.frames} 张</span>}
                                      {r.seeing > 0 && <span>视宁 {r.seeing}/5</span>}
                                    </>
                                  ) : (
                                    r.failReasonLabel && (
                                      <span className="text-red-400/80 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> {r.failReasonLabel}
                                      </span>
                                    )
                                  )}
                                  {r.software && <span>🖼️ {r.software}</span>}
                                  {r.totalExposure && <span className="text-nebula-cyan/80">⏱️ {r.totalExposure}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`确认删除「${r.targetName}」的记录吗？`)) {
                                      deleteRecord(r.id);
                                    }
                                  }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <RecordDetailModal record={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
