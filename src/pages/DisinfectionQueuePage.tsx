import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SprayCan,
  Clock,
  AlertTriangle,
  PlayCircle,
  History,
  User,
  UserCheck,
  Box,
  CheckCircle2,
  Inbox,
  FileText,
  Calendar,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { DisinfectionBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime, formatWaitTime, getWaitMinutes, getWaitTimeColor, formatDuration } from '@/lib/format';
import { DisinfectionTask, OVERDUE_THRESHOLD_MINUTES } from '@shared/types';

function DisinfectionQueuePage() {
  const navigate = useNavigate();
  const { disinfectionQueue, fetchDisinfectionQueue, usages, fetchUsages } = useAppStore();
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    loadQueue();
    loadHistory();
    fetchUsages();
  }, []);

  const loadQueue = () => {
    fetchDisinfectionQueue();
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await api.getDisinfectionRecords({ pageSize: 50 });
      setHistory(result.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (usageId: string, taskId: string) => {
    setStartingId(taskId);
    try {
      const task = await api.startDisinfection(usageId);
      navigate(`/disinfection/${task.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStartingId(null);
    }
  };

  const getUsageInfo = (usageId: string) => {
    return usages.find((u) => u.id === usageId);
  };

  const getTotalDuration = (task: any) => {
    if (!task.completedAt) return null;
    const diff = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
    return Math.floor(diff / 60000);
  };

  const getOperator = (task: any) => {
    const operators = task.steps
      .filter((s: any) => s.operator)
      .map((s: any) => s.operator);
    return Array.from(new Set(operators)).join('、') || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100">
            <SprayCan className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">消毒管理</h1>
            <p className="text-sm text-slate-500">管理设备消毒流程</p>
          </div>
        </div>
        <button onClick={() => navigate('/disinfection/records')} className="btn-secondary">
          <History className="w-4 h-4 mr-2" />
          历史记录
        </button>
      </div>

      <div className="card !p-0">
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={activeTab === 'queue' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <Clock className="w-4 h-4 inline mr-1.5" />
            待消毒队列
            {disinfectionQueue.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                {disinfectionQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            消毒历史
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'queue' && (
            disinfectionQueue.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {disinfectionQueue.map((task: DisinfectionTask) => {
                  const waitMinutes = getWaitMinutes(task.createdAt);
                  const isOverdue = waitMinutes >= OVERDUE_THRESHOLD_MINUTES;
                  const usage = getUsageInfo(task.usageId);
                  return (
                    <div
                      key={task.id}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        isOverdue
                          ? 'border-red-300 bg-red-50/50 animate-breathe'
                          : 'border-slate-200 bg-white hover:shadow-md hover:border-teal-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${
                            isOverdue ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            <Box className={`w-5 h-5 ${
                              isOverdue ? 'text-red-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-slate-900">{task.deviceCode}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(task.createdAt)}
                            </p>
                          </div>
                        </div>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            逾期
                          </span>
                        )}
                      </div>

                      <div className={`text-center py-4 rounded-xl mb-4 ${
                        isOverdue ? 'bg-red-100/50' : 'bg-slate-50'
                      }`}>
                        <p className="text-xs text-slate-500 mb-1">已等待</p>
                        <p className={`text-3xl font-bold ${
                          isOverdue ? 'text-red-600' : getWaitTimeColor(waitMinutes)
                        }`}>
                          {formatWaitTime(task.createdAt)}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500">患者：</span>
                          <span className="font-medium text-slate-700">{usage?.patientName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500">医生：</span>
                          <span className="font-medium text-slate-700">{usage?.doctor || '-'}</span>
                        </div>
                      </div>

                      <DisinfectionBadge status={task.status} className="mb-4 w-full justify-center !py-1.5" />

                      <button
                        onClick={() => handleStart(task.usageId, task.id)}
                        disabled={startingId === task.id}
                        className="btn-success w-full disabled:opacity-50"
                      >
                        {startingId === task.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <PlayCircle className="w-4 h-4 mr-2" />
                        )}
                        开始消毒
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <CheckCircle2 className="w-16 h-16 mb-4 text-green-400" />
                <p className="font-medium text-lg text-slate-600">消毒队列已清空</p>
                <p className="text-sm">所有设备消毒任务均已处理完成</p>
              </div>
            )
          )}

          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mr-3" />
                  <span className="text-slate-400">加载中...</span>
                </div>
              ) : history.length > 0 ? (
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">设备编号</th>
                      <th className="table-th">开始时间</th>
                      <th className="table-th">完成时间</th>
                      <th className="table-th">总耗时</th>
                      <th className="table-th">操作人</th>
                      <th className="table-th">状态</th>
                      <th className="table-th text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((task) => (
                      <tr key={task.id} className="table-row-hover cursor-pointer"
                        onClick={() => navigate(`/disinfection/${task.id}`)}>
                        <td className="table-td font-semibold text-slate-900">{task.deviceCode}</td>
                        <td className="table-td text-slate-700">{formatDateTime(task.createdAt)}</td>
                        <td className="table-td text-slate-700">
                          {task.completedAt ? formatDateTime(task.completedAt) : '-'}
                        </td>
                        <td className="table-td">
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Timer className="w-3.5 h-3.5 text-slate-400" />
                            {getTotalDuration(task) ? formatDuration(getTotalDuration(task)!) : '-'}
                          </span>
                        </td>
                        <td className="table-td text-slate-600">{getOperator(task)}</td>
                        <td className="table-td">
                          <DisinfectionBadge status={task.status} />
                        </td>
                        <td className="table-td">
                          <button
                            className="btn-ghost text-teal-600 hover:bg-teal-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/disinfection/${task.id}`);
                            }}
                          >
                            详情
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Inbox className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="font-medium text-lg">暂无消毒历史</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisinfectionQueuePage;
