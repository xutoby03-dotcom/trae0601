import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Filter, Calendar, MapPin, Leaf } from 'lucide-react';
import { useBatchStore } from '@/store/batchStore';
import { useJarStore } from '@/store/jarStore';
import { formatDate, daysBetween, addDays, nowISO } from '@/utils/date';

export default function BatchList() {
  const navigate = useNavigate();
  const { batches, deleteBatch } = useBatchStore();
  const { getJarsByBatch } = useJarStore();
  const [search, setSearch] = useState('');
  const [filterSeason, setFilterSeason] = useState<string>('all');

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.origin.toLowerCase().includes(search.toLowerCase());
      const matchSeason = filterSeason === 'all' || b.harvestSeason === filterSeason;
      return matchSearch && matchSeason;
    });
  }, [batches, search, filterSeason]);

  const getShelfLifeInfo = (batch: typeof batches[0]) => {
    const expiryDate = addDays(batch.purchaseDate, batch.shelfLifeDays);
    const daysLeft = daysBetween(nowISO(), expiryDate);
    const progress = Math.max(0, Math.min(100, (daysLeft / batch.shelfLifeDays) * 100));
    let color = 'bg-teaGreen-500';
    if (daysLeft <= 7) color = 'bg-dangerRed';
    else if (daysLeft <= 30) color = 'bg-warnOrange';

    return { daysLeft, progress, color, expiryDate };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索品名或产地..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-72 rounded-lg border border-tea-200 bg-white focus:outline-none focus:border-teaGreen-400 focus:ring-2 focus:ring-teaGreen-100 transition-all"
            />
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-tea-200 bg-white focus:outline-none focus:border-teaGreen-400 text-sm"
          >
            <option value="all">全部采摘季</option>
            <option value="春茶">春茶</option>
            <option value="夏茶">夏茶</option>
            <option value="秋茶">秋茶</option>
            <option value="冬茶">冬茶</option>
          </select>
        </div>
        <button onClick={() => navigate('/batches/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增批次
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-tea-50 border-b border-tea-100">
            <tr>
              <th className="table-header">茶品</th>
              <th className="table-header">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />产地</div>
              </th>
              <th className="table-header">
                <div className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" />采摘季</div>
              </th>
              <th className="table-header">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />进货日期</div>
              </th>
              <th className="table-header">保质期</th>
              <th className="table-header">库存重量</th>
              <th className="table-header">已封罐数</th>
              <th className="table-header text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tea-50">
            {filteredBatches.map((batch) => {
              const shelfLife = getShelfLifeInfo(batch);
              const jarCount = getJarsByBatch(batch.id).length;
              return (
                <tr key={batch.id} className="hover:bg-tea-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={batch.photoUrl} alt={batch.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <span className="font-semibold text-gray-800 font-serif">{batch.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-600">{batch.origin}</td>
                  <td className="table-cell">
                    <span className="px-2.5 py-1 bg-teaGreen-50 text-teaGreen-700 rounded-full text-xs font-medium">
                      {batch.harvestSeason}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">{formatDate(batch.purchaseDate)}</td>
                  <td className="table-cell">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">剩余 {shelfLife.daysLeft > 0 ? `${shelfLife.daysLeft} 天` : `已过期 ${Math.abs(shelfLife.daysLeft)} 天`}</span>
                        <span className="text-gray-400">{formatDate(shelfLife.expiryDate)}</span>
                      </div>
                      <div className="h-1.5 w-36 bg-tea-100 rounded-full overflow-hidden">
                        <div className={`h-full ${shelfLife.color} rounded-full transition-all`} style={{ width: `${shelfLife.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-teaGreen-700">{batch.remainingWeight} g</span>
                    <span className="text-xs text-gray-400 ml-1">/ {batch.totalWeight}g</span>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-amber-700">{jarCount}</span>
                    <span className="text-xs text-gray-400 ml-1">罐</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/batches/${batch.id}/edit`)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-teaGreen-50 hover:text-teaGreen-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定删除该批次？已封罐的数据不会被删除。')) {
                            deleteBatch(batch.id);
                          }
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-dangerRed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredBatches.length === 0 && (
          <div className="text-center py-16 text-gray-400">暂无匹配的批次数据</div>
        )}
      </div>
    </div>
  );
}
