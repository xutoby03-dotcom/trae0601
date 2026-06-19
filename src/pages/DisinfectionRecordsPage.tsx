import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Filter,
  UserCheck,
  Box,
  ArrowLeft,
  Inbox,
  Timer,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { DisinfectionBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime, formatDuration } from '@/lib/format';
import { useAppStore } from '@/store';

const NURSES = ['李护士', '王护士', '张护士', '刘护士'];
const STEP_NAMES = ['清洗', '浸泡', '冲洗', '晾干', '收纳'];

function DisinfectionRecordsPage() {
  const navigate = useNavigate();
  const { devices, fetchDevices } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [staff, setStaff] = useState('');

  useEffect(() => {
    loadData();
    fetchDevices();
  }, []);

  const loadData = () => {
    setLoading(true);
    api.getDisinfectionRecords({
      date: date || undefined,
      deviceId: deviceId || undefined,
      staff: staff || undefined,
      pageSize: 100,
    })
      .then((result) => setRecords(result.data || []))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleSearch = () => loadData();

  const handleReset = () => {
    setDate('');
    setDeviceId('');
    setStaff('');
    loadData();
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
          <button onClick={() => navigate('/disinfection')} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 rounded-lg bg-slate-100">
            <FileText className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">消毒历史记录</h1>
            <p className="text-sm text-slate-500">查看所有消毒任务的历史记录</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label"><Calendar className="w-3.5 h-3.5 inline mr-1" />日期</label>
            <input
              type="date" className="input" value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label"><Box className="w-3.5 h-3.5 inline mr-1" />设备</label>
            <select className="select" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              <option value="">全部设备</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label"><UserCheck className="w-3.5 h-3.5 inline mr-1" />操作人</label>
            <select className="select" value={staff} onChange={(e) => setStaff(e.target.value)}>
              <option value="">全部人员</option>
              {NURSES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleSearch} className="btn-primary flex-1">查询</button>
            <button onClick={handleReset} className="btn-secondary flex-1">重置</button>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full mr-3" />
            <span className="text-slate-400">加载中...</span>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">设备编号</th>
                  <th className="table-th">开始时间</th>
                  <th className="table-th">完成时间</th>
                  <th className="table-th">步骤完成度</th>
                  <th className="table-th">总耗时</th>
                  <th className="table-th">操作人</th>
                  <th className="table-th">状态</th>
                  <th className="table-th text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((task) => {
                  const totalDuration = getTotalDuration(task);
                  return (
                    <tr
                      key={task.id}
                      className="table-row-hover cursor-pointer"
                      onClick={() => navigate(`/disinfection/${task.id}`)}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100">
                            <Box className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="font-semibold text-slate-900">{task.deviceCode}</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-700">{formatDateTime(task.createdAt)}</td>
                      <td className="table-td text-slate-700">
                        {task.completedAt ? formatDateTime(task.completedAt) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          {STEP_NAMES.map((name, idx) => {
                            const stepData = task.steps[idx];
                            const isDone = !!stepData?.finishedAt;
                            return (
                              <div
                                key={idx}
                                className="group relative"
                                title={`${name}: ${isDone ? '已完成' : '未完成'}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isDone
                                      ? 'bg-green-500 text-white'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                                  }`}
                                >
                                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                              </div>
                            );
                          })}
                          <span className="ml-2 text-xs text-slate-500 font-medium">
                            {task.steps.filter((s: any) => s.finishedAt).length}/5
                          </span>
                        </div>
                      </td>
                      <td className="table-td">
                        {totalDuration ? (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Timer className="w-3.5 h-3.5 text-slate-400" />
                            {formatDuration(totalDuration)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="table-td">
                        <span className="inline-flex items-center gap-1 text-slate-600 text-sm">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {getOperator(task)}
                        </span>
                      </td>
                      <td className="table-td">
                        <DisinfectionBadge status={task.status} />
                      </td>
                      <td className="table-td">
                        <button
                          className="btn-ghost text-teal-600 hover:bg-teal-50 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/disinfection/${task.id}`);
                          }}
                        >
                          查看
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium text-lg">暂无消毒历史记录</p>
            <p className="text-sm">调整筛选条件或等待新的消毒任务完成</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisinfectionRecordsPage;
