import { Modal } from '../Modal';
import type { CommunityItem } from '../../types/communityItem';
import { statusLabels, fragilityLabels, useCommunityItemStore } from '../../store/useCommunityItemStore';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/format';

interface ItemDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: CommunityItem | null;
  onBorrow: () => void;
  onReturn: () => void;
  onMarkCleaned: () => void;
  onReportDamage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ItemDetailModal = ({
  open,
  onClose,
  item,
  onBorrow,
  onReturn,
  onMarkCleaned,
  onReportDamage,
  onEdit,
  onDelete,
}: ItemDetailModalProps) => {
  const getBorrowsByItem = useCommunityItemStore((s) => s.getBorrowsByItem);
  const getDamagesByItem = useCommunityItemStore((s) => s.getDamagesByItem);

  if (!item) return null;

  const borrows = getBorrowsByItem(item.id).slice(0, 10);
  const damages = getDamagesByItem(item.id);

  const status = statusLabels[item.status];

  const canBorrow = item.status === 'available';
  const canReturn = item.status === 'in_use';
  const canClean = item.status === 'needs_cleaning';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item.name}
      size="xl"
      footer={
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-secondary"
            onClick={onEdit}
          >
            编辑信息
          </button>
          <button
            className="btn btn-danger"
            onClick={onDelete}
          >
            删除物品
          </button>
          <div className="flex-1" />
          {canClean && (
            <button className="btn btn-warning" onClick={onMarkCleaned}>
              标记已清洁
            </button>
          )}
          <button className="btn btn-secondary" onClick={onReportDamage}>
            报损坏
          </button>
          {canReturn && (
            <button className="btn btn-primary" onClick={onReturn}>
              归还
            </button>
          )}
          {canBorrow && (
            <button className="btn btn-primary" onClick={onBorrow}>
              我要借用
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-6">
          <div className="w-40 h-40 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
              <span className={`tag ${status.bg} ${status.color}`}>{status.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">购买人</p>
                <p className="font-medium text-gray-900">{item.purchaser}</p>
              </div>
              <div>
                <p className="text-gray-500">购买价格</p>
                <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
              </div>
              <div>
                <p className="text-gray-500">存放位置</p>
                <p className="font-medium text-gray-900">{item.storageLocation}</p>
              </div>
              <div>
                <p className="text-gray-500">易损程度</p>
                <p className={`font-medium ${fragilityLabels[item.fragility].color}`}>
                  {fragilityLabels[item.fragility].label}
                </p>
              </div>
              <div>
                <p className="text-gray-500">累计使用</p>
                <p className="font-medium text-gray-900">{item.totalUsageCount} 次</p>
              </div>
              <div>
                <p className="text-gray-500">上次使用</p>
                <p className="font-medium text-gray-900">
                  {item.lastUsedAt ? formatDate(item.lastUsedAt) : '—'}
                </p>
              </div>
              {item.purchaseDate && (
                <div>
                  <p className="text-gray-500">购买日期</p>
                  <p className="font-medium text-gray-900">{formatDate(item.purchaseDate)}</p>
                </div>
              )}
              {item.currentBorrower && (
                <div>
                  <p className="text-gray-500">当前使用人</p>
                  <p className="font-medium text-info-700">{item.currentBorrower}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl">
          <h4 className="text-sm font-semibold text-primary-700 mb-2">📋 使用规矩</h4>
          <div className="text-sm text-primary-600 whitespace-pre-line leading-relaxed">
            {item.usageRules}
          </div>
        </div>

        {damages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">🚨 损坏记录</h4>
            <div className="space-y-2">
              {damages.map((d) => (
                <div
                  key={d.id}
                  className={`p-4 rounded-xl border ${
                    d.settled ? 'bg-gray-50 border-gray-200' : 'bg-danger-50 border-danger-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`tag ${
                          d.settled ? 'bg-gray-100 text-gray-700' : 'bg-danger-100 text-danger-700'
                        }`}
                      >
                        {d.settled ? '已结清' : '待赔付'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(d.reportedAt)}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(d.compensationAmount)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{d.description}</p>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>责任人：{d.responsiblePerson} · 报备人：{d.reporter}</p>
                    <p>方案：{d.compensationPlan}</p>
                    {d.settledNote && <p>结清备注：{d.settledNote}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">📝 借用历史（最近{borrows.length}条）</h4>
          {borrows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">暂无借用记录</p>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {borrows.map((b) => (
                <div key={b.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{b.borrower}</span>
                      <span
                        className={`tag ${
                          b.returned ? 'bg-primary-100 text-primary-700' : 'bg-info-100 text-info-700'
                        }`}
                      >
                        {b.returned ? '已归还' : '使用中'}
                      </span>
                      {b.returned && !b.cleanedOnReturn && (
                        <span className="tag bg-warning-100 text-warning-700">未清洁</span>
                      )}
                      {b.returned && !b.undamagedOnReturn && (
                        <span className="tag bg-danger-100 text-danger-700">有损坏</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(b.startTime)} ~ {formatDateTime(b.endTime)}
                    {b.purpose && ` · ${b.purpose}`}
                  </div>
                  {b.returnNote && (
                    <p className="text-xs text-gray-400 mt-1">备注：{b.returnNote}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
