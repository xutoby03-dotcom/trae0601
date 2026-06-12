import { useEffect, useState, useMemo } from 'react';
import { Snowflake, Volume2, Clock, Users, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateEstimatedWaitTime, isCallTimedOut } from '../utils/queue';
import { cn } from '@/lib/utils';

export function CallingScreen() {
  const queueState = useAppStore((state) => state.queueState);
  const orders = useAppStore((state) => state.orders);
  const getBatchById = useAppStore((state) => state.getBatchById);
  const checkAndHandleTimeout = useAppStore((state) => state.checkAndHandleTimeout);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flash, setFlash] = useState(false);
  const [lastCalledNumber, setLastCalledNumber] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeoutTimer = setInterval(() => {
      checkAndHandleTimeout();
    }, 5000);
    return () => clearInterval(timeoutTimer);
  }, [checkAndHandleTimeout]);

  useEffect(() => {
    if (
      queueState.calledOrder?.queueNumber &&
      queueState.calledOrder.queueNumber !== lastCalledNumber
    ) {
      setLastCalledNumber(queueState.calledOrder.queueNumber);
      setFlash(true);
      const flashTimer = setInterval(() => {
        setFlash((prev) => !prev);
      }, 500);
      setTimeout(() => {
        clearInterval(flashTimer);
        setFlash(false);
      }, 3000);
      return () => clearInterval(flashTimer);
    }
  }, [queueState.calledOrder?.queueNumber, lastCalledNumber]);

  const isTimedOut = queueState.calledOrder?.calledAt
    ? isCallTimedOut(queueState.calledOrder.calledAt)
    : false;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">团购取货叫号系统</h1>
              <p className="text-slate-400 mt-1">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-mono font-bold text-white tracking-wider">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            <div className="col-span-2 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-slate-400 mb-4 tracking-widest">
                  请您取货 · PLEASE COME FORWARD
                </p>

                {queueState.calledOrder ? (
                  <>
                    <div
                      className={cn(
                        'relative rounded-3xl p-12 mb-6 transition-all duration-300',
                        flash
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 scale-105 shadow-2xl shadow-cyan-500/50'
                          : isTimedOut
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-2xl shadow-cyan-600/30'
                      )}
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 px-6 py-1 rounded-full font-bold text-sm">
                        <Volume2 className="w-4 h-4 inline mr-1" />
                        正在叫号
                      </div>

                      <div className="text-[18vw] font-bold font-mono leading-none tracking-tight">
                        {queueState.calledOrder.queueNumber
                          ?.toString()
                          .padStart(3, '0')}
                      </div>

                      <div className="mt-4 text-3xl font-medium">
                        {queueState.calledOrder.customerName}
                      </div>

                      {queueState.calledOrder.isPriority && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-6 py-2 rounded-full text-xl">
                          <Snowflake className="w-6 h-6" />
                          冷藏商品 · 请尽快取货
                        </div>
                      )}

                      {isTimedOut && (
                        <div className="mt-4 text-amber-200 text-xl animate-pulse">
                          ⚠️ 叫号超时，即将返回队尾
                        </div>
                      )}
                    </div>

                    <div className="text-xl text-slate-400">
                      商品：
                      <span className="text-white font-medium ml-2">
                        {getBatchById(queueState.calledOrder.batchId)?.productName}
                      </span>
                      <span className="mx-3">|</span>
                      数量：
                      <span className="text-white font-medium ml-2">
                        {queueState.calledOrder.quantity} 份
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-800/50 rounded-3xl p-16 mb-6 border border-slate-700">
                    <div className="text-[18vw] font-bold font-mono leading-none text-slate-600">
                      ---
                    </div>
                    <div className="mt-4 text-2xl text-slate-500">
                      等待叫号中...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    等待队列
                  </h3>
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    {queueState.waitingQueue.length} 人等待
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[40vh]">
                  {queueState.waitingQueue.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无等待</p>
                    </div>
                  ) : (
                    queueState.waitingQueue.slice(0, 8).map((order, index) => (
                      <div
                        key={order.id}
                        className={cn(
                          'flex items-center gap-4 p-3 rounded-xl transition-all',
                          order.isPriority
                            ? 'bg-cyan-900/30 border border-cyan-700/50'
                            : 'bg-slate-700/30 border border-slate-600/30'
                        )}
                      >
                        <div
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center font-bold font-mono text-2xl',
                            order.isPriority
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-600 text-slate-200'
                          )}
                        >
                          {order.queueNumber?.toString().padStart(3, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg truncate">
                              {order.customerName}
                            </span>
                            {order.isPriority && (
                              <Snowflake className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 truncate">
                            {getBatchById(order.batchId)?.productName}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-slate-500">预计</p>
                          <p className="text-slate-300 font-medium">
                            {calculateEstimatedWaitTime(index + 1)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {queueState.waitingQueue.length > 8 && (
                    <p className="text-center text-slate-500 text-sm">
                      还有 {queueState.waitingQueue.length - 8} 人等待...
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-emerald-400">
                    {orders.filter((o) => o.queueStatus === 'picked').length}
                  </p>
                  <p className="text-sm text-emerald-400/70">已取货</p>
                </div>
                <div className="bg-amber-900/30 border border-amber-700/50 rounded-2xl p-4 text-center">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-amber-400">
                    {queueState.waitingQueue.length}
                  </p>
                  <p className="text-sm text-amber-400/70">等待中</p>
                </div>
                <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-2xl p-4 text-center">
                  <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-cyan-400">
                    {orders.filter((o) => o.queueStatus !== 'picked' && o.queueStatus !== 'not_queued').length}
                  </p>
                  <p className="text-sm text-cyan-400/70">待取货</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
