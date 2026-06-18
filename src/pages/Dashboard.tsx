import { useNavigate, Link } from 'react-router-dom';
import {
  Cable,
  Clock,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, isOverdue } from '@/utils/date';
import { rooms } from '@/data/rooms';

const Dashboard = () => {
  const navigate = useNavigate();
  const { getDashboardStats, getRecentRecords, getOverdueRecords, getFaultyDevices } = useStore();
  const stats = getDashboardStats();
  const recentRecords = getRecentRecords(5);
  const overdueRecords = getOverdueRecords();
  const faultyDevices = getFaultyDevices();

  const getDeviceName = (deviceId: string) => {
    const device = useStore.getState().getDeviceById(deviceId);
    return device?.name || '未知设备';
  };

  const getRoomName = (deviceId: string) => {
    const device = useStore.getState().getDeviceById(deviceId);
    if (!device) return '未知';
    const room = rooms.find((r) => r.id === device.roomId);
    return room?.name || '未分配';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-slate-500 mt-1">查看投影转接头使用概览</p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to="/borrow"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
          >
            <Calendar className="w-4 h-4" />
            发起借用
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="当前借出"
          value={stats.totalBorrowed}
          icon={Cable}
          color="blue"
          subtitle="借出中的转接头"
          onClick={() => navigate('/devices?status=borrowed')}
        />
        <StatCard
          title="逾期未还"
          value={stats.overdueCount}
          icon={Clock}
          color="red"
          subtitle="超过预计归还时间"
          onClick={() => navigate('/records?status=overdue')}
        />
        <StatCard
          title="故障线材"
          value={stats.faultyCount}
          icon={AlertTriangle}
          color="amber"
          subtitle="故障或维修中"
          onClick={() => navigate('/devices?status=faulty_all')}
        />
        <StatCard
          title="高频缺口"
          value={stats.highDemandTypes[0]?.type || '-'}
          icon={TrendingUp}
          color="purple"
          subtitle={stats.highDemandTypes[0] ? `缺口 ${stats.highDemandTypes[0].deficit} 个` : '暂无数据'}
          onClick={() => {
            const top = stats.highDemandTypes[0];
            if (!top) return;
            const status = top.borrowed > 0 ? 'borrowed' : top.faulty > 0 ? 'faulty_all' : 'available';
            navigate(`/devices?type=${top.type}&status=${status}`);
          }}
        />
      </div>

      {stats.highDemandTypes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">接口类型概览</h2>
            <Link
              to="/devices"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              查看全部设备
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.highDemandTypes.map((item) => (
              <div
                key={item.type}
                className="group p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-bold text-slate-800">{item.type}</span>
                  {item.deficit > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-md">
                      缺{item.deficit}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs mb-2">
                  <Link
                    to={`/devices?type=${item.type}&status=available`}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">空闲</span>
                    <span className="font-semibold text-emerald-700">{item.available}</span>
                  </Link>
                  <Link
                    to={`/devices?type=${item.type}&status=borrowed`}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-500">借出</span>
                    <span className="font-semibold text-blue-700">{item.borrowed}</span>
                  </Link>
                  <Link
                    to={`/devices?type=${item.type}&status=faulty_all`}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-slate-500">故障</span>
                    <span className="font-semibold text-red-700">{item.faulty}</span>
                  </Link>
                </div>
                
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-400 h-full"
                    style={{ width: `${(item.available / item.total) * 100}%` }}
                  />
                  <div
                    className="bg-blue-400 h-full"
                    style={{ width: `${(item.borrowed / item.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 h-full"
                    style={{ width: `${(item.faulty / item.total) * 100}%` }}
                  />
                </div>
                
                <p className="text-xs text-slate-400 mt-2">
                  共 {item.total} 个 · 在用 {item.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">最近借用</h2>
            <Link
              to="/records"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => {
                const overdue = isOverdue(record.endTime, record.status);
                
                return (
                  <div
                    key={record.id}
                    className={`px-6 py-4 hover:bg-slate-50 transition-colors ${
                      overdue ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Cable className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {getDeviceName(record.deviceId)}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {record.borrowerName}
                            <span className="text-slate-300">·</span>
                            {getRoomName(record.deviceId)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge
                          status={overdue ? 'overdue' : record.status}
                          size="sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDateTime(record.startTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <Cable className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无借用记录</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">逾期提醒</h2>
            {overdueRecords.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                {overdueRecords.length} 个逾期
              </span>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {overdueRecords.length > 0 ? (
              overdueRecords.map((record) => (
                <div
                  key={record.id}
                  className="px-6 py-4 bg-red-50/30 hover:bg-red-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {getDeviceName(record.deviceId)}
                        </p>
                        <p className="text-sm text-slate-500">
                          借用人：{record.borrowerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">已逾期</p>
                      <p className="text-xs text-slate-400 mt-1">
                        应还：{formatDateTime(record.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-slate-500">暂无逾期记录</p>
                <p className="text-sm text-slate-400 mt-1">所有设备均按时归还</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {faultyDevices.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-amber-50/50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-800">故障设备</h2>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-700 text-xs font-medium rounded-full">
                {faultyDevices.length} 台
              </span>
            </div>
            <Link
              to="/devices?filter=faulty"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              查看详情
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
            {faultyDevices.map((device) => {
              const room = rooms.find((r) => r.id === device.roomId);
              return (
                <div
                  key={device.id}
                  className="p-4 bg-amber-50/30 rounded-xl border border-amber-100"
                >
                  <p className="font-medium text-slate-700 text-sm truncate">{device.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{device.type}</p>
                  <p className="text-xs text-slate-400 mt-1">{room?.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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

export default Dashboard;
