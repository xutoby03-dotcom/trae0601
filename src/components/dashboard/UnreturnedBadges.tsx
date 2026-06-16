import { useEffect, useState } from 'react';
import { User, MapPin, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Visitor, Badge } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatTime, getCountdown } from '../../utils/time';

interface UnreturnedBadgesProps {
  onReturn: (visitor: Visitor) => void;
  onReportLost: (visitor: Visitor) => void;
}

export const UnreturnedBadges = ({ onReturn, onReportLost }: UnreturnedBadgesProps) => {
  const getUnreturnedVisitors = useBadgeStore((s) => s.getUnreturnedVisitors);
  const getBadgeById = useBadgeStore((s) => s.getBadgeById);
  const updateOvertimeStatus = useBadgeStore((s) => s.updateOvertimeStatus);
  const [, setTick] = useState(0);

  const visitors = getUnreturnedVisitors();

  useEffect(() => {
    const interval = setInterval(() => {
      updateOvertimeStatus();
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [updateOvertimeStatus]);

  if (visitors.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">所有工牌已归还</h3>
        <p className="text-sm text-neutral-500">当前没有未归还的工牌</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          未归还工牌
          <span className="ml-2 text-sm font-normal text-neutral-500">
            共 {visitors.length} 张
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visitors.map((visitor) => {
          const badge = getBadgeById(visitor.badgeId);
          const isOvertime = visitor.status === 'overtime';

          return (
            <div
              key={visitor.id}
              className={`card p-4 transition-all duration-200 ${
                isOvertime ? 'border-2 border-danger animate-pulse-border' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
                  style={{ backgroundColor: badge?.colorHex || '#6b7280' }}
                >
                  {badge?.number || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-neutral-800 truncate">
                      {visitor.name}
                    </h4>
                    {isOvertime ? (
                      <span className="tag-danger">
                        <AlertTriangle size={12} className="mr-1" />
                        超时
                      </span>
                    ) : (
                      <span className="tag-warning">在场</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate mb-1">
                    {visitor.company}
                  </p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <User size={12} />
                    拜访：{visitor.hostName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <MapPin size={12} className="text-neutral-400" />
                  <span>{badge?.allowedArea || '未知区域'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Clock size={12} />
                    <span>入场 {formatTime(visitor.checkInTime)}</span>
                  </div>
                  <span
                    className={`font-mono font-medium ${
                      isOvertime ? 'text-danger' : 'text-warning'
                    }`}
                  >
                    {getCountdown(visitor.expectedLeaveTime)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onReturn(visitor)}
                  className="btn-success flex-1 text-xs py-1.5"
                >
                  归还工牌
                  <ArrowRight size={14} className="ml-1" />
                </button>
                <button
                  onClick={() => onReportLost(visitor)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  遗失
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
