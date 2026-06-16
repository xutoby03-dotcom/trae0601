import { useState, useMemo } from 'react';
import FurnitureCard from './FurnitureCard';
import { Empty, Loading } from '@/components/ui';
import type { Furniture } from '@/types';
import { CheckSquare, Square, List, Grid3X3 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FurnitureGridProps {
  furniture: Furniture[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onItemClick?: (furniture: Furniture) => void;
  filterNormal?: boolean;
}

export default function FurnitureGrid({
  furniture,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onItemClick,
  filterNormal = true,
}: FurnitureGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const displayFurniture = useMemo(() => {
    if (filterNormal) {
      return furniture.filter(f => f.status === 'normal');
    }
    return furniture;
  }, [furniture, filterNormal]);

  const allSelected = displayFurniture.length > 0 && 
    displayFurniture.every(f => selectedIds.includes(f.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(displayFurniture.map(f => f.id));
    }
  };

  const handleToggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (displayFurniture.length === 0) {
    return <Empty description="暂无桌椅数据" />;
  }

  return (
    <div>
      {selectable && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary-500" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>{allSelected ? '取消全选' : '全选'}</span>
          </button>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5 transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5 transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectable && (
        <div className="mb-3 text-sm text-gray-500">
          已选择 <span className="font-medium text-primary-500">{selectedIds.length}</span> / {displayFurniture.length} 件
        </div>
      )}

      <div className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'flex flex-col gap-2'
      )}>
        {displayFurniture.map((item) => (
          viewMode === 'grid' ? (
            <FurnitureCard
              key={item.id}
              furniture={item}
              selected={selectedIds.includes(item.id)}
              selectable={selectable}
              onClick={() => {
                if (selectable) {
                  handleToggleItem(item.id);
                } else {
                  onItemClick?.(item);
                }
              }}
            />
          ) : (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 transition-all',
                selectedIds.includes(item.id) && 'ring-2 ring-primary-500',
                selectable && 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => {
                if (selectable) {
                  handleToggleItem(item.id);
                } else {
                  onItemClick?.(item);
                }
              }}
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.photo ? (
                  <img src={item.photo} alt={item.code} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Square className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.code}</div>
                <div className="text-sm text-gray-500">{item.name || '-'}</div>
              </div>
              {selectable && (
                <div className="flex-shrink-0">
                  {selectedIds.includes(item.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary-500" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
