import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import PageContainer from '@/components/Layout/PageContainer';
import PageHeader from '@/components/Layout/PageHeader';
import StatCard from '@/components/Card/StatCard';
import {
  calculateStatistics,
  getCurtainTypeLabel,
  getWashMethodLabel,
} from '@/utils/statistics';
import { formatDuration, formatDate, isOverdueForWash } from '@/utils/date';
import {
  Calendar,
  Package,
  Clock,
  Home as HomeIcon,
  Droplets,
  AlertTriangle,
} from 'lucide-react';

const COLORS = ['#4A6FA5', '#9CAF88', '#E8998D', '#DDB388', '#6A86B9'];

export default function Statistics() {
  const { rooms, curtains, records } = useAppStore();
  const stats = calculateStatistics(rooms, curtains, records);

  const washByRoom = rooms.map((room) => {
    const roomCurtains = curtains.filter((c) => c.roomId === room.id);
    const roomRecords = records.filter((r) =>
      roomCurtains.some((c) => c.id === r.curtainId)
    );
    return {
      name: room.name,
      清洗次数: roomRecords.filter((r) => r.completed).length,
      待清洗: roomCurtains.filter((c) => isOverdueForWash(c.lastWashDate, c.washCycleDays)).length,
    };
  });

  const typeDistribution = [
    { name: '布帘', value: curtains.filter((c) => c.type === 'cloth').length },
    { name: '纱帘', value: curtains.filter((c) => c.type === 'sheer').length },
    { name: '遮光布', value: curtains.filter((c) => c.type === 'blackout').length },
    { name: '卷帘', value: curtains.filter((c) => c.type === 'roller').length },
    { name: '竹帘', value: curtains.filter((c) => c.type === 'bamboo').length },
  ].filter((d) => d.value > 0);

  const washMethodDistribution = [
    { name: '机洗', value: curtains.filter((c) => c.washMethod === 'machine').length },
    { name: '手洗', value: curtains.filter((c) => c.washMethod === 'hand').length },
    { name: '干洗', value: curtains.filter((c) => c.washMethod === 'dryclean').length },
    { name: '局部清洗', value: curtains.filter((c) => c.washMethod === 'spot').length },
  ].filter((d) => d.value > 0);

  const missingPartsByRoom = rooms
    .map((room) => {
      const roomCurtains = curtains.filter((c) => c.roomId === room.id);
      const roomRecords = records.filter((r) =>
        roomCurtains.some((c) => c.id === r.curtainId)
      );
      const missingCount = roomRecords.reduce(
        (sum, r) => sum + r.missingParts.reduce((s, p) => s + p.quantity, 0),
        0
      );
      return { name: room.name, 缺失数量: missingCount };
    })
    .filter((d) => d.缺失数量 > 0);

  const timeStats = records
    .filter((r) => r.completed)
    .map((r) => {
      const curtain = curtains.find((c) => c.id === r.curtainId);
      const room = rooms.find((rm) => rm.id === curtain?.roomId);
      return {
        name: `${room?.name || ''}-${curtain?.name || ''}`,
        耗时分钟: r.totalMinutes,
      };
    })
    .slice(-10);

  const completedRecords = records.filter((r) => r.completed);
  const totalTime = completedRecords.reduce((sum, r) => sum + r.totalMinutes, 0);

  const issuesSummary = [
    {
      label: '有霉点的窗帘',
      value: curtains.filter((c) => c.hasMold).length,
      icon: <AlertTriangle size={20} />,
      color: 'bg-coral-100 text-coral-500',
    },
    {
      label: '轨道卡顿',
      value: curtains.filter((c) => c.trackStuck).length,
      icon: <AlertTriangle size={20} />,
      color: 'bg-warm-200 text-primary-700',
    },
    {
      label: '超时未洗',
      value: curtains.filter((c) => isOverdueForWash(c.lastWashDate, c.washCycleDays)).length,
      icon: <Calendar size={20} />,
      color: 'bg-coral-100 text-coral-500',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="数据统计"
        subtitle="全面了解窗帘清洗维护情况"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="总窗帘数"
          value={stats.totalCurtains}
          icon={<HomeIcon size={24} />}
          gradient="linear-gradient(135deg, #4A6FA5 0%, #6A86B9 100%)"
          subtitle={`分布在 ${rooms.length} 个房间`}
        />
        <StatCard
          title="累计清洗"
          value={stats.completedWashes}
          icon={<Droplets size={24} />}
          gradient="linear-gradient(135deg, #9CAF88 0%, #AEC49C 100%)"
          subtitle={`总耗时 ${formatDuration(totalTime)}`}
        />
        <StatCard
          title="待清洗"
          value={stats.roomsToWash}
          icon={<Calendar size={24} />}
          gradient="linear-gradient(135deg, #E8998D 0%, #EEA39A 100%)"
          subtitle="房间数"
        />
        <StatCard
          title="缺失配件"
          value={stats.missingPartsTotal}
          icon={<Package size={24} />}
          gradient="linear-gradient(135deg, #DDB388 0%, #E6C7A6 100%)"
          subtitle="需采购"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card opacity-0 animate-fade-in-up">
          <h2 className="text-xl mb-4">各房间清洗情况</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={washByRoom} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="清洗次数" fill="#4A6FA5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="待清洗" fill="#E8998D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card opacity-0 animate-fade-in-up animate-stagger-1">
          <h2 className="text-xl mb-4">窗帘类型分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card opacity-0 animate-fade-in-up animate-stagger-2">
          <h2 className="text-xl mb-4">清洗方式分布</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={washMethodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {washMethodDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card opacity-0 animate-fade-in-up animate-stagger-3">
          <h2 className="text-xl mb-4">最近清洗耗时</h2>
          <div className="h-72">
            {timeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value: number) => formatDuration(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="耗时分钟" fill="#9CAF88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无清洗记录
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card opacity-0 animate-fade-in-up animate-stagger-4">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-coral-500" />
            问题汇总
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {issuesSummary.map((item, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-xl bg-gray-50"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <p className="text-2xl font-bold text-primary-800">{item.value}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {missingPartsByRoom.length > 0 && (
          <div className="card opacity-0 animate-fade-in-up animate-stagger-5">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Package size={20} className="text-coral-500" />
              各房间缺失配件
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingPartsByRoom} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="缺失数量" fill="#E8998D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-6 opacity-0 animate-fade-in-up animate-stagger-5">
        <h2 className="text-xl mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary-500" />
          最近清洗记录
        </h2>
        {completedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">房间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">窗帘</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">清洗方式</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">开始日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">耗时</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">缺件</th>
                </tr>
              </thead>
              <tbody>
                {completedRecords
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .slice(0, 10)
                  .map((record) => {
                    const curtain = curtains.find((c) => c.id === record.curtainId);
                    const room = rooms.find((r) => r.id === curtain?.roomId);
                    return (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-2">
                            {room?.icon} {room?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">{curtain?.name}</td>
                        <td className="py-3 px-4">
                          <span className="badge badge-primary">
                            {getCurtainTypeLabel(curtain?.type || '')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="badge badge-sage">
                            {getWashMethodLabel(curtain?.washMethod || '')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(record.startDate)}
                        </td>
                        <td className="py-3 px-4 text-primary-700 font-medium">
                          {formatDuration(record.totalMinutes)}
                        </td>
                        <td className="py-3 px-4">
                          {record.missingParts.length > 0 ? (
                            <span className="badge badge-coral">
                              {record.missingParts.reduce((s, p) => s + p.quantity, 0)} 个
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📊</div>
            <p>暂无清洗记录</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
