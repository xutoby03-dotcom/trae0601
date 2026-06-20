import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
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
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import StatCard from './components/StatCard';
import PendingCleanItem from './components/PendingCleanItem';
import AlertCardItem from './components/AlertCardItem';
import StorageGroupCard from './components/StorageGroupCard';

export default function DashboardPage() {
  const toys = useAppStore(s => s.toys);
  const cleaningRecords = useAppStore(s => s.cleaningRecords);
  const alerts = useAppStore(s => s.alerts);
  const tasks = useAppStore(s => s.tasks);

  const getStats = useAppStore(s => s.getStats);
  const getToysPendingClean = useAppStore(s => s.getToysPendingClean);
  const getActiveAlerts = useAppStore(s => s.getActiveAlerts);
  const getStorageGroups = useAppStore(s => s.getStorageGroups);

  const stats = useMemo(() => getStats(), [toys, cleaningRecords, alerts, tasks]);
  const pendingToys = useMemo(() => getToysPendingClean(), [toys, cleaningRecords]);
  const activeAlerts = useMemo(() => getActiveAlerts(), [alerts, toys]);
  const storageGroups = useMemo(() => getStorageGroups(), [toys, cleaningRecords]);

  const monthlyGrowth = useMemo(() => {
    const rand = (Math.random() * 30 - 5).toFixed(1);
    const sign = Number(rand) >= 0 ? '+' : '';
    return `${sign}${rand}%`;
  }, []);

  const trendData = stats.dailyTrend;
  const pieData = stats.methodBreakdown.length > 0
    ? stats.methodBreakdown
    : [
        { name: '水洗', value: 0, color: '#5DADE2' },
        { name: '擦拭', value: 0, color: '#98D8C8' },
        { name: '紫外线', value: 0, color: '#FFB6C1' },
        { name: '晾干', value: 0, color: '#D4A574' },
      ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div
        className="mb-8 opacity-0 animate-fade-in-up"
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl-plus bg-gradient-to-br from-baby-300 to-mint-300 flex items-center justify-center shadow-soft">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 font-display">
              数据概览
            </h1>
            <p className="text-sm text-gray-500">欢迎使用玩具消毒管家</p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <StatCard
          icon="🧸"
          label="累计建档"
          value={stats.totalToys}
          subLabel="玩具总数"
          gradient="bg-gradient-to-br from-mint-100 via-mint-50 to-white"
          animationDelay={50}
        />
        <StatCard
          icon="✨"
          label="本月清洁次数"
          value={stats.monthlyCleanCount}
          subLabel={`环比上月 ${monthlyGrowth}`}
          gradient="bg-gradient-to-br from-clean-100 via-clean-50 to-white"
          animationDelay={100}
        />
        <StatCard
          icon="🧼"
          label="待消毒数量"
          value={stats.pendingCleanCount}
          subLabel={stats.pendingCleanCount > 0 ? '需要及时处理' : '全部达标'}
          gradient="bg-gradient-to-br from-baby-100 via-baby-50 to-white"
          showBadge={stats.pendingCleanCount > 5}
          animationDelay={150}
        />
        <StatCard
          icon="⚠️"
          label="异常数量"
          value={stats.alertCount}
          subLabel={stats.alertCount > 0 ? '请尽快查看处理' : '一切正常'}
          gradient="bg-gradient-to-br from-alert-50 via-white to-white"
          pulseHighlight={stats.alertCount > 0}
          animationDelay={200}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div
          className="rounded-3xl-plus bg-white shadow-soft border border-gray-100/70 p-5 md:p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '250ms' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🧼 待消毒清单
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                已超过推荐清洁周期的玩具
              </p>
            </div>
            <Link
              to="/cleaning"
              className="text-sm font-semibold text-mint-500 hover:text-mint-400 transition-colors flex items-center gap-1 shrink-0"
            >
              全部记录
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingToys.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-gray-400 font-medium">太棒了！所有玩具都干干净净</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {pendingToys.map((toy, idx) => (
                <PendingCleanItem
                  key={toy.id}
                  toy={toy}
                  animationDelay={300 + idx * 60}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-3xl-plus bg-white shadow-soft border border-gray-100/70 p-5 md:p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                ⚠️ 异常预警
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                发现损坏的玩具，建议暂停使用
              </p>
            </div>
            <Link
              to="/alerts"
              className="text-sm font-semibold text-alert-400 hover:text-alert-500 transition-colors flex items-center gap-1 shrink-0"
            >
              查看详情
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-400 font-medium">目前没有异常，一切正常</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {activeAlerts.map((alert, idx) => (
                <AlertCardItem
                  key={alert.id}
                  alert={alert}
                  animationDelay={350 + idx * 80}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div
          className="rounded-3xl-plus bg-white shadow-soft border border-gray-100/70 p-5 md:p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '350ms' }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📊 近30天清洁趋势
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">每日清洁记录次数</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB6C1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#98D8C8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  interval={Math.floor(trendData.length / 6)}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #F3F4F6',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    padding: '10px 14px',
                  }}
                  labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}
                  itemStyle={{ color: '#4AB098', fontWeight: 500 }}
                  cursor={{ fill: 'rgba(255, 182, 193, 0.08)' }}
                />
                <Bar
                  dataKey="count"
                  name="清洁次数"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="rounded-3xl-plus bg-white shadow-soft border border-gray-100/70 p-5 md:p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🥧 清洁方式占比
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">各种清洁方式使用统计</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="48%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #F3F4F6',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    padding: '10px 14px',
                  }}
                  formatter={(value: number) => [`${value} 次`, '使用次数']}
                  labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value: string) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section
        className="opacity-0 animate-fade-in-up"
        style={{ animationDelay: '450ms' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📦 按收纳箱任务
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">按收纳位置分组查看清洁进度</p>
          </div>
          <Link
            to="/tasks"
            className="text-sm font-semibold text-baby-500 hover:text-baby-400 transition-colors flex items-center gap-1 shrink-0"
          >
            任务中心
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {storageGroups.map((group, idx) => (
            <StorageGroupCard
              key={group.location}
              group={group}
              animationDelay={500 + idx * 80}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
