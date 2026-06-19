import { useTablewareStore } from '../../store/useTablewareStore';
import { StatCard } from '../../components/StatCard/StatCard';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import {
  AlertTriangle,
  TrendingDown,
  Trash2,
  ShieldAlert,
  ShoppingCart,
  BarChart3,
  Clock,
} from 'lucide-react';
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
import { formatPercent, formatDateTime } from '../../utils/format';
import { severityLabels, reportStatusLabels } from '../../data/mockData';

const Dashboard = () => {
  const { dashboardStats, windowDamageRates, damageTypeStats, repairReports } =
    useTablewareStore();

  const pendingReports = repairReports.filter((r) => r.status !== 'completed').slice(0, 5);

  const barCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-primary-600 font-semibold">
            破损率: {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            总数: {payload[0].payload.totalCount} 件
          </p>
          <p className="text-xs text-gray-500">
            破损: {payload[0].payload.damagedCount} 件
          </p>
        </div>
      );
    }
    return null;
  };

  const pieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm font-semibold" style={{ color: payload[0].value }}>
            {payload[0].value} 件
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="待处理餐具"
          value={dashboardStats.pendingCount}
          icon={AlertTriangle}
          trend="较昨日 +3"
          trendUp={true}
          color="warning"
        />
        <StatCard
          title="整体破损率"
          value={formatPercent(dashboardStats.damageRate)}
          icon={TrendingDown}
          trend="较上周 -0.5%"
          trendUp={false}
          color="primary"
        />
        <StatCard
          title="累计报废"
          value={dashboardStats.scrappedCount}
          icon={Trash2}
          trend="本月 +23"
          trendUp={true}
          color="danger"
        />
        <StatCard
          title="消毒异常"
          value={dashboardStats.disinfectionAbnormal}
          icon={ShieldAlert}
          trend="待处理"
          trendUp={true}
          color="purple"
        />
        <StatCard
          title="待补采购"
          value={dashboardStats.needPurchase + ' 种规格'}
          icon={ShoppingCart}
          trend="库存预警"
          trendUp={true}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                各窗口破损率统计
              </h3>
              <p className="text-sm text-gray-500 mt-1">最近一周各窗口餐具破损情况</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={windowDamageRates} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="windowName" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 'auto']}
                />
                <Tooltip content={barCustomTooltip} cursor={{ fill: '#f0fdfa' }} />
                <Bar dataKey="damageRate" radius={[6, 6, 0, 0]} barSize={40}>
                  {windowDamageRates.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.damageRate > 7 ? '#ef4444' : entry.damageRate > 5 ? '#f97316' : '#0d9488'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">破损类型分布</h3>
            <p className="text-sm text-gray-500 mt-1">按破损原因分类统计</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={damageTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {damageTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={pieCustomTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                待处理报修记录
              </h3>
              <p className="text-sm text-gray-500 mt-1">最新提交的报修和巡检异常</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              查看全部 →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingReports.map((report, index) => (
            <div
              key={report.id}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={report.photo}
                alt="破损照片"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{report.windowName}</span>
                  <StatusBadge
                    status={report.severity}
                    label={severityLabels[report.severity]}
                  />
                  <StatusBadge
                    status={report.status}
                    label={reportStatusLabels[report.status]}
                  />
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {report.damageType} - {report.remark}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  批次: {report.tablewareBatchNo} · {formatDateTime(report.reportTime)}
                </p>
              </div>
              <button className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0">
                处理
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
