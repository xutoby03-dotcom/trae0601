import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Wrench,
  Shield,
  User,
  Clock,
  Filter,
  CheckCircle2,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { usePatrolStore } from '@/store/usePatrolStore';
import type { ExceptionEvent, ExceptionStatus, AssigneeType } from '@/types/patrol';
import {
  formatDateTime,
  getExceptionStatusText,
  getExceptionStatusColor,
  getAssigneeTypeText,
} from '@/utils/helpers';
import AssignModal from '@/components/modals/AssignModal';

export default function ExceptionList() {
  const { exceptionEvents, updateExceptionStatus } = usePatrolStore();
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ExceptionEvent | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const sorted = [...exceptionEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (statusFilter === 'all') return sorted;
    return sorted.filter((e) => e.status === statusFilter);
  }, [exceptionEvents, statusFilter]);

  const statuses: Array<ExceptionStatus | 'all'> = ['all', 'pending', 'assigned', 'processing', 'resolved'];

  const stats = useMemo(() => {
    return {
      total: exceptionEvents.length,
      pending: exceptionEvents.filter((e) => e.status === 'pending').length,
      processing: exceptionEvents.filter((e) => e.status === 'processing' || e.status === 'assigned').length,
      resolved: exceptionEvents.filter((e) => e.status === 'resolved').length,
    };
  }, [exceptionEvents]);

  const handleOpenAssign = (event: ExceptionEvent) => {
    setActiveEvent(event);
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">异常事件</h1>
          <p className="text-slate-400 text-sm mt-1">管理和分派所有巡逻发现的异常事件</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-700/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">异常总数</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">待分派</p>
              <p className="text-2xl font-bold text-red-400">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-900/40 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">处理中</p>
              <p className="text-2xl font-bold text-amber-400">{stats.processing}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">已解决</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                statusFilter === s
                  ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {s === 'all' ? '全部' : getExceptionStatusText(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">暂无异常事件</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedId === event.id;
            return (
              <div
                key={event.id}
                className="card overflow-hidden animate-fade-in-up"
              >
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      event.status === 'resolved'
                        ? 'bg-emerald-900/40'
                        : event.status === 'pending'
                        ? 'bg-red-900/40'
                        : 'bg-amber-900/40'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        event.status === 'resolved'
                          ? 'text-emerald-400'
                          : event.status === 'pending'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white font-medium truncate">{event.description}</p>
                      <span className={`tag ${getExceptionStatusColor(event.status)} flex-shrink-0`}>
                        {getExceptionStatusText(event.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.routeName} · {event.pointName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(event.createdAt)}
                      </span>
                      {event.assigneeName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {event.assigneeType && (
                            <span className={
                              event.assigneeType === 'maintenance' ? 'text-blue-400' : 'text-purple-400'
                            }>
                              {getAssigneeTypeText(event.assigneeType)}
                            </span>
                          )}
                          {' '}{event.assigneeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {event.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAssign(event);
                        }}
                        className="btn-primary !py-1.5 !px-3 text-xs"
                      >
                        分派
                      </button>
                    )}
                    {event.status === 'assigned' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateExceptionStatus(event.id, 'processing');
                        }}
                        className="btn-warning !py-1.5 !px-3 text-xs"
                      >
                        开始处理
                      </button>
                    )}
                    {event.status === 'processing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const result = prompt('请输入处理结果：');
                          if (result !== null) {
                            updateExceptionStatus(event.id, 'resolved', result || '已处理完成');
                          }
                        }}
                        className="btn-success !py-1.5 !px-3 text-xs"
                      >
                        处理完成
                      </button>
                    )}
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-700/30">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-1.5">异常描述</p>
                        <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30">
                          <p className="text-white text-sm">{event.description}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-1.5">分派信息</p>
                          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
                            {event.assigneeType ? (
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    event.assigneeType === 'maintenance'
                                      ? 'bg-blue-900/40'
                                      : 'bg-purple-900/40'
                                  }`}
                                >
                                  {event.assigneeType === 'maintenance' ? (
                                    <Wrench className="w-4 h-4 text-blue-400" />
                                  ) : (
                                    <Shield className="w-4 h-4 text-purple-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {event.assigneeName}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {getAssigneeTypeText(event.assigneeType)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-sm">暂未分派</p>
                            )}
                          </div>
                        </div>
                        {event.handlingResult && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1.5">处理结果</p>
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                              <p className="text-white text-sm">{event.handlingResult}</p>
                              {event.resolvedAt && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {formatDateTime(event.resolvedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AssignModal
        open={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setActiveEvent(null); }}
        event={activeEvent}
      />
    </div>
  );
}
