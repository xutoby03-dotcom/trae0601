import { useState, useMemo } from 'react';
import {
  PackageOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  CheckSquare,
  Square,
  ShoppingCart,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { type SupplyItem } from '@/types';
import ColorBadge from '@/components/ColorBadge';
import StatusBadge from '@/components/StatusBadge';
import { getItemTypeLabel, getStatusLabel, formatDateTime, cn, downloadCSV } from '@/utils';

type FilterStatus = 'all' | 'pending' | 'ordered' | 'completed';

export default function SupplyList() {
  const supplyItems = useAppStore((state) => state.supplyItems);
  const updateSupplyItemStatus = useAppStore((state) => state.updateSupplyItemStatus);
  const batchUpdateSupplyItems = useAppStore((state) => state.batchUpdateSupplyItems);
  const getPurchaseSuggestions = useAppStore((state) => state.getPurchaseSuggestions);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredItems = useMemo(() => {
    let items = [...supplyItems];
    
    if (filterStatus !== 'all') {
      items = items.filter((item) => item.status === filterStatus);
    }

    return items.sort((a, b) => {
      if (a.consecutiveShortage >= 2 && b.consecutiveShortage < 2) return -1;
      if (b.consecutiveShortage >= 2 && a.consecutiveShortage < 2) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [supplyItems, filterStatus]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleBatchUpdate = (status: SupplyItem['status']) => {
    if (selectedIds.size === 0) return;
    batchUpdateSupplyItems(Array.from(selectedIds), status);
    setSelectedIds(new Set());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleExport = () => {
    const suggestions = getPurchaseSuggestions();
    const csvData = suggestions.map((s) => ({
      物品类型: getItemTypeLabel(s.itemType),
      颜色: s.colorName || '-',
      总需求: s.totalRequired,
      缓冲库存: s.bufferStock,
      建议采购: s.suggestedPurchase,
      涉及会议室: s.roomsNeeding.join('、'),
    }));
    downloadCSV(csvData, `采购清单_${new Date().toISOString().split('T')[0]}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'ordered':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const stats = useMemo(() => ({
    all: supplyItems.length,
    pending: supplyItems.filter((s) => s.status === 'pending').length,
    ordered: supplyItems.filter((s) => s.status === 'ordered').length,
    completed: supplyItems.filter((s) => s.status === 'completed').length,
  }), [supplyItems]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待补货' },
    { key: 'ordered', label: '已下单' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">补给清单</h1>
          <p className="mt-1 text-slate-500">
            共 {filteredItems.length} 项补给任务
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出采购单
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">批量操作成功！</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                  filterStatus === filter.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {filter.label}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                  {stats[filter.key]}
                </span>
              </button>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-blue-700 font-medium">
                已选择 {selectedIds.size} 项
              </span>
              <button
                onClick={() => handleBatchUpdate('ordered')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                标记已下单
              </button>
              <button
                onClick={() => handleBatchUpdate('completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                标记已完成
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  会议室
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  物品
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  需补数量
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <PackageOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">暂无补给项</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = selectedIds.has(item.id);
                  const isConsecutive = item.consecutiveShortage >= 2;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'transition-colors',
                        isConsecutive ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50',
                        isSelected && 'bg-blue-50/50'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {isConsecutive && (
                            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                          )}
                          <div>
                            <p className="font-medium text-slate-800">{item.roomName}</p>
                            {isConsecutive && (
                              <p className="text-xs text-red-600 font-medium">
                                连续缺货 {item.consecutiveShortage} 次！
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.itemType === 'marker' && item.color ? (
                          <ColorBadge color={item.color} colorName={item.colorName} />
                        ) : (
                          <span className="text-slate-700">{getItemTypeLabel(item.itemType)}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-lg text-slate-800">
                          {item.requiredQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          status={item.status}
                          label={getStatusLabel(item.status)}
                          variant={getStatusVariant(item.status) as 'warning' | 'info' | 'success' | 'default'}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(new Date(item.createdAt))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateSupplyItemStatus(item.id, 'ordered')}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              下单
                            </button>
                            <button
                              onClick={() => {
                                updateSupplyItemStatus(item.id, 'completed');
                                setShowSuccess(true);
                                setTimeout(() => setShowSuccess(false), 2000);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              完成
                            </button>
                          </div>
                        )}
                        {item.status === 'ordered' && (
                          <button
                            onClick={() => {
                              updateSupplyItemStatus(item.id, 'completed');
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 2000);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            标记完成
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
