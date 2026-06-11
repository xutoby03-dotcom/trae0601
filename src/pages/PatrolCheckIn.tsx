import { useState, useMemo } from 'react';
import {
  MapPin,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Footprints,
  ChevronRight,
  StopCircle,
  User,
} from 'lucide-react';
import { usePatrolStore } from '@/store/usePatrolStore';
import type { PatrolPoint, PatrolRoute } from '@/types/patrol';
import {
  formatDateTime,
  getRiskLevelText,
  getRiskLevelColor,
} from '@/utils/helpers';
import CheckInModal from '@/components/modals/CheckInModal';

type PointStatus = 'pending' | 'checked' | 'missed' | 'abnormal';

export default function PatrolCheckIn() {
  const {
    routes,
    patrolRecords,
    currentOfficerId,
    officers,
    startPatrol,
    completePatrol,
    checkInPoint,
    getCheckInsByRecord,
  } = usePatrolStore();

  const [selectedRoute, setSelectedRoute] = useState<PatrolRoute | null>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [activePoint, setActivePoint] = useState<PatrolPoint | null>(null);

  const activeRecord = useMemo(
    () => patrolRecords.find((r) => r.id === activeRecordId),
    [patrolRecords, activeRecordId]
  );

  const currentOfficer = officers.find((o) => o.id === currentOfficerId);

  const checkIns = useMemo(() => {
    if (!activeRecordId) return [];
    return getCheckInsByRecord(activeRecordId);
  }, [activeRecordId, getCheckInsByRecord]);

  const getPointStatus = (point: PatrolPoint): PointStatus => {
    const checkIn = checkIns.find((c) => c.pointId === point.id);
    if (!checkIn) return 'pending';
    if (checkIn.isMissed) return 'missed';
    if (checkIn.isAbnormal) return 'abnormal';
    return 'checked';
  };

  const sortedPoints = useMemo(() => {
    if (!selectedRoute) return [];
    return [...selectedRoute.points].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [selectedRoute]);

  const progress = useMemo(() => {
    if (!selectedRoute || sortedPoints.length === 0) return 0;
    const done = sortedPoints.filter(
      (p) => getPointStatus(p) !== 'pending'
    ).length;
    return Math.round((done / sortedPoints.length) * 100);
  }, [sortedPoints, checkIns]);

  const handleStartPatrol = () => {
    if (!selectedRoute) return;
    const id = startPatrol(selectedRoute.id, currentOfficerId);
    setActiveRecordId(id);
  };

  const handleOpenCheckIn = (point: PatrolPoint) => {
    const status = getPointStatus(point);
    if (status !== 'pending') return;
    setActivePoint(point);
    setCheckInModalOpen(true);
  };

  const handleCheckIn = (data: {
    isAbnormal: boolean;
    abnormalDescription?: string;
    handlingResult?: string;
    photoUrl?: string;
  }) => {
    if (!activeRecordId || !activePoint) return;
    checkInPoint(activeRecordId, activePoint.id, data);
  };

  const handleComplete = () => {
    if (!activeRecordId) return;
    completePatrol(activeRecordId);
    const missedPoints = sortedPoints.filter((p) => getPointStatus(p) === 'pending');
    missedPoints.forEach((p) => {
      usePatrolStore.getState().markMissed(activeRecordId, p.id);
    });
    setActiveRecordId(null);
    setSelectedRoute(null);
  };

  if (!selectedRoute) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">巡逻打卡</h1>
          <p className="text-slate-400 text-sm mt-1">选择要执行的巡逻路线开始打卡</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="card card-hover p-5 animate-fade-in-up"
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-700/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">{route.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{route.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Footprints className="w-4 h-4" />
                  {route.points.length} 个点位
                </div>
                <span className="text-primary-400 text-sm font-medium">选择路线</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setSelectedRoute(null); setActiveRecordId(null); }}
            className="btn-secondary !py-2 !px-3 text-sm"
          >
            ← 返回
          </button>
          <div>
            <h1 className="page-title">{selectedRoute.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{selectedRoute.description}</p>
          </div>
        </div>
        {!activeRecord ? (
          <button onClick={handleStartPatrol} className="btn-success">
            <Play className="w-4 h-4" />
            开始巡逻
          </button>
        ) : (
          <button onClick={handleComplete} className="btn-warning">
            <StopCircle className="w-4 h-4" />
            结束巡逻
          </button>
        )}
      </div>

      {activeRecord && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                {currentOfficer?.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{currentOfficer?.name}</span>
                  <span className="tag bg-emerald-900/30 text-emerald-400 border-emerald-800/50">
                    正在巡逻中
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  开始时间：{formatDateTime(activeRecord.startTime)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{progress}%</p>
              <p className="text-slate-400 text-xs">完成进度</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="section-title">点位打卡</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sortedPoints.map((point, idx) => {
            const status = getPointStatus(point);
            const checkIn = checkIns.find((c) => c.pointId === point.id);
            const isClickable = activeRecord && status === 'pending';

            const statusStyles = {
              pending: isClickable
                ? 'border-slate-600 hover:border-primary-500 cursor-pointer hover:shadow-lg hover:shadow-primary-700/20'
                : 'border-slate-700/50 opacity-60',
              checked: 'border-emerald-600/50 bg-emerald-950/20',
              missed: 'border-orange-500/50 bg-orange-950/30 animate-pulse-border',
              abnormal: 'border-red-500/50 bg-red-950/20',
            };

            return (
              <div
                key={point.id}
                onClick={() => handleOpenCheckIn(point)}
                className={`p-4 rounded-2xl bg-slate-800/60 backdrop-blur-sm border transition-all duration-300 ${statusStyles[status]}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        status === 'checked'
                          ? 'bg-emerald-600 text-white'
                          : status === 'missed'
                          ? 'bg-orange-500 text-white'
                          : status === 'abnormal'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {status === 'checked' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : status === 'missed' ? (
                        <XCircle className="w-5 h-5" />
                      ) : status === 'abnormal' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm truncate">{point.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`tag ${getRiskLevelColor(point.riskLevel)} !text-[10px] !py-px`}>
                          {getRiskLevelText(point.riskLevel)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {point.suggestedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {checkIn?.arrivalTime && (
                  <div className="pt-2 border-t border-slate-700/30">
                    <p className="text-xs text-slate-400">
                      <User className="w-3 h-3 inline mr-1" />
                      {formatDateTime(checkIn.arrivalTime)}
                    </p>
                    {checkIn.isAbnormal && (
                      <p className="text-xs text-red-400 mt-1 line-clamp-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {checkIn.abnormalDescription}
                      </p>
                    )}
                  </div>
                )}

                {checkIn?.isMissed && (
                  <div className="pt-2 border-t border-slate-700/30">
                    <p className="text-xs text-orange-400">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      未打卡
                    </p>
                  </div>
                )}

                {status === 'pending' && !activeRecord && (
                  <div className="pt-2 border-t border-slate-700/30">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      开始巡逻后可打卡
                    </p>
                  </div>
                )}

                {status === 'pending' && activeRecord && (
                  <div className="pt-2 border-t border-slate-700/30">
                    <p className="text-xs text-primary-400 flex items-center gap-1">
                      <Footprints className="w-3 h-3" />
                      点击打卡
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CheckInModal
        open={checkInModalOpen}
        onClose={() => { setCheckInModalOpen(false); setActivePoint(null); }}
        onSubmit={handleCheckIn}
        point={activePoint}
      />
    </div>
  );
}
