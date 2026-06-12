import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Fish, Cog, Droplets, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import type { ObservationStatus } from '@/types';
import { cn } from '@/lib/utils';
import ObservationForm from './ObservationForm';

const statusConfig: Record<ObservationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待处理', color: 'text-rose-600', bg: 'bg-rose-100' },
  recovering: { label: '恢复中', color: 'text-amber-600', bg: 'bg-amber-100' },
  resolved: { label: '已恢复', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const targetTypeIcon = {
  fish: <Fish size={14} />,
  equipment: <Cog size={14} />,
  water: <Droplets size={14} />,
};

const typeColorMap: Record<string, string> = {
  white_spot: 'bg-rose-50 border-rose-200',
  bottom_sitting: 'bg-amber-50 border-amber-200',
  filter_noise: 'bg-purple-50 border-purple-200',
  appetite_loss: 'bg-orange-50 border-orange-200',
  fin_rot: 'bg-red-50 border-red-200',
  other: 'bg-gray-50 border-gray-200',
};

export default function ObservationList() {
  const { observations, updateObservationStatus, fishes } = useFishTankStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterKey, setFilterKey] = useState<string>('all');

  const filterOptions = useMemo(() => {
    const targets = new Map<string, { label: string; icon: React.ReactNode }>();
    observations.forEach((obs) => {
      if (!targets.has(obs.targetName)) {
        targets.set(obs.targetName, {
          label: obs.targetName,
          icon: targetTypeIcon[obs.targetType],
        });
      }
    });
    return Array.from(targets.entries()).map(([key, val]) => ({ key, ...val }));
  }, [observations]);

  const filteredObservations = useMemo(() => {
    if (filterKey === 'all') return observations;
    return observations.filter((obs) => obs.targetName === filterKey);
  }, [observations, filterKey]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const nextStatus = (current: ObservationStatus): ObservationStatus => {
    if (current === 'pending') return 'recovering';
    if (current === 'recovering') return 'resolved';
    return 'pending';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">异常观察</h3>
            <p className="text-sm text-gray-500">
              {observations.filter((o) => o.status !== 'resolved').length} 条待处理
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
            showForm
              ? 'bg-gray-100 text-gray-600'
              : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg'
          )}
        >
          <Plus size={16} />
          {showForm ? '收起' : '新增观察'}
        </button>
      </div>

      {filterOptions.length > 0 && (
        <div className="px-6 pt-4 pb-2 border-b border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">按对象筛选</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterKey('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                filterKey === 'all'
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              全部 ({observations.length})
            </button>
            {filterOptions.map((opt) => {
              const count = observations.filter((o) => o.targetName === opt.key).length;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFilterKey(opt.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    filterKey === opt.key
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="p-6 bg-amber-50/50 border-b border-amber-100">
          <ObservationForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="p-6 max-h-[450px] overflow-y-auto space-y-3">
        {filteredObservations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
            <p>{filterKey === 'all' ? '暂无异常观察记录' : '该对象暂无异常记录'}</p>
          </div>
        )}

        {filteredObservations.map((obs) => (
          <div
            key={obs.id}
            className={cn(
              'rounded-xl border transition-all overflow-hidden',
              typeColorMap[obs.type] || 'bg-gray-50 border-gray-200'
            )}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === obs.id ? null : obs.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-white/60 rounded text-xs font-medium text-gray-700">
                      {obs.typeLabel}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[obs.status].bg,
                      statusConfig[obs.status].color
                    )}>
                      {statusConfig[obs.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-1">{obs.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      📅 {formatDate(obs.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      {targetTypeIcon[obs.targetType]}
                      {obs.targetName}
                    </span>
                  </div>
                </div>
                {expandedId === obs.id ? (
                  <ChevronUp size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                )}
              </div>
            </div>

            {expandedId === obs.id && (
              <div className="px-4 pb-4 border-t border-white/50 pt-3">
                <p className="text-sm text-gray-600 mb-3">{obs.description}</p>
                {obs.photo && (
                  <div className="mb-3">
                    <img
                      src={obs.photo}
                      alt="异常照片"
                      className="w-full max-w-xs rounded-lg border border-white/50 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                    />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateObservationStatus(obs.id, nextStatus(obs.status));
                  }}
                  className="px-3 py-1.5 bg-white/70 hover:bg-white rounded-lg text-xs font-medium text-gray-700 transition-colors"
                >
                  标记为：{statusConfig[nextStatus(obs.status)].label}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
