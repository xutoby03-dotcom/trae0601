import React, { useState } from 'react';
import { ClothesRecord } from '../types';
import { useStore } from '../store/useStore';
import { formatDryingDuration, getRemainingTime, formatTime, isOverdue } from '../utils/helpers';
import { Check, Clock, User, Package, AlertTriangle } from 'lucide-react';

interface ClothesCardProps {
  record: ClothesRecord;
  onCollect: (record: ClothesRecord) => void;
}

export const ClothesCard: React.FC<ClothesCardProps> = ({ record, onCollect }) => {
  const { deleteRecord } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const remaining = getRemainingTime(record.startTime, record.expectedDuration);
  const overdue = isOverdue(record.startTime, record.expectedDuration);

  const getStatusColor = () => {
    if (overdue) return 'border-red-400 bg-red-50/50';
    if (record.isThick) return 'border-amber-400 bg-amber-50/50';
    return 'border-green-400 bg-green-50/50';
  };

  const getTimeColor = () => {
    if (remaining.overdue) return 'text-red-600';
    if (remaining.hours < 1) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div
      className={`relative group p-4 rounded-xl border-2 ${getStatusColor()} transition-all duration-300 ${
        isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: isHovered ? 'none' : 'sway 4s ease-in-out infinite',
        animationDelay: `${Math.random() * 2}s`
      }}
    >
      <div className="absolute -top-2 -right-2 flex gap-1">
        {record.isThick && (
          <span className="chip-warm text-xs">🧥 厚衣</span>
        )}
        {overdue && (
          <span className="chip-danger text-xs animate-pulse">⏰ 超时</span>
        )}
        {record.remindCount > 0 && (
          <span className="chip-warning text-xs">🔔 {record.remindCount}</span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="text-4xl animate-float" style={{ animationDelay: `${Math.random()}s` }}>
          {record.clothingTypeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              {record.clothingTypeLabel} × {record.quantity}
            </h4>
          </div>

          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} />
              <span className="inline-flex items-center gap-1">
                <span>{record.responsiblePersonAvatar}</span>
                <span>{record.responsiblePerson}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} />
              <span>已晾 {formatDryingDuration(record.startTime)}</span>
              <span className="text-gray-300">|</span>
              <span>开始 {formatTime(record.startTime)}</span>
            </div>
            <div className={`flex items-center gap-2 ${getTimeColor()}`}>
              {remaining.overdue ? (
                <AlertTriangle size={14} className="animate-pulse" />
              ) : (
                <Package size={14} />
              )}
              <span className="font-medium">{remaining.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-3 flex gap-2 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <button
          onClick={() => onCollect(record)}
          className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
        >
          <Check size={16} />
          收衣
        </button>
        <button
          onClick={() => {
            if (confirm('确定要删除这条记录吗？')) {
              deleteRecord(record.id);
            }
          }}
          className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-all"
        >
          删除
        </button>
      </div>
    </div>
  );
};
