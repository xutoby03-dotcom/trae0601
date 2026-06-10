import { useMemo } from 'react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, XCircle, Wrench, Calendar, Star, Users, Award } from 'lucide-react';
import { useStore } from '../store';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function StatisticsPage() {
  const stats = useStore(s => s.getStatistics());
  const { rooms, feedbacks, equipmentIssues } = useStore(s => ({
    rooms: s.rooms,
    feedbacks: s.feedbacks,
    equipmentIssues: s.equipmentIssues,
  }));

  const roomPopularityData = useMemo(() => {
    return stats.roomPopularity.map(r => ({
      name: r.roomName.replace(/^钢琴房 |鼓房 |声乐间 /, ''),
      预约次数: r.count,
      fullName: r.roomName,
    }));
  }, [stats]);

  const pieData = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    if (stats.cancellationRate.cancelled > 0) {
      data.push({ name: '已取消', value: stats.cancellationRate.cancelled });
    }
    if (stats.completedBookings > 0) {
      data.push({ name: '已完成', value: stats.completedBookings });
    }
    const pending = stats.cancellationRate.total - stats.cancellationRate.cancelled - stats.completedBookings;
    if (pending > 0) {
      data.push({ name: '进行中/待使用', value: pending });
    }
    return data;
  }, [stats]);

  const faultData = useMemo(() => {
    return stats.equipmentFaultCount
      .filter(f => f.count > 0)
      .map(f => ({
        name: f.roomName.replace(/^钢琴房 |鼓房 |声乐间 /, ''),
        故障次数: f.count,
      }));
  }, [stats]);

  const radarData = useMemo(() => [
    { subject: '隔音效果', A: stats.avgRatings.noise, fullMark: 5 },
    { subject: '卫生状况', A: stats.avgRatings.cleanliness, fullMark: 5 },
    { subject: '设备状态', A: stats.avgRatings.equipment, fullMark: 5 },
    { subject: '总体体验', A: stats.avgRatings.overall, fullMark: 5 },
  ], [stats]);

  const issueByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      keyboard: 0, drum: 0, ac: 0, speaker: 0, other: 0,
    };
    equipmentIssues.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
    const labels: Record<string, string> = {
      keyboard: '琴键', drum: '鼓具', ac: '空调', speaker: '音响', other: '其他',
    };
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: labels[k] || k, 次数: v }));
  }, [equipmentIssues]);

  const topRoom = stats.roomPopularity[0];
  const mostFaultRoom = stats.equipmentFaultCount.find(f => f.count > 0);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">数据统计</h1>
        <p className="text-gray-500 text-sm">了解房间使用情况、取消率和设备状态</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<Calendar className="text-indigo-500" size={20} />}
          label="总预约数"
          value={stats.cancellationRate.total}
          trend="全部记录"
          color="indigo"
        />
        <MetricCard
          icon={<Award className="text-green-500" size={20} />}
          label="完成预约"
          value={stats.completedBookings}
          trend={`${((stats.completedBookings / Math.max(stats.cancellationRate.total, 1)) * 100).toFixed(0)}% 完成率`}
          color="green"
        />
        <MetricCard
          icon={<XCircle className="text-red-500" size={20} />}
          label="取消率"
          value={`${stats.cancellationRate.rate.toFixed(1)}%`}
          trend={`${stats.cancellationRate.cancelled} 次取消`}
          color="red"
        />
        <MetricCard
          icon={<Wrench className="text-yellow-500" size={20} />}
          label="设备问题"
          value={equipmentIssues.length}
          trend={`${equipmentIssues.filter(e => !e.resolved).length} 项待解决`}
          color="yellow"
        />
      </div>

      {topRoom && topRoom.count > 0 && (
        <div className="card p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium mb-0.5">🏆 最抢手房间</p>
              <h3 className="text-xl font-bold text-gray-800">{topRoom.roomName}</h3>
              <p className="text-sm text-gray-600 mt-0.5">累计被预约 <strong className="text-indigo-600">{topRoom.count}</strong> 次，人气最高！</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" /> 房间预约次数排行
          </h3>
          <span className="text-sm text-gray-500">共 {rooms.length} 间房</span>
        </div>
        {roomPopularityData.every(r => r.预约次数 === 0) ? (
          <EmptyChart text="暂无预约数据" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomPopularityData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white shadow-lg border rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-800">{payload[0].payload.fullName}</p>
                          <p className="text-indigo-600">预约 {payload[0].value} 次</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="预约次数" radius={[0, 6, 6, 0]} barSize={22}>
                  {roomPopularityData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <XCircle size={18} className="text-red-500" /> 预约状态分布
          </h3>
          {pieData.length === 0 ? (
            <EmptyChart text="暂无数据" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={[COLORS[3], COLORS[2], COLORS[5]][idx % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-500">
              取消率 <strong className="text-red-500 text-base">{stats.cancellationRate.rate.toFixed(1)}%</strong>
              {' · '}
              完成率 <strong className="text-green-500 text-base">
                {stats.cancellationRate.total > 0 ? ((stats.completedBookings / stats.cancellationRate.total) * 100).toFixed(1) : '0'}%
              </strong>
            </span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" /> 用户评分雷达图
          </h3>
          {feedbacks.length === 0 ? (
            <EmptyChart text="暂无评分数据" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="评分"
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 mt-1 text-center">
            <RatingStat label="隔音" value={stats.avgRatings.noise} />
            <RatingStat label="卫生" value={stats.avgRatings.cleanliness} />
            <RatingStat label="设备" value={stats.avgRatings.equipment} />
            <RatingStat label="总体" value={stats.avgRatings.overall} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-orange-500" /> 各房间设备故障次数
          </h3>
          {faultData.length === 0 ? (
            <EmptyChart text="暂无故障记录，设备运行良好 ✨" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faultData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="故障次数" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {mostFaultRoom && mostFaultRoom.count > 0 && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              故障最多：<strong className="text-orange-600">{mostFaultRoom.roomName}</strong> 共 {mostFaultRoom.count} 次
            </p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-purple-500" /> 故障类型分布
          </h3>
          {issueByCategory.length === 0 ? (
            <EmptyChart text="暂无故障分类数据" />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="次数"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {issueByCategory.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[(idx + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-sky-500" /> 房间使用详情表
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">房间名称</th>
                <th className="pb-3 font-medium">类型</th>
                <th className="pb-3 font-medium">容量</th>
                <th className="pb-3 font-medium text-center">预约次数</th>
                <th className="pb-3 font-medium text-center">故障次数</th>
                <th className="pb-3 font-medium text-right">状态</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => {
                const bookingCount = stats.roomPopularity.find(r => r.roomId === room.id)?.count || 0;
                const faultCount = stats.equipmentFaultCount.find(r => r.roomId === room.id)?.count || 0;
                const typeLabel = room.type === 'piano' ? '钢琴房' : room.type === 'drum' ? '鼓房' : '声乐间';
                const bookingRank = stats.roomPopularity.findIndex(r => r.roomId === room.id) + 1;
                return (
                  <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{room.name}</td>
                    <td className="py-3 text-gray-600">{typeLabel}</td>
                    <td className="py-3 text-gray-600">{room.capacity}人</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
                        {bookingCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded-lg font-medium ${
                        faultCount === 0 ? 'bg-green-50 text-green-600' :
                        faultCount <= 2 ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {faultCount}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {bookingRank === 1 && bookingCount > 0 && (
                        <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full font-medium">
                          👑 人气王
                        </span>
                      )}
                      {faultCount === 0 && bookingCount > 0 && bookingRank !== 1 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✓ 运行良好
                        </span>
                      )}
                      {faultCount > 2 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          ⚠ 需维护
                        </span>
                      )}
                      {bookingCount === 0 && faultCount === 0 && (
                        <span className="text-xs text-gray-400">— 暂无记录</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon, label, value, trend, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: 'indigo' | 'green' | 'red' | 'yellow';
}) {
  const colorMap = {
    indigo: 'bg-indigo-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  };
  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
    </div>
  );
}

function RatingStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-bold text-gray-800">{value.toFixed(1)}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-60 flex flex-col items-center justify-center text-gray-400 text-sm">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        📊
      </div>
      {text}
    </div>
  );
}
