import { useNavigate } from 'react-router-dom';
import { useCampStore, getRiskLevelLabel } from '@/store/campStore';
import type { RiskLevel } from '@/types';
import { Plus, Mountain, BarChart3, AlertTriangle, ChevronRight, Tent, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

type FilterType = 'all' | RiskLevel;

const REASON_FILTERS = ['强风', '涨水', '落石风险', '蚊虫多', '野狗出没', '夜间照明不足', '逃生路线不清', '天气多变', '无厕所', '无水源', '无手机信号', '禁火'] as const;
type ReasonFilter = (typeof REASON_FILTERS)[number];

const riskColors: Record<RiskLevel, { bg: string; border: string; text: string; badge: string; pulse: string }> = {
  high: {
    bg: 'bg-red-950/40',
    border: 'border-red-500/60',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
    pulse: 'animate-pulse',
  },
  medium: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    pulse: '',
  },
  low: {
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    pulse: '',
  },
};

const filterLabels: Record<FilterType, string> = {
  all: '全部',
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};

export default function Home() {
  const navigate = useNavigate();
  const { getSortedCamps, getHighRiskReasons } = useCampStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter | null>(null);

  const allCamps = getSortedCamps();

  const activeReasons = useMemo(() => {
    const set = new Set<string>();
    allCamps.forEach((camp) => {
      getHighRiskReasons(camp.id).forEach((r) => set.add(r));
    });
    return REASON_FILTERS.filter((r) => set.has(r));
  }, [allCamps, getHighRiskReasons]);

  const camps = allCamps.filter((camp) => {
    if (filter !== 'all' && getRiskLevelLabel(camp.overallRiskLevel) !== filter) return false;
    if (reasonFilter) {
      const reasons = getHighRiskReasons(camp.id);
      return reasons.includes(reasonFilter);
    }
    return true;
  });

  const isFiltering = filter !== 'all' || reasonFilter !== null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q45 20 30 35 Q15 20 30 5Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3Cpath d='M30 25 Q45 40 30 55 Q15 40 30 25Z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />

        <header className="relative border-b border-emerald-800/30">
          <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-700/50 flex items-center justify-center border border-emerald-600/30">
                <Mountain className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-emerald-100 tracking-wide">营地风险清单</h1>
                <p className="text-xs text-emerald-500">选营地，先看风险再看风景</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/stats')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-emerald-300 hover:bg-emerald-800/40 transition-colors border border-emerald-700/30"
              >
                <BarChart3 className="w-4 h-4" />
                统计
              </button>
              <button
                onClick={() => navigate('/camp/add')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-900/50"
              >
                <Plus className="w-4 h-4" />
                添加营地
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {(['all', 'high', 'medium', 'low'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setReasonFilter(null); }}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  filter === f && !reasonFilter
                    ? f === 'high'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : f === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : f === 'low'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-emerald-600 border border-transparent hover:bg-white/10'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>

          {activeReasons.length > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {activeReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReasonFilter(reasonFilter === r ? null : r)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                    reasonFilter === r
                      ? 'bg-amber-400/25 text-amber-200 border border-amber-400/50 shadow-sm shadow-amber-400/10'
                      : 'bg-white/5 text-emerald-600 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {camps.length === 0 ? (
            isFiltering ? (
              <div className="text-center py-20">
                <Search className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
                <p className="text-sm text-emerald-500">没有找到符合条件的营地</p>
              </div>
            ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-emerald-900/30 border border-emerald-800/30 flex items-center justify-center mx-auto mb-5">
                <Tent className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-lg font-medium text-emerald-300 mb-2">还没有营地</h2>
              <p className="text-sm text-emerald-600 mb-6">添加你的第一个营地，开始风险评估</p>
              <button
                onClick={() => navigate('/camp/add')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加营地
              </button>
            </div>
            )
          ) : (
            <div className="space-y-3 pb-8">
              {camps.map((camp, index) => {
                const level = getRiskLevelLabel(camp.overallRiskLevel);
                const colors = riskColors[level];
                const reasons = getHighRiskReasons(camp.id);
                const allReasons = [...new Set(reasons)];

                return (
                  <div
                    key={camp.id}
                    onClick={() => navigate(`/camp/${camp.id}`)}
                    className={`group relative rounded-xl border ${colors.border} ${colors.bg} p-4 cursor-pointer hover:scale-[1.01] transition-all duration-200`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{
                      backgroundColor: level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981',
                    }} />

                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-base font-semibold text-emerald-100 truncate">{camp.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.badge} ${level === 'high' ? colors.pulse : ''}`}>
                            {level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险'}
                          </span>
                        </div>

                        <p className="text-sm text-emerald-500 mb-2">{camp.location}</p>

                        {allReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {allReasons.slice(0, 4).map((item) => {
                              const isHit = reasonFilter === item;
                              return (
                                <span key={item} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all ${
                                  isHit
                                    ? 'bg-amber-400/30 text-amber-100 border border-amber-400/60 shadow-sm shadow-amber-400/20'
                                    : 'bg-red-500/15 text-red-300 border border-red-500/20'
                                }`}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {item}
                                </span>
                              );
                            })}
                            {allReasons.length > 4 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">
                                +{allReasons.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-emerald-600">
                          <span>海拔 {camp.altitude}m</span>
                          <span>停车 {camp.parkingDistance}m</span>
                          <span>{camp.fireAllowed ? '可生火' : '禁火'}</span>
                          <span>信号: {camp.phoneSignal === 'none' ? '无' : camp.phoneSignal === 'weak' ? '弱' : camp.phoneSignal === 'medium' ? '中' : '强'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${colors.text}`}>
                            {camp.overallRiskLevel.toFixed(1)}
                          </div>
                          <div className="text-xs text-emerald-600">风险分</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
