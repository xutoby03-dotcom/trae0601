import { useState, useEffect } from 'react';
import { Bell, Users, DoorOpen, TrendingUp, Clock, AlertTriangle, Megaphone, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
import FittingRoomCard from '@/components/FittingRoomCard';
import QueueItemCard from '@/components/QueueItemCard';
import CompleteFittingModal from '@/components/CompleteFittingModal';
import type { QueueItem } from '../../shared/types';

export default function Dashboard() {
  const { rooms, queue, stats, leftItems, currentCalledNumber, callNext, loading, checkTimeouts } = useStore();
  const [completingItem, setCompletingItem] = useState<QueueItem | null>(null);
  const [showCallAnimation, setShowCallAnimation] = useState(false);

  const waitingQueue = queue.filter(q => q.status === 'waiting').sort((a, b) => a.createdAt - b.createdAt);
  const calledQueue = queue.filter(q => q.status === 'called').sort((a, b) => (a.calledAt || 0) - (b.calledAt || 0));
  const fittingQueue = queue.filter(q => q.status === 'fitting');
  const timeoutQueue = queue.filter(q => q.status === 'timeout').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)).slice(0, 3);
  const availableRooms = rooms.filter(r => r.status === 'available' && r.cleanStatus === 'clean');

  useEffect(() => {
    if (currentCalledNumber) {
      setShowCallAnimation(true);
      const timer = setTimeout(() => setShowCallAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentCalledNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkTimeouts();
    }, 1000);
    return () => clearInterval(interval);
  }, [checkTimeouts]);

  const handleCallNext = async () => {
    await callNext();
  };

  const statsCards = [
    {
      label: '排队人数',
      value: waitingQueue.length,
      icon: Users,
      color: 'text-champagne-400',
      bgColor: 'bg-champagne-400/10',
    },
    {
      label: '可用试衣间',
      value: availableRooms.length,
      icon: DoorOpen,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: '试衣中',
      value: fittingQueue.length,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: '整体转化率',
      value: stats ? `${stats.overallRate.toFixed(1)}%` : '--',
      icon: TrendingUp,
      color: 'text-burgundy-400',
      bgColor: 'bg-burgundy-400/10',
    },
  ];

  return (
    <div className="space-y-6">
      {showCallAnimation && currentCalledNumber && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-burgundy-700 text-white px-16 py-8 rounded-3xl shadow-2xl animate-calling">
            <div className="flex items-center gap-4">
              <Megaphone className="w-12 h-12" />
              <div>
                <p className="text-champagne-300 text-lg">请前往试衣间</p>
                <p className="font-display text-7xl font-bold text-shadow-gold">
                  {currentCalledNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {completingItem && (
        <CompleteFittingModal item={completingItem} onClose={() => setCompletingItem(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-cream-100">实时看板</h2>
          <p className="text-cream-400 mt-1">试衣间状态一览，高效管理顾客排队</p>
        </div>
        <button
          onClick={handleCallNext}
          disabled={loading || waitingQueue.length === 0 || availableRooms.length === 0}
          className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
        >
          <Megaphone className="w-6 h-6" />
          叫号下一位
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-charcoal-500 text-sm">{stat.label}</p>
                  <p className={`font-display text-4xl font-bold mt-2 ${stat.color} animate-number-change`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-charcoal-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-champagne-500" />
                等待队列
                <span className="text-sm font-normal text-charcoal-500">({waitingQueue.length}人)</span>
              </h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-2">
              {waitingQueue.length === 0 ? (
                <div className="text-center py-8 text-charcoal-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无排队顾客</p>
                </div>
              ) : (
                waitingQueue.map(item => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    showActions={false}
                  />
                ))
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-xl text-charcoal-800 mb-4 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-champagne-500" />
              试衣间状态
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {rooms.map(room => (
                <FittingRoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {calledQueue.length > 0 && (
            <div className="card p-5 border-2 border-burgundy-400">
              <h3 className="font-display text-lg text-burgundy-700 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 animate-bounce-soft" />
                已叫号等待进入
              </h3>
              <div className="space-y-3">
                {calledQueue.map(item => (
                  <QueueItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {fittingQueue.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-lg text-charcoal-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                试衣中
              </h3>
              <div className="space-y-3">
                {fittingQueue.map(item => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    onComplete={() => setCompletingItem(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {timeoutQueue.length > 0 && (
            <div className="card p-5 bg-red-50 border-red-200">
              <h3 className="font-display text-lg text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                超时号码
              </h3>
              <div className="space-y-2">
                {timeoutQueue.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-red-700">{item.queueNumber}</span>
                    <span className="text-charcoal-500">
                      {item.customerName || `尾号${item.phoneLast4}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leftItems.length > 0 && (
            <div className="card p-5 bg-yellow-50 border-yellow-200">
              <h3 className="font-display text-lg text-yellow-700 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                遗落物品提醒
              </h3>
              <div className="space-y-2">
                {leftItems.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-charcoal-700">
                        {item.roomNumber}号 · {item.queueNumber}号顾客
                      </span>
                    </div>
                    <div className="text-yellow-700 mt-1">
                      {item.items.join('、')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats && (
            <div className="card p-5">
              <h3 className="font-display text-lg text-charcoal-800 mb-4">今日转化率趋势</h3>
              <div className="space-y-3">
                {stats.hourlyData.filter(h => h.queueCount > 0).slice(-6).map(hour => {
                  const rate = hour.enteredCount > 0 ? (hour.purchasedCount / hour.enteredCount) * 100 : 0;
                  return (
                    <div key={hour.hour} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-600">{hour.hour}</span>
                        <span className="text-charcoal-700 font-medium">
                          {hour.purchasedCount}/{hour.enteredCount}
                          <span className="text-burgundy-600 ml-1">{rate.toFixed(0)}%</span>
                        </span>
                      </div>
                      <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-burgundy-600 to-champagne-500 transition-all duration-500"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
