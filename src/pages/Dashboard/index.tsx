import { useEffect, useState, useRef } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, ChevronRight, Phone, Users as UsersIcon, Home, Wifi, Info, CheckCircle2 } from 'lucide-react';
import { useElderlyStore } from '@/store/elderlyStore';
import { useCheckInStore } from '@/store/checkInStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { Elderly, ExceptionRecord } from '@/types';
import { isTimePassed, formatTimeAgo, getTimeString } from '@/utils/date';
import { sourceConfig } from '@/utils/source';
import SourceBadge from '@/components/SourceBadge';
import StatusBadge from '@/components/StatusBadge';
import CheckInModal from '@/components/CheckInModal';
import { mockGrids } from '@/data/grids';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
}

export default function Dashboard() {
  const { elderlyList, initElderly } = useElderlyStore();
  const { checkInRecords, initCheckIns, getTodayUnconfirmed, getTodayStats, getTodayStatus } = useCheckInStore();
  const { exceptions, initExceptions, getOpenExceptions, getEscalatedExceptions, processTimeouts } = useExceptionStore();
  const [selectedElderly, setSelectedElderly] = useState<Elderly | null>(null);
  const [currentGrid, setCurrentGrid] = useState<string>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const hasProcessedRef = useRef(false);

  const addToast = (type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}-${toastIdRef.current++}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const runTimeoutCheck = (showToastAlways = false) => {
    const allIds = elderlyList.map(e => e.id);
    if (allIds.length === 0) return;
    const unconfirmedIds = getTodayUnconfirmed(allIds);
    const result = processTimeouts(unconfirmedIds);

    if (result.created > 0 || result.escalated > 0) {
      const parts: string[] = [];
      if (result.created > 0) parts.push(`${result.created} 条超时提醒`);
      if (result.escalated > 0) parts.push(`${result.escalated} 条升级告警`);
      addToast('warning', `已自动生成：${parts.join('、')}`);
    } else if (showToastAlways) {
      if (isTimePassed(12) && unconfirmedIds.length === 0) {
        addToast('success', '12:00 检查完成，今日无未处理的超时异常');
      } else if (isTimePassed(10)) {
        addToast('info', `10:00 超时检查完成，当前 ${unconfirmedIds.length} 位老人未确认`);
      }
    }
  };

  useEffect(() => {
    initElderly();
    initCheckIns();
    initExceptions();
  }, [initElderly, initCheckIns, initExceptions]);

  useEffect(() => {
    if (elderlyList.length === 0 || hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    runTimeoutCheck(true);
  }, [elderlyList, exceptions]);

  useEffect(() => {
    const interval = setInterval(() => {
      runTimeoutCheck(false);
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [elderlyList]);

  const filteredElderly = currentGrid === 'all' 
    ? elderlyList 
    : elderlyList.filter(e => e.gridId === currentGrid);

  const allIds = filteredElderly.map(e => e.id);
  const stats = getTodayStats(allIds);
  const unconfirmedIds = getTodayUnconfirmed(allIds);
  
  const openExceptions = getOpenExceptions().filter(e => 
    currentGrid === 'all' || filteredElderly.find(el => el.id === e.elderlyId)
  );
  const escalatedExceptions = getEscalatedExceptions().filter(e => 
    e.type === 'timeout' &&
    (currentGrid === 'all' || filteredElderly.find(el => el.id === e.elderlyId))
  );

  const unconfirmedElderly = unconfirmedIds
    .map(id => elderlyList.find(e => e.id === id))
    .filter(Boolean) as Elderly[];

  const sortedUnconfirmed = [...unconfirmedElderly].sort((a, b) => {
    const aException = openExceptions.find(e => e.elderlyId === a.id);
    const bException = openExceptions.find(e => e.elderlyId === b.id);
    
    if (aException?.status === 'escalated' && bException?.status !== 'escalated') return -1;
    if (bException?.status === 'escalated' && aException?.status !== 'escalated') return 1;
    
    if (aException?.status === 'processing' && bException?.status === 'pending') return -1;
    if (bException?.status === 'processing' && aException?.status === 'pending') return 1;
    
    const aHasSeriousDisease = a.chronicDiseases.includes('心脏病') || a.chronicDiseases.includes('阿尔茨海默症');
    const bHasSeriousDisease = b.chronicDiseases.includes('心脏病') || b.chronicDiseases.includes('阿尔茨海默症');
    if (aHasSeriousDisease && !bHasSeriousDisease) return -1;
    if (!aHasSeriousDisease && bHasSeriousDisease) return 1;
    
    return b.age - a.age;
  });

  const statsCards = [
    {
      label: '今日应确认',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: '已确认平安',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      label: '未报平安',
      value: stats.unconfirmed,
      icon: Clock,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      pulse: isTimePassed(10) && stats.unconfirmed > 0,
    },
    {
      label: '异常处理中',
      value: openExceptions.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-700',
      pulse: openExceptions.length > 0,
    },
  ];

  const getExceptionForElderly = (elderlyId: string): ExceptionRecord | undefined => {
    return openExceptions.find(e => e.elderlyId === elderlyId);
  };

  const getUrgencyLevel = (elderly: Elderly, exception?: ExceptionRecord): { label: string; color: string } => {
    if (exception?.status === 'escalated') {
      return { label: '紧急', color: 'bg-red-500' };
    }
    if (exception?.status === 'processing') {
      return { label: '处理中', color: 'bg-blue-500' };
    }
    if (elderly.chronicDiseases.includes('心脏病') || elderly.chronicDiseases.includes('阿尔茨海默症')) {
      return { label: '重点关注', color: 'bg-orange-500' };
    }
    if (isTimePassed(10)) {
      return { label: '已超时', color: 'bg-amber-500' };
    }
    return { label: '待确认', color: 'bg-slate-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">网格筛选</h3>
          <p className="text-sm text-slate-500">选择查看指定网格的数据</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentGrid('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentGrid === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部网格
          </button>
          {mockGrids.map(grid => (
            <button
              key={grid.id}
              onClick={() => setCurrentGrid(grid.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentGrid === grid.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {grid.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, index) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 ${card.pulse ? 'animate-pulse' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                <p className={`text-4xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className={`text-xs ${card.textColor} flex items-center gap-1`}>
                <div className={`w-2 h-2 rounded-full ${card.color}`} />
                实时数据
              </div>
            </div>
          </div>
        ))}
      </div>

      {escalatedExceptions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 p-2 rounded-full text-white animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">升级告警 - 需社区负责人关注</h3>
              <p className="text-sm text-red-600">以下异常已超过12:00仍未处理，已自动升级</p>
            </div>
          </div>
          <div className="space-y-3">
            {escalatedExceptions.map(exception => {
              const elderly = elderlyList.find(e => e.id === exception.elderlyId);
              if (!elderly) return null;
              return (
                <div key={exception.id} className="bg-white rounded-xl p-4 flex items-center justify-between border border-red-200">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{elderly.avatar}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{elderly.name}</p>
                      <p className="text-sm text-slate-500">
                        {elderly.building} {elderly.unit} {elderly.roomNumber} · {elderly.age}岁
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        升级时间：{exception.escalationTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={exception.status} />
                    <button
                      onClick={() => setSelectedElderly(elderly)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      立即处理
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">今日未报平安</h3>
            <p className="text-sm text-slate-500">
              共 {sortedUnconfirmed.length} 位老人尚未确认平安
              {isTimePassed(10) && <span className="text-orange-600 ml-2">· 已过10:00约定时间</span>}
            </p>
          </div>
        </div>

        {sortedUnconfirmed.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">今日全员平安！</h4>
            <p className="text-slate-500">所有老人都已确认平安，您辛苦了</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedUnconfirmed.map((elderly, index) => {
              const exception = getExceptionForElderly(elderly.id);
              const urgency = getUrgencyLevel(elderly, exception);
              const todayStatus = getTodayStatus(elderly.id);
              
              return (
                <div
                  key={elderly.id}
                  className={`bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300 group ${
                    exception?.status === 'escalated' ? 'ring-2 ring-red-300' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <span className="text-4xl">{elderly.avatar}</span>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${urgency.color} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-lg">{elderly.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {elderly.building} {elderly.unit} {elderly.roomNumber} · {elderly.age}岁
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-500">常用方式：</span>
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {sourceConfig[`${elderly.preferredCheckMethod === 'phone' ? 'elderly_phone' : 
                              elderly.preferredCheckMethod === 'family' ? 'family_report' :
                              elderly.preferredCheckMethod === 'device' ? 'smart_device' : 'home_visit'}`]?.label}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">慢病：</span>
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {elderly.chronicDiseases}
                          </span>
                        </div>
                        {exception?.handlingNotes && (
                          <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                            💬 {exception.handlingNotes}
                          </p>
                        )}
                        {todayStatus && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">上次确认：</span>
                            <SourceBadge source={todayStatus.source} size="sm" />
                            <span className="text-xs text-slate-400">{formatTimeAgo(todayStatus.checkTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600 font-mono">{elderly.emergencyContactPhone}</span>
                      </div>
                      {exception && <StatusBadge status={exception.status} />}
                      <button
                        onClick={() => setSelectedElderly(elderly)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 group-hover:scale-105"
                      >
                        <CheckCircle size={18} />
                        确认平安
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedElderly && (
        <CheckInModal
          elderly={selectedElderly}
          onClose={() => setSelectedElderly(null)}
        />
      )}

      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => {
          const colorMap = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
          };
          const iconMap = {
            info: <Info size={18} className="text-blue-600" />,
            success: <CheckCircle2 size={18} className="text-green-600" />,
            warning: <AlertTriangle size={18} className="text-amber-600" />,
          };
          return (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-xl border shadow-lg flex items-center gap-3 fade-in pointer-events-auto min-w-[280px] ${colorMap[toast.type]}`}
            >
              {iconMap[toast.type]}
              <span className="text-sm font-medium">{toast.message}</span>
              <span className="text-xs opacity-60 ml-auto">{getTimeString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
