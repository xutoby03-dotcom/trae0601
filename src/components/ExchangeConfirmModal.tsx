import { useState, useEffect } from 'react';
import {
  X,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Check,
  User,
} from 'lucide-react';
import type { ExchangeRequest } from '@/types';
import { CLOTHING_TYPE_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { TagStatusBadge } from './StatusBadge';

interface ExchangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ExchangeRequest | null;
}

export default function ExchangeConfirmModal({
  isOpen,
  onClose,
  request,
}: ExchangeConfirmModalProps) {
  const [matchType, setMatchType] = useState<'stock' | 'swap' | null>(null);
  const [swapMatch, setSwapMatch] = useState<ExchangeRequest | null>(null);
  const [hasStock, setHasStock] = useState(false);

  const matchStock = useAppStore((s) => s.matchStock);
  const matchSwap = useAppStore((s) => s.matchSwap);
  const confirmStockExchange = useAppStore((s) => s.confirmStockExchange);
  const confirmSwapExchange = useAppStore((s) => s.confirmSwapExchange);
  const getInventoryQuantity = useAppStore((s) => s.getInventoryQuantity);

  useEffect(() => {
    if (request && isOpen) {
      const stockMatch = matchStock(request.id);
      setHasStock(stockMatch);
      const swap = matchSwap(request.id);
      setSwapMatch(swap);
      setMatchType(null);
    }
  }, [request, isOpen, matchStock, matchSwap]);

  if (!isOpen || !request) return null;

  const handleStockExchange = () => {
    confirmStockExchange(request.id, '王老师');
    onClose();
  };

  const handleSwapExchange = () => {
    if (swapMatch) {
      confirmSwapExchange(request.id, swapMatch.id, '王老师');
      onClose();
    }
  };

  const stockQuantity = getInventoryQuantity(
    request.clothingType,
    request.targetSize
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">确认调换</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {request.studentName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {request.studentName}
                </div>
                <div className="text-sm text-slate-500">{request.className}</div>
              </div>
              <div className="ml-auto">
                <TagStatusBadge status={request.tagStatus} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <div className="text-xs text-slate-500 mb-1">原尺码</div>
                <div className="text-lg font-bold text-slate-700">
                  {request.originalSize}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-blue-500" />
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="text-xs text-slate-500 mb-1">目标尺码</div>
                <div className="text-lg font-bold text-blue-600">
                  {request.targetSize}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600 text-center">
              {CLOTHING_TYPE_LABELS[request.clothingType]}
            </div>
          </div>

          {request.tagStatus !== 'intact' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">
                    吊牌不完整，无法直接调换
                  </div>
                  <div className="text-sm text-orange-600 mt-1">
                    吊牌已拆或损坏的校服只能登记人工处理，由总务老师跟进
                  </div>
                </div>
              </div>
            </div>
          )}

          {request.tagStatus === 'intact' && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-3">
                选择调换方式
              </h3>

              <button
                onClick={() => setMatchType('stock')}
                disabled={stockQuantity <= 0}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  matchType === 'stock'
                    ? 'border-blue-500 bg-blue-50'
                    : stockQuantity > 0
                    ? 'border-slate-200 hover:border-slate-300 bg-white'
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      matchType === 'stock'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">库存匹配</div>
                    <div className="text-sm text-slate-500">
                      {stockQuantity > 0
                        ? `库存有 ${stockQuantity} 件 ${request.targetSize} 码`
                        : `库存暂无 ${request.targetSize} 码`}
                    </div>
                  </div>
                  {matchType === 'stock' && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setMatchType('swap')}
                disabled={!swapMatch}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  matchType === 'swap'
                    ? 'border-green-500 bg-green-50'
                    : swapMatch
                    ? 'border-slate-200 hover:border-slate-300 bg-white'
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      matchType === 'swap'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">同年级互换</div>
                    <div className="text-sm text-slate-500">
                      {swapMatch
                        ? `${swapMatch.studentName} (${swapMatch.className}) 有反向需求`
                        : '暂无匹配的互换需求'}
                    </div>
                  </div>
                  {matchType === 'swap' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
                {swapMatch && matchType === 'swap' && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {swapMatch.studentName}
                      </span>
                      <span className="text-green-600">
                        {swapMatch.originalSize} → {swapMatch.targetSize}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            {request.tagStatus === 'intact' ? (
              <button
                onClick={
                  matchType === 'stock'
                    ? handleStockExchange
                    : matchType === 'swap'
                    ? handleSwapExchange
                    : undefined
                }
                disabled={!matchType}
                className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                  matchType
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                确认调换
              </button>
            ) : (
              <button
                onClick={() => {
                  useAppStore.getState().markManual(request.id, '王老师');
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all active:scale-[0.98]"
              >
                登记人工处理
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
