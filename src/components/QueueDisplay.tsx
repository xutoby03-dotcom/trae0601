import { useState } from 'react';
import {
  QrCode,
  Phone,
  UserCheck,
  Clock,
  Snowflake,
  AlertTriangle,
  SkipForward,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateEstimatedWaitTime } from '../utils/queue';
import { speakQueueNumber, speakPriorityReminder } from '../utils/speech';
import { cn } from '@/lib/utils';
import type { CustomerOrder } from '../types';

export function QueueDisplay() {
  const {
    queueState,
    enqueue,
    callNext,
    markPicked,
    findOrderByPhoneOrCode,
    getBatchById,
  } = useAppStore();

  const [searchInput, setSearchInput] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>();
  const [foundOrder, setFoundOrder] = useState<CustomerOrder | null>(null);
  const [enqueueSuccess, setEnqueueSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const batches = useAppStore((state) => state.batches);
  const arrivedBatches = batches.filter((b) => b.status === 'arrived');

  const handleSearch = () => {
    if (!searchInput.trim()) return;

    const order = findOrderByPhoneOrCode(searchInput.trim(), selectedBatchId);
    setFoundOrder(order || null);
    setEnqueueSuccess(false);
  };

  const handleEnqueue = () => {
    if (!foundOrder) return;

    if (foundOrder.queueStatus === 'waiting' || foundOrder.queueStatus === 'called') {
      setSuccessMessage('该订单已在排队中');
      setEnqueueSuccess(true);
      setTimeout(() => setEnqueueSuccess(false), 3000);
      return;
    }

    enqueue(foundOrder.id);
    const batch = getBatchById(foundOrder.batchId);
    setSuccessMessage(
      `排号成功！${batch?.needRefrigeration ? '冷藏商品，优先处理。' : ''}您的号码是 ${foundOrder.queueNumber || queueState.currentNumber + 1} 号`
    );
    setEnqueueSuccess(true);
    setFoundOrder(null);
    setSearchInput('');
    setTimeout(() => setEnqueueSuccess(false), 4000);
  };

  const handleCallNext = () => {
    callNext();
  };

  const handleMarkPicked = () => {
    if (queueState.calledOrder) {
      markPicked(queueState.calledOrder.id);
    }
  };

  const handleRespeak = () => {
    if (queueState.calledOrder?.queueNumber) {
      speakQueueNumber(
        queueState.calledOrder.queueNumber,
        queueState.calledOrder.customerName
      );
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-600" />
            顾客取号
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择团购批次（可选）
            </label>
            <select
              value={selectedBatchId || ''}
              onChange={(e) => setSelectedBatchId(e.target.value || undefined)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            >
              <option value="">全部批次</option>
              {arrivedBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.productName}
                  {batch.needRefrigeration && ' ❄️'}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              手机号或取货码
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入手机号后4位或取货码"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                查询
              </button>
            </div>
          </div>

          {foundOrder && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{foundOrder.customerName}</p>
                  <p className="text-sm text-slate-500">{foundOrder.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-white px-3 py-2 rounded">
                  <span className="text-slate-500">商品：</span>
                  <span className="font-medium">
                    {getBatchById(foundOrder.batchId)?.productName}
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded">
                  <span className="text-slate-500">数量：</span>
                  <span className="font-medium">{foundOrder.quantity} 份</span>
                </div>
                <div className="bg-white px-3 py-2 rounded">
                  <span className="text-slate-500">取货码：</span>
                  <span className="font-mono font-medium">{foundOrder.pickupCode}</span>
                </div>
                <div className="bg-white px-3 py-2 rounded">
                  <span className="text-slate-500">状态：</span>
                  <span
                    className={cn(
                      'font-medium',
                      foundOrder.paymentStatus === 'paid'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    )}
                  >
                    {foundOrder.paymentStatus === 'paid' ? '已付款' : '未付款'}
                  </span>
                </div>
              </div>
              {foundOrder.isPriority && (
                <div className="bg-cyan-50 text-cyan-700 px-3 py-2 rounded text-sm flex items-center gap-2 mb-3">
                  <Snowflake className="w-4 h-4" />
                  冷藏商品，取货时将优先叫号
                </div>
              )}
              {foundOrder.notes && (
                <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded text-sm">
                  备注：{foundOrder.notes}
                </div>
              )}
              <button
                onClick={handleEnqueue}
                disabled={foundOrder.queueStatus === 'waiting' || foundOrder.queueStatus === 'called'}
                className={cn(
                  'w-full mt-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                  foundOrder.queueStatus === 'waiting' || foundOrder.queueStatus === 'called'
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                )}
              >
                <QrCode className="w-4 h-4" />
                {foundOrder.queueStatus === 'waiting' || foundOrder.queueStatus === 'called'
                  ? '已在排队中'
                  : '加入排队'}
              </button>
            </div>
          )}

          {enqueueSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">当前叫号</h3>
          {queueState.calledOrder ? (
            <div className="text-center">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white mb-4 animate-pulse">
                <p className="text-sm opacity-80 mb-2">请取货</p>
                <div className="text-7xl font-bold font-mono mb-2">
                  {queueState.calledOrder.queueNumber?.toString().padStart(3, '0')}
                </div>
                <p className="text-xl font-medium">{queueState.calledOrder.customerName}</p>
                {queueState.calledOrder.isPriority && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <Snowflake className="w-3 h-3" />
                    冷藏商品
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRespeak}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  重播
                </button>
                <button
                  onClick={handleMarkPicked}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  已取货
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-2" />
              <p>暂无叫号</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">叫号操作</h3>
            <span className="text-sm text-slate-500">
              等待 {queueState.waitingQueue.length} 人
            </span>
          </div>
          <button
            onClick={handleCallNext}
            disabled={queueState.calledOrder !== null || queueState.waitingQueue.length === 0}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2',
              queueState.calledOrder !== null || queueState.waitingQueue.length === 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30 active:scale-95'
            )}
          >
            <SkipForward className="w-5 h-5" />
            {queueState.calledOrder ? '请先完成当前叫号' : '叫下一位'}
          </button>
          {queueState.calledOrder && (
            <p className="text-center text-amber-600 text-sm mt-2">
              当前有正在叫号的订单，请先标记已取货或等待超时
            </p>
          )}
          {!queueState.calledOrder && queueState.waitingQueue.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-2">
              等待队列为空
            </p>
          )}
        </div>
      </div>

      <div className="col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            等待队列
            <span className="ml-auto text-sm font-normal text-slate-500">
              共 {queueState.waitingQueue.length} 人
            </span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {queueState.waitingQueue.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>暂无等待</p>
              </div>
            ) : (
              queueState.waitingQueue.map((order, index) => {
                const batch = getBatchById(order.batchId);
                return (
                  <div
                    key={order.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      order.isPriority
                        ? 'border-cyan-300 bg-cyan-50/50'
                        : 'border-slate-200 bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono',
                          order.isPriority
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        )}
                      >
                        {order.queueNumber?.toString().padStart(3, '0').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {order.queueNumber?.toString().padStart(3, '0')} 号
                          </span>
                          {order.isPriority && (
                            <Snowflake className="w-3 h-3 text-cyan-500" />
                          )}
                          {order.callCount > 1 && (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {order.customerName} · {batch?.productName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">预计等待</p>
                        <p className="text-sm font-medium text-slate-600">
                          {calculateEstimatedWaitTime(index + 1)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
