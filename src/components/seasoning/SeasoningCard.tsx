import { useState } from 'react';
import { Minus, Plus, Trash2, Package, Calendar, MapPin } from 'lucide-react';
import type { Seasoning } from '@/types';
import { cn } from '@/lib/utils';
import {
  getDaysRemaining,
  getSeasoningStatus,
  getRemainingRatio,
  needsRestock,
} from '@/utils/seasoningUtils';
import { useSeasoningStore } from '@/store/useSeasoningStore';

interface SeasoningCardProps {
  seasoning: Seasoning;
  index?: number;
  showActions?: boolean;
}

export default function SeasoningCard({ seasoning, index = 0, showActions = true }: SeasoningCardProps) {
  const [showUsePanel, setShowUsePanel] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const { useSeasoning, deleteSeasoning, markAsWasted } = useSeasoningStore();

  const daysRemaining = getDaysRemaining(seasoning);
  const status = getSeasoningStatus(seasoning);
  const restock = needsRestock(seasoning);
  const remainingRatio = getRemainingRatio(seasoning);

  const statusConfig = {
    fresh: { color: 'text-status-fresh', bg: 'bg-status-fresh/10', label: '正常' },
    soon: { color: 'text-status-soon', bg: 'bg-status-soon/10', label: `剩${daysRemaining}天` },
    expired: { color: 'text-status-expired', bg: 'bg-status-expired/10', label: `已过期${Math.abs(daysRemaining)}天` },
  };

  const quickAmounts = [
    { label: '少量', value: seasoning.initialAmount * 0.05 },
    { label: '常用', value: seasoning.initialAmount * 0.1 },
    { label: '大量', value: seasoning.initialAmount * 0.2 },
  ];

  const handleUse = (amount: number) => {
    useSeasoning(seasoning.id, amount);
    setShowUsePanel(false);
  };

  const handleCustomUse = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      handleUse(amount);
      setCustomAmount('');
    }
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个调料吗？')) {
      deleteSeasoning(seasoning.id);
    }
  };

  const handleMarkWasted = () => {
    if (confirm('确定要标记为浪费并移除吗？')) {
      markAsWasted(seasoning.id, status === 'expired' ? '过期浪费' : '手动丢弃');
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        status === 'expired' && 'opacity-75'
      )}
      style={{
        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      <div className="flex gap-3 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {seasoning.photoUrl ? (
            <img
              src={seasoning.photoUrl}
              alt={seasoning.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary-100 to-primary-200">
              🧂
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-base truncate">{seasoning.name}</h3>
              <p className="text-sm text-gray-500 truncate">{seasoning.brand}</p>
            </div>
            <span
              className={cn(
                'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium',
                statusConfig[status].bg,
                statusConfig[status].color
              )}
            >
              {statusConfig[status].label}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Package size={12} />
              {seasoning.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {seasoning.location}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>剩余量</span>
              <span className="font-medium">
                {seasoning.currentAmount}
                {seasoning.unit} / {seasoning.initialAmount}
                {seasoning.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  restock ? 'bg-status-restock' : 'bg-primary-500'
                )}
                style={{ width: `${remainingRatio * 100}%` }}
              />
            </div>
          </div>

          {status !== 'expired' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>开封于 {seasoning.openDate}</span>
              <span className="text-gray-300">|</span>
              <span>建议{seasoning.shelfLifeDays}天内用完</span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          {!showUsePanel ? (
            <div className="flex gap-2">
              {status === 'expired' ? (
                <>
                  <button
                    onClick={handleMarkWasted}
                    className="flex-1 py-2 px-3 bg-status-expired/10 text-status-expired rounded-xl text-sm font-medium hover:bg-status-expired/20 transition-colors"
                  >
                    标记浪费
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowUsePanel(true)}
                    className="flex-1 py-2 px-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 active:scale-98 transition-all flex items-center justify-center gap-1"
                  >
                    <Minus size={16} />
                    扣减用量
                  </button>
                  {restock && (
                    <span className="flex items-center px-3 py-2 bg-status-restock/10 text-status-restock rounded-xl text-xs font-medium">
                      🛒 需补货
                    </span>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => handleUse(qa.value)}
                    className="flex-1 py-2 px-2 bg-white border border-gray-200 rounded-xl text-sm hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{qa.label}</div>
                    <div className="text-xs text-gray-500">
                      ~{qa.value.toFixed(0)}
                      {seasoning.unit}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="自定义用量"
                    className="flex-1 py-2 text-sm outline-none bg-transparent"
                  />
                  <span className="text-sm text-gray-400">{seasoning.unit}</span>
                </div>
                <button
                  onClick={handleCustomUse}
                  className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={() => setShowUsePanel(false)}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
