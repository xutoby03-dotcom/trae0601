import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Activity, Users, Battery, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { CONFERENCE_ROOMS, DEPARTMENTS } from '../data/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const COLORS = ['#1e3a5f', '#ff6b35', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Statistics() {
  const { remotes, borrowRecords } = useAppStore();

  const conferenceRoomStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CONFERENCE_ROOMS.forEach(room => stats[room] = 0);
    
    borrowRecords.forEach(record => {
      if (stats[record.conferenceRoom] !== undefined) {
        stats[record.conferenceRoom]++;
      }
    });

    return CONFERENCE_ROOMS.map(room => ({
      name: room.split('-')[1],
      借用次数: stats[room],
      fullName: room
    }));
  }, [borrowRecords]);

  const overdueByDept = useMemo(() => {
    const stats: Record<string, number> = {};
    DEPARTMENTS.forEach(dept => stats[dept] = 0);
    
    borrowRecords
      .filter(r => r.status === 'overdue' || r.status === 'lost')
      .forEach(record => {
        if (stats[record.department] !== undefined) {
          stats[record.department]++;
        }
      });

    return DEPARTMENTS
      .map(dept => ({ name: dept, value: stats[dept] }))
      .filter(d => d.value > 0);
  }, [borrowRecords]);

  const batteryChangeStats = useMemo(() => {
    const last6Months: { name: string; 换电池次数: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = remotes.filter(r => {
        const changeDate = new Date(r.lastBatteryChange);
        return changeDate >= month && changeDate < nextMonth;
      }).length;
      
      last6Months.push({
        name: format(month, 'M月', { locale: zhCN }),
        换电池次数: count
      });
    }
    
    return last6Months;
  }, [remotes]);

  const statusStats = useMemo(() => {
    const total = remotes.length;
    const available = remotes.filter(r => r.status === 'available').length;
    const borrowed = remotes.filter(r => r.status === 'borrowed').length;
    const maintenance = remotes.filter(r => r.status === 'maintenance').length;
    const lost = remotes.filter(r => r.status === 'lost').length;
    
    return [
      { name: '可用', value: available, color: '#10b981' },
      { name: '借用中', value: borrowed, color: '#3b82f6' },
      { name: '维修中', value: maintenance, color: '#f59e0b' },
      { name: '已丢失', value: lost, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [remotes]);

  const topBorrowers = useMemo(() => {
    const stats: Record<string, { count: number; dept: string }> = {};
    
    borrowRecords.forEach(record => {
      if (!stats[record.borrower]) {
        stats[record.borrower] = { count: 0, dept: record.department };
      }
      stats[record.borrower].count++;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [borrowRecords]);

  const lowBatteryRemotes = remotes.filter(r => r.batteryLevel < 20 && r.status !== 'lost');
  const availableRate = remotes.length > 0 
    ? Math.round((remotes.filter(r => r.status === 'available').length / remotes.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-800 font-display">统计报表</h1>
        <p className="text-gray-500 mt-1">查看遥控器使用情况的数据分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总借用次数</p>
              <p className="text-3xl font-bold text-gray-800 font-display">{borrowRecords.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">可用率</p>
              <p className="text-3xl font-bold text-gray-800 font-display">{availableRate}%</p>
            </div>
          </div>
        </div>
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Battery className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">需换电池</p>
              <p className="text-3xl font-bold text-gray-800 font-display">{lowBatteryRemotes.length}</p>
            </div>
          </div>
        </div>
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">逾期未还</p>
              <p className="text-3xl font-bold text-gray-800 font-display">
                {borrowRecords.filter(r => r.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">各会议室借用次数</h2>
              <p className="text-sm text-gray-500">按会议室统计借用频次</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conferenceRoomStats} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value} 次`, '借用次数']}
                />
                <Bar dataKey="借用次数" radius={[0, 4, 4, 0]}>
                  {conferenceRoomStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">逾期部门分布</h2>
              <p className="text-sm text-gray-500">各部门逾期/丢失次数占比</p>
            </div>
          </div>
          {overdueByDept.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-500">
              暂无逾期记录
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overdueByDept}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8' }}
                  >
                    {overdueByDept.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value} 次`, '逾期次数']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">换电池频率趋势</h2>
              <p className="text-sm text-gray-500">近6个月电池更换统计</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={batteryChangeStats} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value} 次`, '换电池次数']}
                />
                <Line
                  type="monotone"
                  dataKey="换电池次数"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">遥控器状态分布</h2>
              <p className="text-sm text-gray-500">当前遥控器状态占比</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#94a3b8' }}
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value} 个`, '数量']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">借用次数排行</h2>
              <p className="text-sm text-gray-500">借用次数最多的员工 TOP5</p>
            </div>
          </div>
          <div className="space-y-3">
            {topBorrowers.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.count} 次</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / topBorrowers[0].count) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.dept}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Battery className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">低电量预警</h2>
              <p className="text-sm text-gray-500">电量低于20%的遥控器</p>
            </div>
          </div>
          {lowBatteryRemotes.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              所有遥控器电量充足
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lowBatteryRemotes.map(remote => (
                <div key={remote.id} className="flex items-center gap-4 p-3 bg-orange-50 rounded-xl">
                  <img src={remote.photoUrl} alt={remote.code} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{remote.code}</span>
                      <span className="text-sm font-bold text-red-600">{remote.batteryLevel}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{remote.conferenceRoom}</p>
                    <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${remote.batteryLevel}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">电池型号</p>
                    <p className="text-sm font-medium text-gray-800">{remote.batteryModel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
