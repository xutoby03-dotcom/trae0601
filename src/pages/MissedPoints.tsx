import { useMemo } from 'react';
import {
  XCircle,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { usePatrolStore } from '@/store/usePatrolStore';
import { formatDateTime, getRiskLevelText, getRiskLevelColor } from '@/utils/helpers';
import { Link } from 'react-router-dom';

export default function MissedPoints() {
  const missedData = usePatrolStore((s) => s.getMissedCheckIns());

  const sortedData = useMemo(
    () =>
      [...missedData].sort(
        (a, b) => new Date(b.record.startTime).getTime() - new Date(a.record.startTime).getTime()
      ),
    [missedData]
  );

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof sortedData> = {};
    sortedData.forEach((item) => {
      const date = new Date(item.record.startTime).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  }, [sortedData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">漏打卡点位</h1>
          <p className="text-slate-400 text-sm mt-1">所有未按时打卡的点位，独立展示不隐藏</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card px-5 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-900/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">漏打卡总数</p>
              <p className="text-xl font-bold text-orange-400">{sortedData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="text-white text-lg font-medium mb-1">太棒了！</p>
          <p className="text-slate-400">暂无漏打卡记录，所有点位都按时完成</p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h3 className="text-white font-medium">{date}</h3>
              <span className="tag bg-orange-900/30 text-orange-400 border-orange-800/50">
                {items.length} 个漏打卡
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map(({ point, route, officer, record }) => (
                <div
                  key={`${record.id}-${point.id}`}
                  className="card overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-slate-800/60 animate-pulse-border animate-fade-in-up"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{point.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`tag ${getRiskLevelColor(point.riskLevel)} !text-[10px] !py-px`}>
                              {getRiskLevelText(point.riskLevel)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              {route.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          建议时间
                        </span>
                        <span className="text-xs font-medium text-orange-400">
                          {point.suggestedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          巡逻员
                        </span>
                        <span className="text-xs font-medium text-white">{officer.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          巡逻日期
                        </span>
                        <span className="text-xs text-slate-300">
                          {formatDateTime(record.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/patrol"
                    className="flex items-center justify-center gap-1 py-2.5 border-t border-slate-700/30 text-xs text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 transition-colors"
                  >
                    去巡逻
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
