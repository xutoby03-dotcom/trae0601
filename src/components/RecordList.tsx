import React from 'react';
import { LightningRecord, RISK_CONFIG, CARDINAL_DIRECTIONS, LIGHTNING_TYPE_LABELS, BRIGHTNESS_LABELS, RAIN_INTENSITY_LABELS, OBSERVATION_POINTS } from '../types';

type RiskLevel = LightningRecord['riskLevel'];

interface FilterState {
  observationPoint: string;
  riskLevel: string;
}

const FILTER_STORAGE_KEY = 'lightning_observation_filter_v1';
const STAR_STORAGE_KEY = 'lightning_observation_stars_v1';

const loadFilter = (): FilterState => {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        observationPoint: typeof parsed.observationPoint === 'string' ? parsed.observationPoint : '',
        riskLevel: typeof parsed.riskLevel === 'string' ? parsed.riskLevel : '',
      };
    }
  } catch (_) {}
  return { observationPoint: '', riskLevel: '' };
};

const saveFilter = (filter: FilterState) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filter));
  } catch (_) {}
};

const loadStars = (): Set<string> => {
  try {
    const saved = localStorage.getItem(STAR_STORAGE_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (_) {}
  return new Set();
};

const saveStars = (stars: Set<string>) => {
  try {
    localStorage.setItem(STAR_STORAGE_KEY, JSON.stringify([...stars]));
  } catch (_) {}
};

const RISK_OPTIONS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'extreme', label: '极度危险', color: 'text-red-400' },
  { value: 'danger', label: '危险', color: 'text-orange-400' },
  { value: 'caution', label: '注意', color: 'text-yellow-400' },
  { value: 'safe', label: '安全', color: 'text-emerald-400' },
];

