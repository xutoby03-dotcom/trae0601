import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStarterStore } from '@/store/useStarterStore';
import StatCard from '@/components/StatCard';
import { StatusBadge, AnomalyBadge } from '@/components/StatusBadge';
import { 
  Cookie, CheckCircle, AlertTriangle, Clock,
  TrendingUp, AlertOctagon, ShoppingCart, ChevronRight, Plus
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getActivityScoreColor, getActivityScoreLabel } from '@/utils/calculations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getDashboardData, starters } = useStarterStore();
  const dashboardData = useMemo(() => getDashboardData(), [getDashboardData]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, Record<string, number | string>>();
    
    dashboardData.activityTrend.forEach(item => {
      const date = format(new Date(item.date), 'MM-dd HH:mm', { locale: zhCN });
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      const entry = dataMap.get(date)!;
      entry[item.starterName] = item.score;
    });

    return Array.from(dataMap.values());
  }, [dashboardData.activityTrend]);

  const starterColors = useMemo(() => {
    const colors = ['#8B5A2B', '#DAA520', '#52C41A', '#1890FF', '#722ED1'];
    const healthyStarters = starters.filter(s => s.status !== 'archived');
    return Object.fromEntries(healthyStarters.map((s, i) => [s.name, colors[i % colors.length]]));
  }, [starters]);

  const avgScore = useMemo(() => {
    if (dashboardData.activityTrend.length === 0) return 0;
    const sum = dashboardData.activityTrend.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / dashboardData.activityTrend.length);
  }, [dashboardData.activityTrend]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">看板总览</h1>
          <p className="text-bread-500 mt-1">
            {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/feeding')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            记录喂养
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="酸种总数"
          value={dashboardData.totalStarters}
          icon={<Cookie className="w-6 h-6" />}
          color="#8B5A2B"
          delay={0}
        />
        <StatCard
          title="合格可用"
          value={dashboardData.healthyStarters}
          icon={<CheckCircle className="w-6 h-6" />}
          color="#52C41A"
          delay={100}
        />
        <StatCard
          title="异常锁定"
          value={dashboardData.lockedStarters}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="#F5222D"
          delay={200}
        />
        <StatCard
          title="平均活性"
          value={`${avgScore}分`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={getActivityScoreColor(avgScore)}
          delay={300}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-bread-800">今日待喂</h2>
            <button
              onClick={() => navigate('/feeding')}
              className="text-sm text-bread-500 hover:text-bread-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {dashboardData.pendingFeedings.length === 0 ? (
            <div className="text-center py-12 text-bread-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>所有酸种喂养及时，状态良好</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.pendingFeedings.map((feeding, index) => (
                <div
                  key={feeding.starterId}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    feeding.overdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-bread-50 border-bread-200'
                  }`}
                  onClick={() => navigate(`/feeding/${feeding.starterId}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      feeding.overdue ? 'bg-red-100' : 'bg-wheat/20'
                    }`}>
                      <Clock className={`w-5 h-5 ${feeding.overdue ? 'text-red-500' : 'text-wheat'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-bread-800">{feeding.starterName}</p>
                      <p className={`text-sm ${feeding.overdue ? 'text-red-500' : 'text-orange-500'}`}>
                        {feeding.overdue
                          ? `已逾期 ${formatDistanceToNow(new Date(feeding.dueAt), { locale: zhCN })}`
                          : `${formatDistanceToNow(new Date(feeding.dueAt), { locale: zhCN })}后喂养`
                        }
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary text-sm py-1.5">
                    去喂养
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-bread-800">异常批次</h2>
            <button
              onClick={() => navigate('/anomalies')}
              className="text-sm text-bread-500 hover:text-bread-700 flex items-center gap-1"
            >
              管理 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {dashboardData.recentAnomalies.length === 0 ? (
            <div className="text-center py-12 text-bread-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>暂无异常酸种</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentAnomalies.map((anomaly) => {
                const starter = starters.find(s => s.id === anomaly.starterId);
                return (
                  <div
                    key={anomaly.id}
                    className="p-4 rounded-xl border border-red-200 bg-red-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-bread-800">
                        {starter?.name || '未知酸种'}
                      </span>
                      <AnomalyBadge type={anomaly.type} size="sm" />
                    </div>
                    <p className="text-sm text-bread-600 mb-2">{anomaly.description}</p>
                    <div className="flex items-center justify-between text-xs text-bread-400">
                      <span>发现于 {formatDistanceToNow(new Date(anomaly.detectedAt), { locale: zhCN, addSuffix: true })}</span>
                      <span className="text-red-500 font-medium">🔒 已锁定</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-bread-800">活性趋势</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-bread-500">最近7天</span>
            <div className="flex gap-2">
              {Object.entries(starterColors).slice(0, 5).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-bread-600">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5E6C8" />
              <XAxis 
                dataKey="date" 
                stroke="#8B5A2B" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#8B5A2B" 
                fontSize={12}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFF8E7', 
                  border: '1px solid #E8D4A8',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [
                  <span className="font-medium">{value}分</span>,
                  <span>{getActivityScoreLabel(value)}</span>
                ]}
              />
              {Object.entries(starterColors).slice(0, 5).map(([name, color]) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#FFF8E7' }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {dashboardData.affectedOrders.length > 0 && (
        <div className="card p-6 animate-fade-in-up border-2 border-red-200" style={{ animationDelay: '700ms', opacity: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-bread-800">受影响的面包订单</h2>
              <p className="text-sm text-red-500">以下订单因酸种异常需要重新安排</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bread-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">订单号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">产品名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">计划日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">数量</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">关联酸种</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-bread-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.affectedOrders.map((order) => {
                  const starter = starters.find(s => s.id === order.starterId);
                  return (
                    <tr key={order.id} className="border-b border-bread-100 hover:bg-bread-50">
                      <td className="py-3 px-4 font-mono text-sm text-bread-700">{order.orderNo}</td>
                      <td className="py-3 px-4 font-medium text-bread-800">{order.productName}</td>
                      <td className="py-3 px-4 text-bread-600">{order.plannedDate}</td>
                      <td className="py-3 px-4 text-bread-600">{order.plannedQuantity}个</td>
                      <td className="py-3 px-4">
                        {starter ? (
                          <StatusBadge status={starter.status} size="sm" />
                        ) : (
                          <span className="text-bread-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-red-100 text-red-700">
                          {order.status === 'cancelled' ? '已取消' : order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate('/production')}
                          className="text-sm text-bread-500 hover:text-bread-700 flex items-center gap-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          重新安排
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
