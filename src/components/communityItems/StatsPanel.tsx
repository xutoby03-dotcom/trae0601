import { useState, useMemo } from 'react';
import { useCommunityItemStore, roommates } from '../../store/useCommunityItemStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { Empty } from '../Empty';
import { Modal } from '../Modal';

export const StatsPanel = () => {
  const {
    items,
    borrowRecords,
    damageRecords,
    getUnsettledCompensationTotal,
    getCleaningStats,
    settleDamage,
  } = useCommunityItemStore();

  const unsettledTotal = getUnsettledCompensationTotal();
  const cleaningStats = getCleaningStats();

  const [settleConfirm, setSettleConfirm] = useState<string | null>(null);
  const [selectedRoommate, setSelectedRoommate] = useState<string | null>(null);
  const [damageFilterPerson, setDamageFilterPerson] = useState<string | null>(null);

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

  const unsettledResponsiblePeople = useMemo(() => {
    const set = new Set<string>();
    damageRecords.filter((d) => !d.settled).forEach((d) => set.add(d.responsiblePerson));
    return Array.from(set);
  }, [damageRecords]);

  const filteredDamages = useMemo(() => {
    let list = damageRecords.filter((d) => !d.settled);
    if (damageFilterPerson) {
      list = list.filter((d) => d.responsiblePerson === damageFilterPerson);
    }
    return list;
  }, [damageRecords, damageFilterPerson]);

  const filteredTotal = useMemo(
    () => filteredDamages.reduce((s, d) => s + d.compensationAmount, 0),
    [filteredDamages]
  );

  const roommateLedger = useMemo(() => {
    return roommates.map((rm) => {
      const unsettledDamages = damageRecords.filter(
        (d) => d.responsiblePerson === rm.name && !d.settled
      );
      const stat = cleaningStats.find((s) => s.person === rm.name);
      const recentBorrows = borrowRecords
        .filter((b) => b.borrower === rm.name)
        .sort((a, b) => {
          const at = a.returnTime || a.startTime;
          const bt = b.returnTime || b.startTime;
          return new Date(bt).getTime() - new Date(at).getTime();
        })
        .slice(0, 5);

      return {
        ...rm,
        unsettledAmount: unsettledDamages.reduce((s, d) => s + d.compensationAmount, 0),
        unsettledCount: unsettledDamages.length,
        uncleanedCount: stat?.uncleanedReturns || 0,
        totalReturns: stat?.totalReturns || 0,
        recentBorrows,
      };
    });
  }, [damageRecords, cleaningStats, borrowRecords]);

  const selectedLedger = selectedRoommate
    ? roommateLedger.find((r) => r.name === selectedRoommate)
    : null;

  const selectedDamages = useMemo(() => {
    if (!selectedRoommate) return [];
    return damageRecords.filter(
      (d) => d.responsiblePerson === selectedRoommate && !d.settled
    );
  }, [damageRecords, selectedRoommate]);

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
        <div
          className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
            unsettledCount > 0 ? 'bg-danger-50 border-danger-100' : ''
          }`}
          onClick={() => {
            if (unsettledCount > 0) {
              document
                .getElementById('unsettled-section')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          <p
            className={`text-xs mb-1 ${unsettledCount > 0 ? 'text-danger-600' : 'text-gray-500'}`}
          >
            待赔付记录
          </p>
          <p
            className={`text-xl font-bold ${unsettledCount > 0 ? 'text-danger-700' : 'text-gray-900'}`}
          >
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">👥 室友账本</h4>
          <span className="text-xs text-gray-400">点名字看详情</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {roommateLedger.map((rm) => (
            <button
              key={rm.id}
              className="text-left p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-primary-50 hover:border-primary-200 transition-all group"
              onClick={() => setSelectedRoommate(rm.name)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {rm.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700">
                    {rm.name}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      rm.unsettledCount > 0 ? 'text-danger-600' : 'text-gray-500'
                    }`}
                  >
                    待赔 {rm.unsettledCount}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      rm.unsettledCount > 0 ? 'text-danger-700' : 'text-gray-400'
                    }`}
                  >
                    {formatCurrency(rm.unsettledAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      rm.uncleanedCount > 0 ? 'text-warning-600' : 'text-gray-500'
                    }`}
                  >
                    拖清洁 {rm.uncleanedCount}
                  </span>
                  <span className="text-xs text-gray-400">共借 {rm.totalReturns} 次</span>
                </div>
              </div>
            </button>
          ))}
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
              <button
                key={stat.person}
                className="w-full text-left group"
                onClick={() => setSelectedRoommate(stat.person)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                    {stat.person}
                  </span>
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
              </button>
            ))}
          </div>
        )}
      </div>

      {unsettledCount > 0 && (
        <div id="unsettled-section" className="card p-5 bg-danger-50 border-danger-100 scroll-mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-danger-700">💸 待赔付明细</h4>
            {unsettledResponsiblePeople.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap max-w-[60%]">
                <button
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    damageFilterPerson === null
                      ? 'bg-danger-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setDamageFilterPerson(null)}
                >
                  全部
                </button>
                {unsettledResponsiblePeople.map((person) => (
                  <button
                    key={person}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      damageFilterPerson === person
                        ? 'bg-danger-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setDamageFilterPerson(person)}
                  >
                    {person}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {filteredDamages.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                这个人目前没有待赔付记录
              </div>
            ) : (
              filteredDamages.map((d) => {
                const item = items.find((i) => i.id === d.itemId);
                return (
                  <div key={d.id} className="py-2 px-3 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item?.name || '未知物品'}
                      </p>
                      <span className="font-bold text-danger-700">
                        {formatCurrency(d.compensationAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                        onClick={() => setSelectedRoommate(d.responsiblePerson)}
                      >
                        责任人：{d.responsiblePerson} →
                      </button>
                      <button
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 px-2 py-0.5 rounded hover:bg-primary-50 transition-colors"
                        onClick={() => setSettleConfirm(d.id)}
                      >
                        标记结清 →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {filteredDamages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-danger-200 flex items-center justify-between">
              <span className="font-medium text-danger-700">
                {damageFilterPerson ? `${damageFilterPerson} 待赔付` : '合计待赔付'}
              </span>
              <span className="text-xl font-bold text-danger-700">
                {formatCurrency(filteredTotal)}
              </span>
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!settleConfirm}
        onClose={() => setSettleConfirm(null)}
        title="确认结清？"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              className="btn btn-secondary flex-1"
              onClick={() => setSettleConfirm(null)}
            >
              取消
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={() => {
                if (settleConfirm) {
                  settleDamage(settleConfirm, '已结清赔付');
                  setSettleConfirm(null);
                }
              }}
            >
              确认结清
            </button>
          </div>
        }
      >
        <div className="py-2 text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-7 h-7 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-1">确定要把这笔赔付标记为已结清吗？</p>
          <p className="text-2xl font-bold text-primary-600 mt-2">
            {settleConfirm
              ? formatCurrency(
                  damageRecords.find((d) => d.id === settleConfirm)?.compensationAmount || 0
                )
              : ''}
          </p>
        </div>
      </Modal>

      <Modal
        open={!!selectedRoommate}
        onClose={() => setSelectedRoommate(null)}
        title={`${selectedRoommate || ''} 的账本`}
        size="md"
      >
        {selectedLedger && (
          <div className="space-y-5 -mx-2">
            <div className="flex items-center gap-4 px-2 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {selectedLedger.name.slice(0, 1)}
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-danger-600">
                    {formatCurrency(selectedLedger.unsettledAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">待赔付</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p
                    className={`text-lg font-bold ${
                      selectedLedger.uncleanedCount > 0 ? 'text-warning-600' : 'text-primary-600'
                    }`}
                  >
                    {selectedLedger.uncleanedCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">拖清洁</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">
                    {selectedLedger.totalReturns}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">借用次数</p>
                </div>
              </div>
            </div>

            <div className="px-2">
              <div className="flex items-center gap-2 mb-3">
                <h5 className="font-semibold text-gray-800 text-sm">💸 未结清赔付</h5>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-danger-100 text-danger-700">
                  {selectedDamages.length} 笔
                </span>
              </div>
              {selectedDamages.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">
                  没有待赔付，表现不错 ✨
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDamages.map((d) => {
                    const item = items.find((i) => i.id === d.itemId);
                    return (
                      <div
                        key={d.id}
                        className="p-3 bg-danger-50 rounded-lg border border-danger-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {item?.name || '未知物品'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(d.reportedAt)} 报备
                            </p>
                          </div>
                          <span className="text-base font-bold text-danger-700 ml-3 shrink-0">
                            {formatCurrency(d.compensationAmount)}
                          </span>
                        </div>
                        {d.compensationPlan && (
                          <p className="text-xs text-gray-600 bg-white rounded px-2 py-1.5">
                            📋 {d.compensationPlan}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-2">
              <div className="flex items-center gap-2 mb-3">
                <h5 className="font-semibold text-gray-800 text-sm">🧹 清洁记录</h5>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedLedger.uncleanedCount > 0
                      ? 'bg-warning-100 text-warning-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {selectedLedger.uncleanedCount === 0
                    ? '全勤'
                    : `拖了 ${selectedLedger.uncleanedCount} 次`}
                </span>
              </div>
              {selectedLedger.totalReturns === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">
                  还没借用过物品
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">清洁率</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedLedger.totalReturns > 0
                        ? (
                            ((selectedLedger.totalReturns - selectedLedger.uncleanedCount) /
                              selectedLedger.totalReturns) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2.5 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedLedger.uncleanedCount === 0
                          ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                          : 'bg-gradient-to-r from-warning-400 to-warning-600'
                      }`}
                      style={{
                        width: `${
                          selectedLedger.totalReturns > 0
                            ? ((selectedLedger.totalReturns - selectedLedger.uncleanedCount) /
                                selectedLedger.totalReturns) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    共归还 {selectedLedger.totalReturns} 次，其中{' '}
                    <span
                      className={
                        selectedLedger.uncleanedCount > 0
                          ? 'text-warning-600 font-medium'
                          : 'text-gray-600'
                      }
                    >
                      {selectedLedger.uncleanedCount} 次
                    </span>{' '}
                    未清洁
                  </p>
                </div>
              )}
            </div>

            <div className="px-2">
              <div className="flex items-center gap-2 mb-3">
                <h5 className="font-semibold text-gray-800 text-sm">📅 最近借用</h5>
                <span className="text-xs text-gray-400">最近 5 条</span>
              </div>
              {selectedLedger.recentBorrows.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">
                  还没有借用记录
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLedger.recentBorrows.map((b) => {
                    const item = items.find((i) => i.id === b.itemId);
                    return (
                      <div
                        key={b.id}
                        className="p-3 bg-gray-50 rounded-lg flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-base shrink-0">
                          {b.returned
                            ? b.cleanedOnReturn
                              ? '✅'
                              : '🧹'
                            : b.undamagedOnReturn
                            ? '✅'
                            : '⏳'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item?.name || '未知物品'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {b.purpose || '未填写用途'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(b.startTime)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              !b.returned
                                ? 'bg-info-100 text-info-700'
                                : !b.cleanedOnReturn
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-primary-100 text-primary-700'
                            }`}
                          >
                            {!b.returned
                              ? '使用中'
                              : !b.cleanedOnReturn
                              ? '待清洁'
                              : '已归还'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
