import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Check, RotateCcw, Package } from 'lucide-react';
import { useSeasoningStore } from '@/store/useSeasoningStore';
import { getRemainingRatio, needsRestock, getSeasoningStatus } from '@/utils/seasoningUtils';
import { cn } from '@/lib/utils';

export default function RestockPage() {
  const navigate = useNavigate();
  const { seasonings, markAsRestocked, deleteSeasoning } = useSeasoningStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const restockItems = seasonings.filter(
    (s) => s.status === 'active' && needsRestock(s) && getSeasoningStatus(s) !== 'expired'
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === restockItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(restockItems.map((s) => s.id)));
    }
  };

  const handleMarkRestocked = (id: string) => {
    const item = seasonings.find((s) => s.id === id);
    if (!item) return;
    
    const newAmount = item.initialAmount;
    markAsRestocked(id, newAmount);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleMarkAllRestocked = () => {
    selected.forEach((id) => {
      const item = seasonings.find((s) => s.id === id);
      if (item) {
        markAsRestocked(id, item.initialAmount);
      }
    });
    setSelected(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-gray-50 pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-status-restock" size={24} />
              <h1 className="text-lg font-bold text-gray-800">补货清单</h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-10">
            共有 {restockItems.length} 种调料需要补货
          </p>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6">
        {restockItems.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={selectAll}
              className="text-sm text-primary-500 font-medium hover:text-primary-600"
            >
              {selected.size === restockItems.length ? '取消全选' : '全选'}
            </button>
            {selected.size > 0 && (
              <button
                onClick={handleMarkAllRestocked}
                className="flex items-center gap-1 px-4 py-2 bg-status-restock text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <Check size={16} />
                标记 {selected.size} 项已补货
              </button>
            )}
          </div>
        )}

        {restockItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600 font-medium">太棒了！暂时没有需要补货的调料</p>
            <p className="text-sm text-gray-400 mt-1">所有调料的存量都还充足</p>
          </div>
        ) : (
          <div className="space-y-3">
            {restockItems.map((item, index) => {
              const ratio = getRemainingRatio(item);
              const isSelected = selected.has(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    'bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
                    isSelected
                      ? 'border-status-restock shadow-md shadow-purple-200'
                      : 'border-gray-100 shadow-sm hover:shadow-md'
                  )}
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected
                          ? 'bg-status-restock border-status-restock'
                          : 'border-gray-300 hover:border-status-restock'
                      )}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>

                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-100 to-purple-200">
                          🧂
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{item.brand}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Package size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{item.location}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-status-restock">
                        {(ratio * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.currentAmount}/{item.initialAmount}
                        {item.unit}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/50 flex gap-2">
                    <button
                      onClick={() => handleMarkRestocked(item.id)}
                      className="flex-1 py-2 px-3 bg-status-restock/10 text-status-restock rounded-xl text-sm font-medium hover:bg-status-restock/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={14} />
                      已补货（换新）
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除吗？')) {
                          deleteSeasoning(item.id);
                        }
                      }}
                      className="py-2 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl text-sm transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {restockItems.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <h3 className="font-medium text-yellow-800 flex items-center gap-2 mb-2">
              💡 小贴士
            </h3>
            <p className="text-sm text-yellow-700">
              购物时可以对照这个清单采购。补货后点击"已补货"重置容量和开封日期。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
