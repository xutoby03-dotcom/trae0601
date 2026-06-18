import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight, Calendar, Clock } from 'lucide-react';
import type { BatchStatus, SoupType } from '@/types';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import { BATCH_STATUS_LABEL, SOUP_TYPE_LABEL } from '@/utils/soupConfig';
import { formatDateTime, formatDuration, getDurationMinutes } from '@/utils/helpers';

const STATUS_OPTIONS: (BatchStatus | 'all')[] = ['all', 'preparing', 'cooking', 'finished', 'sold'];
const SOUP_OPTIONS: (SoupType | 'all')[] = ['all', 'pork-bone', 'beef-bone', 'chicken', 'seafood', 'vegetarian'];

export default function BatchList() {
  const navigate = useNavigate();
  const batches = useBatchStore((s) => s.batches);
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'all'>('all');
  const [soupFilter, setSoupFilter] = useState<SoupType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = batches.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (soupFilter !== 'all' && b.soupType !== soupFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.potNumber.toLowerCase().includes(q) && !b.operator.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-broth-800">批次管理</h1>
          <p className="text-broth-500 mt-1">查看和管理所有熬制批次记录</p>
        </div>
        <button onClick={() => navigate('/batches/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建熬制
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-broth-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索锅号、师傅..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-broth-500" />
            <select
              className="input-field !w-auto"
              value={soupFilter}
              onChange={(e) => setSoupFilter(e.target.value as SoupType | 'all')}
            >
              <option value="all">全部汤底</option>
              {SOUP_OPTIONS.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{SOUP_TYPE_LABEL[s as SoupType]}</option>
              ))}
            </select>
            <select
              className="input-field !w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BatchStatus | 'all')}
            >
              <option value="all">全部状态</option>
              {STATUS_OPTIONS.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{BATCH_STATUS_LABEL[s as BatchStatus]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-16 text-broth-400">
            <p>暂无匹配的批次记录</p>
          </div>
        ) : (
          filtered.map((b) => {
            const dur = getDurationMinutes(b.startTime, b.finishTime);
            return (
              <div
                key={b.id}
                onClick={() => navigate(`/batches/${b.id}`)}
                className="card hover:shadow-warmer hover:border-fire-100 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-soup-100 to-soup-200 flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-broth-700 text-lg">{b.potNumber.replace('号锅', '')}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge type="soup" value={b.soupType} />
                        <StatusBadge type="batch" value={b.status} />
                        <span className="text-sm text-broth-600 font-medium">{b.operator}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-broth-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(b.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {b.status === 'cooking' || b.status === 'preparing'
                            ? `已熬制 ${formatDuration(dur)}`
                            : `耗时 ${formatDuration(dur)}`}
                        </span>
                        <span>骨料 {b.boneWeightKg}kg · 加水 {b.waterVolumeL}L</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-broth-500 mb-0.5">记录次数</p>
                      <p className="font-display text-xl font-bold text-broth-800">{b.cookingRecords.length}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-broth-400 group-hover:text-fire-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