interface RecordListProps {
  records: LightningRecord[];
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onDelete, onDeleteMultiple }) => {
  const [filter, setFilter] = React.useState<FilterState>(loadFilter);
  const [starredIds, setStarredIds] = React.useState<Set<string>>(loadStars);

  React.useEffect(() => {
    saveFilter(filter);
  }, [filter]);

  React.useEffect(() => {
    saveStars(starredIds);
  }, [starredIds]);

  const updateFilter = (partial: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...partial }));
  };

  const clearFilter = () => {
    setFilter({ observationPoint: '', riskLevel: '' });
  };

  const toggleStar = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  React.useEffect(() => {
    setStarredIds(prev => {
      const existingIds = new Set(records.map(r => r.id));
      const cleaned = new Set([...prev].filter(id => existingIds.has(id)));
      if (cleaned.size !== prev.size) return cleaned;
      return prev;
    });
  }, [records]);

  const availablePoints = React.useMemo(() => {
    const pts = new Set(records.map(r => r.observationPoint));
    return OBSERVATION_POINTS.filter(p => pts.has(p));
  }, [records]);

  const availableRisks = React.useMemo(() => {
    const levels = new Set(records.map(r => r.riskLevel));
    return RISK_OPTIONS.filter(r => levels.has(r.value));
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    return records.filter(r => {
      if (filter.observationPoint && r.observationPoint !== filter.observationPoint) return false;
      if (filter.riskLevel && r.riskLevel !== filter.riskLevel) return false;
      return true;
    });
  }, [records, filter]);

  const sorted = [...filteredRecords].sort((a, b) => {
    const aStarred = starredIds.has(a.id);
    const bStarred = starredIds.has(b.id);
    if (aStarred !== bStarred) return aStarred ? -1 : 1;
    return b.timestamp - a.timestamp;
  });

  const starredCount = filteredRecords.filter(r => starredIds.has(r.id)).length;

  const hasActiveFilter = filter.observationPoint !== '' || filter.riskLevel !== '';

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  const handleClearFiltered = () => {
    if (filteredRecords.length === 0) return;
    const msg = hasActiveFilter
      ? `确定要清空当前筛选出的 ${filteredRecords.length} 条记录吗？其他记录将保留。`
      : '确定要清空所有观测记录吗？此操作无法撤销。';
    if (window.confirm(msg)) {
      onDeleteMultiple(filteredRecords.map(r => r.id));
    }
  };

  if (records.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          观测记录
          <span className="text-sm font-normal text-slate-500">(0)</span>
        </h2>
        <div className="bg-slate-900/60 rounded-xl p-10 text-center border border-dashed border-slate-700">
          <div className="text-6xl mb-4 opacity-50">🌩️</div>
          <div className="text-slate-400 text-lg font-medium">暂无观测记录</div>
          <div className="text-slate-500 text-sm mt-2">
            观测到闪电后，填写上方表单并点击 "记录这次闪电"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          观测记录
          <span className="badge bg-storm-500/20 text-storm-300 border border-storm-500/30">
            {hasActiveFilter
              ? `${filteredRecords.length} / ${records.length} 条`
              : `${records.length} 条`
            }
          </span>
          {starredCount > 0 && (
            <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              ⭐ {starredCount} 置顶
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              onClick={clearFilter}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10"
            >
              ✕ 清除筛选
            </button>
          )}
          <button
            onClick={handleClearFiltered}
            disabled={filteredRecords.length === 0}
            className={`text-sm transition-colors px-3 py-1.5 rounded-lg ${
              filteredRecords.length === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            🗑️ {hasActiveFilter ? '清空筛选结果' : '清空全部'}
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/40 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>🔍</span>
          <span className="font-medium">筛选条件</span>
          {hasActiveFilter && (
            <span className="ml-auto text-blue-400">
              已筛选 {filteredRecords.length} / {records.length} 条
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px]">
            <select
              className="form-select text-sm py-2"
              value={filter.observationPoint}
              onChange={(e) => updateFilter({ observationPoint: e.target.value })}
            >
              <option value="">全部观测点</option>
              {availablePoints.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <select
              className="form-select text-sm py-2"
              value={filter.riskLevel}
              onChange={(e) => updateFilter({ riskLevel: e.target.value })}
            >
              <option value="">全部风险等级</option>
              {availableRisks.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900/60 rounded-xl p-8 text-center border border-dashed border-slate-700">
          <div className="text-4xl mb-3 opacity-50">🔍</div>
          <div className="text-slate-400 font-medium">当前筛选条件下无匹配记录</div>
          <div className="text-slate-500 text-sm mt-1">
            共 {records.length} 条记录被筛选条件过滤
          </div>
          <button
            onClick={clearFilter}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {sorted.map((record, idx) => {
            const risk = RISK_CONFIG[record.riskLevel];
            const azimuthIdx = Math.round(record.lightningAzimuth / 22.5) % 16;
            const dir = CARDINAL_DIRECTIONS[azimuthIdx];
            const isRecent = (Date.now() - record.timestamp) < 60000;
            const isStarred = starredIds.has(record.id);

            return (
              <div
                key={record.id}
                className={`bg-slate-900/50 rounded-xl p-4 border transition-all hover:bg-slate-900/70 ${
                  isStarred
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : isRecent
                    ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                    : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-lg font-bold text-slate-300">#{filteredRecords.length - idx}</span>
                      {isStarred && (
                        <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          置顶
                        </span>
                      )}
                      <span className={`badge ${risk.bgColor} ${risk.color} border`}>
                        {risk.label}
                      </span>
                      <span className="badge bg-slate-700/50 text-slate-400 border border-slate-600/50">
                        {LIGHTNING_TYPE_LABELS[record.lightningType]}
                      </span>
                      {isRecent && (
                        <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse">
                          ⚡ 刚刚
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs">时间</div>
                        <div className="text-slate-200 font-medium">
                          {formatTime(record.timestamp)}
                          <span className="text-xs text-slate-500 ml-1">{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">方位 / 距离</div>
                        <div className="text-slate-200 font-medium">
                          <span className="text-yellow-400">{dir.code}</span>
                          <span className="text-slate-500 mx-1">·</span>
                          <span className="text-storm-400">{record.estimatedDistanceKm}km</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">亮度 / 延迟</div>
                        <div className="text-slate-200 font-medium">
                          <span className="text-orange-400">{BRIGHTNESS_LABELS[record.brightness].label}</span>
                          <span className="text-slate-500 mx-1">·</span>
                          <span className="text-blue-400">{record.thunderDelaySeconds}s</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">观测点 / 降雨</div>
                        <div className="text-slate-200 font-medium truncate">
                          <span>{record.observationPoint}</span>
                          <span className="ml-1">{RAIN_INTENSITY_LABELS[record.rainIntensity].icon}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleStar(record.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isStarred
                          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                          : 'text-slate-600 hover:text-yellow-400 hover:bg-yellow-500/10'
                      }`}
                      title={isStarred ? '取消置顶' : '置顶标记'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill={isStarred ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="删除记录"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecordList;
