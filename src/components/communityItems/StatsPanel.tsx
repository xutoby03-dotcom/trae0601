import { useMemo } from 'react';
import { useCommunityItemStore } from '../../store/useCommunityItemStore';
import { formatCurrency } from '../../utils/format';
import { Empty } from '../Empty';

export const StatsPanel = () => {
  const {
    items,
    damageRecords,
    getUnsettledCompensationTotal,
    getCleaningStats,
  } = useCommunityItemStore();

  const unsettledTotal = getUnsettledCompensationTotal();
  const cleaningStats = getCleaningStats();

  const totalValue = items.reduce((s, i) => s + i.price, 0);
  const totalUsage = items.reduce((s, i) => s + i.totalUsageCount, 0);
  const unsettledCount = damageRecords.filter((d) => !d.settled).length;

  const sortedByUsage = useMemo(
    () => [...items].sort((a, b) => b.totalUsageCount - a.totalUsageCount).slice(0, 5),
    [items]
  );
  const maxUsage = Math.max(...sortedByUsage.map((i) => i.totalUsageCount), 1);

  const worstCleaners = useMemo(
    () => [...cleaningStats].sort((a, b) => b.uncleanedRate - a.uncleanedRate),
    [cleaningStats]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">📊 统计概览</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">公共物品总价值</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} 件物品</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">累计使用次数</p>
          <p className="text-xl font-bold text-gray-900">{totalUsage}</p>
          <p className="text-xs text-gray-400 mt-0.5">次</p>
        </div>
        <div className={`card p-4 ${unsettledCount > 0 ? 'bg-danger-50 border-danger-100' : ''}`}>
          <p className={`text-xs mb-1 ${unsettledCount > 0 ? 'text-danger-600' : 'text-gray-500'}`}>
            待赔付记录
          </p>
          <p className={`text-xl font-bold ${unsettledCount > 0 ? 'text-danger-700' : 'text-gray-900'}`}>
            {unsettledCount} 笔
          </p>
          <p className={`text-xs mt-0.5 ${unsettledCount > 0 ? 'text-danger-500' : 'text-gray-400'}`}>
            {formatCurrency(unsettledTotal)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">损坏记录总数</p>
          <p className="text-xl font-bold text-gray-900">{damageRecords.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            已结清 {damageRecords.filter((d) => d.settled).length} 笔
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="font-semibold text-gray-900 mb-4">🔥 物品使用排行</h4>
        {sortedByUsage.length === 0 ? (
          <Empty title="暂无数据" description="使用物品后将显示排行" />
        ) : (
          <div className="space-y-3">
            {sortedByUsage.map((item, idx) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-warning-500 text-white'
                          : idx === 1
                          ? 'bg-gray-300 text-white'
                          : idx === 2
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.totalUsageCount} 次
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${(item.totalUsageCount / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h4 className="font-semibold text-gray-900 mb-4">🧹 清洁排行榜</h4>
        {worstCleaners.length === 0 ? (
          <Empty title="暂无数据" description="归还记录后将显示" />
        ) : (
          <div className="space-y-3">
            {worstCleaners.map((stat) => (
              <div key={stat.person}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{stat.person}</span>
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold ${
                        stat.uncleanedRate > 0.3 ? 'text-warning-600' : 'text-primary-600'
                      }`}
                    >
                      {(stat.uncleanedRate * 100).toFixed(0)}% 未清洁
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({stat.uncleanedReturns}/{stat.totalReturns})
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.uncleanedRate > 0.3
                        ? 'bg-gradient-to-r from-warning-400 to-warning-600'
                        : 'bg-gradient-to-r from-primary-300 to-primary-500'
                    }`}
                    style={{ width: `${stat.uncleanedRate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {unsettledCount > 0 && (
        <div className="card p-5 bg-danger-50 border-danger-100">
          <h4 className="font-semibold text-danger-700 mb-3">💸 待赔付明细</h4>
          <div className="space-y-2">
            {damageRecords
              .filter((d) => !d.settled)
              .map((d) => {
                const item = items.find((i) => i.id === d.itemId);
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item?.name || '未知物品'}
                      </p>
                      <p className="text-xs text-gray-500">
                        责任人：{d.responsiblePerson}
                      </p>
                    </div>
                    <span className="font-bold text-danger-700">
                      {formatCurrency(d.compensationAmount)}
                    </span>
                  </div>
                );
              })}
          </div>
          <div className="mt-3 pt-3 border-t border-danger-200 flex items-center justify-between">
            <span className="font-medium text-danger-700">合计待赔付</span>
            <span className="text-xl font-bold text-danger-700">
              {formatCurrency(unsettledTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
