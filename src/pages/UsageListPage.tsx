import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Search,
  Plus,
  Eye,
  StopCircle,
  Filter,
  Inbox,
  User,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { UsageBadge, MaskBadge } from '@/components/StatusBadge';
import { UsageStatus } from '@shared/types';
import { api } from '@/lib/api';
import { formatDateTime, formatDuration, getTodayDate } from '@/lib/format';

const DOCTORS = ['张医生', '李医生', '王医生', '刘医生', '陈医生'];

function UsageListPage() {
  const navigate = useNavigate();
  const { usages, fetchUsages, devices, fetchDevices } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [endingId, setEndingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    fetchDevices();
  }, []);

  const loadData = () => {
    setLoading(true);
    fetchUsages({
      date: date || undefined,
      deviceId: deviceId || undefined,
      patient: patient || undefined,
      doctor: doctor || undefined,
    }).finally(() => setLoading(false));
  };

  const handleSearch = () => loadData();

  const handleReset = () => {
    setDate('');
    setDeviceId('');
    setPatient('');
    setDoctor('');
    fetchUsages();
  };

  const handleEndUsage = (id: string) => {
    if (window.confirm('确定要结束该使用记录吗？结束后设备将转为待消毒状态。')) {
      setEndingId(id);
      api.endUsage(id)
        .then(() => loadData())
        .catch((err) => alert(err.message))
        .finally(() => setEndingId(null));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">使用记录</h1>
            <p className="text-sm text-slate-500">管理所有雾化治疗记录</p>
          </div>
        </div>
        <button onClick={() => navigate('/usage/new')} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          新建记录
        </button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="label"><Calendar className="w-3.5 h-3.5 inline mr-1" />日期</label>
            <input
              type="date" className="input" value={date}
              max={getTodayDate()}
              onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label"><Filter className="w-3.5 h-3.5 inline mr-1" />设备</label>
            <select className="select" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              <option value="">全部设备</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label"><User className="w-3.5 h-3.5 inline mr-1" />患者搜索</label>
            <input
              type="text" className="input" placeholder="输入患者姓名"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <div>
            <label className="label"><UserCheck className="w-3.5 h-3.5 inline mr-1" />医生</label>
            <select className="select" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              <option value="">全部医生</option>
              {DOCTORS.map((d) => (
                <option key={d} value={d}>{d}</option>
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
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mr-3" />
            <span className="text-slate-400">加载中...</span>
          </div>
        ) : usages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">设备编号</th>
                  <th className="table-th">患者</th>
                  <th className="table-th">主治医生</th>
                  <th className="table-th">药液/剂量</th>
                  <th className="table-th">面罩类型</th>
                  <th className="table-th">开始时间</th>
                  <th className="table-th">结束时间</th>
                  <th className="table-th">时长</th>
                  <th className="table-th">状态</th>
                  <th className="table-th text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => (
                  <tr key={usage.id} className="table-row-hover">
                    <td className="table-td font-semibold text-slate-900">{usage.deviceCode}</td>
                    <td className="table-td">
                      <p className="font-medium text-slate-800">{usage.patientName}</p>
                      <p className="text-xs text-slate-500">{usage.patientAge}岁</p>
                    </td>
                    <td className="table-td text-slate-700">{usage.doctor}</td>
                    <td className="table-td">
                      <p className="text-slate-800">{usage.medicine}</p>
                      <p className="text-xs text-slate-500">{usage.medicineDose}ml</p>
                    </td>
                    <td className="table-td"><MaskBadge type={usage.maskType} /></td>
                    <td className="table-td text-slate-700">{formatDateTime(usage.startTime)}</td>
                    <td className="table-td text-slate-700">
                      {usage.endTime ? formatDateTime(usage.endTime) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="table-td text-slate-700">{formatDuration(usage.durationMinutes)}</td>
                    <td className="table-td"><UsageBadge status={usage.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/usage/${usage.id}`)}
                          className="btn-ghost text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {usage.status === UsageStatus.ONGOING && (
                          <button
                            onClick={() => handleEndUsage(usage.id)}
                            disabled={endingId === usage.id}
                            className="btn-ghost text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium text-lg">暂无使用记录</p>
            <p className="text-sm mb-4">点击右上角创建新的使用记录</p>
            <button onClick={() => navigate('/usage/new')} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              新建记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsageListPage;
