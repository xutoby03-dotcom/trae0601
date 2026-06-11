import type { CommunityItem } from '../../types/communityItem';
import { statusLabels, fragilityLabels } from '../../store/useCommunityItemStore';
import { formatCurrency, formatDateTime } from '../../utils/format';

interface ItemCardProps {
  item: CommunityItem;
  onClick: () => void;
  onBorrow?: () => void;
  onReturn?: () => void;
  onMarkCleaned?: () => void;
}

export const ItemCard = ({ item, onClick, onBorrow, onReturn, onMarkCleaned }: ItemCardProps) => {
  const status = statusLabels[item.status];
  const fragility = fragilityLabels[item.fragility];

  const canBorrow = item.status === 'available';
  const canReturn = item.status === 'in_use';
  const canClean = item.status === 'needs_cleaning';

  return (
    <div
      className="card hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-gray-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute top-3 left-3">
          <span className={`tag ${status.bg} ${status.color} shadow-sm`}>
            {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="tag bg-white/80 backdrop-blur-sm text-gray-600 shadow-sm">
            {fragility.label}
          </span>
        </div>
        {item.currentBorrower && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-info-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{item.currentBorrower} 使用中</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
          {item.name}
        </h4>

        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.storageLocation}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {item.purchaser} · {formatCurrency(item.price)}
          </p>
          <p className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            使用 {item.totalUsageCount} 次
            {item.lastUsedAt && ` · 上次 ${formatDateTime(item.lastUsedAt).slice(5, 16)}`}
          </p>
        </div>

        <div
          className="flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-secondary flex-1 text-xs py-1.5 px-3"
            onClick={onClick}
          >
            详情
          </button>
          {canBorrow && (
            <button
              className="btn btn-primary flex-1 text-xs py-1.5 px-3"
              onClick={onBorrow}
            >
              借用
            </button>
          )}
          {canReturn && (
            <button
              className="btn btn-primary flex-1 text-xs py-1.5 px-3"
              onClick={onReturn}
            >
              归还
            </button>
          )}
          {canClean && (
            <button
              className="btn btn-warning flex-1 text-xs py-1.5 px-3"
              onClick={onMarkCleaned}
            >
              标记清洁
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
