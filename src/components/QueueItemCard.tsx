import { User, Users, Shirt, Clock, Check, X } from 'lucide-react';
import type { QueueItem } from '../../shared/types';
import { statusLabels, getWaitTime, formatDuration, getCountdown } from '@/utils/format';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

interface Props {
  item: QueueItem;
  showActions?: boolean;
  onComplete?: () => void;
}

export default function QueueItemCard({ item, showActions = true, onComplete }: Props) {
  const { confirmEnter, completeFitting, timeoutThreshold } = useStore();
  const [countdown, setCountdown] = useState({ remaining: 0, isUrgent: false });

  useEffect(() => {
    if (item.status === 'called' && item.calledAt) {
      const update = () => setCountdown(getCountdown(item.calledAt!, timeoutThreshold));
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [item.status, item.calledAt, timeoutThreshold]);

  const statusInfo = statusLabels[item.status];

  return (
    <div className="card p-4 animate-slide-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl font-bold ${
            item.status === 'called' ? 'bg-burgundy-700 text-white animate-calling' :
            item.status === 'fitting' ? 'bg-blue-600 text-white' :
            item.status === 'timeout' ? 'bg-red-600 text-white' :
            'bg-champagne-400 text-charcoal-800'
          }`}>
            {item.queueNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-charcoal-800 flex items-center gap-1">
                <User className="w-4 h-4" />
                {item.customerName || `尾号${item.phoneLast4}`}
              </span>
              <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-charcoal-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {item.peopleCount}人
              </span>
              <span className="flex items-center gap-1">
                <Shirt className="w-3 h-3" /> {item.itemsCount}件
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> 等待{getWaitTime(item.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {item.status === 'called' && (
          <div className={`text-right ${countdown.isUrgent ? 'animate-pulse' : ''}`}>
            <div className={`text-2xl font-bold font-display ${countdown.isUrgent ? 'text-red-600' : 'text-burgundy-700'}`}>
              {formatDuration(countdown.remaining)}
            </div>
            <div className="text-xs text-charcoal-500">剩余时间</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-charcoal-500">重点尺码：</span>
            <span className="font-medium text-charcoal-700">{item.keySizes.join('、') || '-'}</span>
          </div>
          {item.roomNumber && (
            <div>
              <span className="text-charcoal-500">试衣间：</span>
              <span className="font-medium text-champagne-600">{item.roomNumber}</span>
            </div>
          )}
        </div>
        <div className="text-charcoal-500">
          导购：<span className="font-medium text-charcoal-700">{item.assistantName}</span>
        </div>
      </div>

      {showActions && (item.status === 'called' || item.status === 'fitting') && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-cream-300">
          {item.status === 'called' && (
            <button
              onClick={() => confirmEnter(item.id)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              确认进入
            </button>
          )}
          {item.status === 'fitting' && (
            <button
              onClick={onComplete}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              试衣完成
            </button>
          )}
          {item.status === 'called' && (
            <button
              onClick={() => useStore.getState().markTimeout(item.id)}
              className="btn-danger flex items-center justify-center gap-2 px-4"
            >
              <X className="w-4 h-4" />
              超时
            </button>
          )}
        </div>
      )}
    </div>
  );
}
