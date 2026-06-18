import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { AlertTriangle, Ban, RefreshCw, Armchair, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useFurnitureStore } from '../store/furnitureStore';
import { useRepairStore } from '../store/repairStore';
import { StatusBadge } from '../components/StatusBadge';
import { ROOMS, FURNITURE_TYPE_LABELS, ISSUE_TYPE_LABELS } from '../types';
import { peakHourData } from '../mock/data';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon: Icon, color, trend, trendUp }: StatCardProps) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const repairOrders = useRepairStore((state) => state.repairOrders);

  // 统计数据
  const stats = useMemo(() => {
    const total = furnitureList.length;
    const pendingRepair = furnitureList.filter((f) => f.status === 'pending_repair').length;
    const outOfService = furnitureList.filter((f) => f.status === 'out_of_service').length;
    const normal = furnitureList.filter((f) => f.status === 'normal').length;
    const goodRate = total > 0 ? ((normal / total) * 100).toFixed(1) : '0';

    // 重复故障统计
    const repairCountMap = new Map<string, number>();
    repairOrders.forEach((order) => {
      repairCountMap.set(order.furnitureId, (repairCountMap.get(order.furnitureId) || 0) + 1);
    });
    const repeatFaults = Array.from(repairCountMap.entries()).filter(([, count]) => count >= 2).length;

    return {
      total,
      pendingRepair,
      outOfService,
      goodRate,
      repeatFaults,
    };
  }, [furnitureList, repairOrders]);

  // 各房间完好率
  const roomRateData = useMemo(() => {
    return ROOMS.map((room) => {
      const roomFurniture = furnitureList.filter((f) => f.room === room);
      const normalCount = roomFurniture.filter((f) => f.status === 'normal').length;
      const rate = roomFurniture.length > 0 ? (normalCount / roomFurniture.length) * 100 : 0;
      return {
        name: room,
        完好率: parseFloat(rate.toFixed(1)),
        总数: roomFurniture.length,
        正常: normalCount,
      };
    });
  }, [furnitureList]);

  // 重复故障桌椅
  const repeatFaultFurniture = useMemo(() => {
    const repairCountMap = new Map<string, { count: number; types: string[] }>();
    repairOrders.forEach((order) => {
      const existing = repairCountMap.get(order.furnitureId);
      if (existing) {
        existing.count++;
        if (!existing.types.includes(order.issueType)) {
          existing.types.push(order.issueType);
        }
      } else {
        repairCountMap.set(order.furnitureId, { count: 1, types: [order.issueType] });
      }
    });

    return Array.from(repairCountMap.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([furnitureId, data]) => {
        const furniture = furnitureList.find((f) => f.id === furnitureId);
        return {
          furnitureId,
          furniture,
          count: data.count,
          types: data.types,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [furnitureList, repairOrders]);

  // 待修和停用桌椅
  const problematicFurniture = useMemo(() => {
    return furnitureList
      .filter((f) => f.status === 'pending_repair' || f.status === 'out_of_service')
      .slice(0, 6);
  }, [furnitureList]);

  const barColors = ['#FF9800', '#FFB74D', '#FFCC80', '#FFE0B2'];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="桌椅总数"
          value={stats.total}
          icon={Armchair}
          color="bg-gradient-to-br from-secondary-500 to-secondary-700"
        />
        <StatCard
          title="待修数量"
          value={stats.pendingRepair}
          icon={AlertTriangle}
          color="bg-gradient-to-br from-orange-400 to-orange-600"
          trend="较上周 +2"
          trendUp={false}
        />
        <StatCard
          title="停用数量"
          value={stats.outOfService}
          icon={Ban}
          color="bg-gradient-to-br from-red-500 to-red-700"
        />
        <StatCard
          title="设施完好率"
          value={`${stats.goodRate}%`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-green-700"
          trend="较上周 +1.2%"
          trendUp
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 房间完好率 */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">各房间完好率</h3>
            <span className="text-xs text-gray-500">按房间统计</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomRateData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, '完好率']}
                />
                <Bar dataKey="完好率" radius={[6, 6, 0, 0]}>
                  {roomRateData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 重复故障 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-gray-800">重复故障 TOP5</h3>
          </div>
          <div className="space-y-3">
            {repeatFaultFurniture.length > 0 ? (
              repeatFaultFurniture.map((item, index) => (
                <div
                  key={item.furnitureId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.furniture?.id || item.furnitureId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.furniture?.room} · {FURNITURE_TYPE_LABELS[item.furniture?.type || 'table']}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {item.count}次
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无重复故障记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下方区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 高峰使用时段 */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-secondary-600" />
            <h3 className="text-base font-semibold text-gray-800">报修时段分布</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHourData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value} 次`, '报修数量']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#FF9800"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            提示：下午14-16点为报修高峰，建议合理安排巡检和维修
          </p>
        </div>

        {/* 待修/停用列表 */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-semibold text-gray-800">需关注桌椅</h3>
            </div>
            <Link to="/furniture" className="text-xs text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-2">
            {problematicFurniture.length > 0 ? (
              problematicFurniture.map((item) => (
                <Link
                  key={item.id}
                  to={`/furniture/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.photos[0] && (
                      <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.id}</p>
                    <p className="text-xs text-gray-500">
                      {item.room} · {FURNITURE_TYPE_LABELS[item.type]}
                    </p>
                  </div>
                  <StatusBadge type="furniture" status={item.status} />
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Armchair className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">所有桌椅状态良好</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
