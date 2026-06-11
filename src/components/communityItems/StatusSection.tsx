import type { CommunityItem, ItemStatus } from '../../types/communityItem';
import { statusLabels } from '../../store/useCommunityItemStore';
import { ItemCard } from './ItemCard';
import { Empty } from '../Empty';

interface StatusSectionProps {
  status: ItemStatus;
  items: CommunityItem[];
  onItemClick: (item: CommunityItem) => void;
  onBorrow?: (item: CommunityItem) => void;
  onReturn?: (item: CommunityItem) => void;
  onMarkCleaned?: (item: CommunityItem) => void;
}

const iconPaths: Record<ItemStatus, JSX.Element> = {
  available: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  in_use: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  needs_cleaning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  needs_repair: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const emptyTexts: Record<ItemStatus, { title: string; description: string }> = {
  available: { title: '暂无可用物品', description: '所有物品都在使用中或待处理' },
  in_use: { title: '暂无使用中物品', description: '物品都已归还，随时可用' },
  needs_cleaning: { title: '所有物品已清洁', description: '干得漂亮！没有待清洁的物品 🎉' },
  needs_repair: { title: '无待赔付记录', description: '所有物品状态正常，无需赔付 ✨' },
};

export const StatusSection = ({
  status,
  items,
  onItemClick,
  onBorrow,
  onReturn,
  onMarkCleaned,
}: StatusSectionProps) => {
  const config = statusLabels[status];

  return (
    <section className="card overflow-hidden">
      <div className={`px-5 py-4 border-b border-gray-100 ${config.bg}/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
              {iconPaths[status]}
            </div>
            <div>
              <h3 className={`font-bold ${config.color}`}>
                {config.label}
              </h3>
              <p className="text-xs text-gray-500">
                {items.length} 件物品
              </p>
            </div>
          </div>
          <div className={`h-2 w-16 rounded-full ${config.bg}`}>
            <div
              className={`h-full rounded-full ${config.color.replace('text-', 'bg-')} transition-all`}
              style={{ width: `${items.length * 10}%`, maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        {items.length === 0 ? (
          <Empty
            title={emptyTexts[status].title}
            description={emptyTexts[status].description}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
                onBorrow={onBorrow ? () => onBorrow(item) : undefined}
                onReturn={onReturn ? () => onReturn(item) : undefined}
                onMarkCleaned={onMarkCleaned ? () => onMarkCleaned(item) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
