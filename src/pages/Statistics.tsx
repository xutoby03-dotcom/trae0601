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
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Package,
  Clock,
  Trophy,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { getExceptionTypeLabel } from '../utils';

export default function Statistics() {
  const { getStatistics, devices, exceptions } = useAppStore();
  const stats = getStatistics();

  const turnoverData = stats.deviceTurnover.map((item) => ({
    name: item.deviceName.length > 8 ? item.deviceName.slice(0, 8) + '...' : item.deviceName,
    fullName: item.deviceName,
    借出次数: item.count,
    平均周期: item.avgDays,
  }));

  const overdueData = stats.topOverdueCustomers.map((item, index) => ({
    name: item.customerName,
    逾期天数: item.days,
    逾期次数: item.count,
    rank: index + 1,
  }));

  const exceptionTypeData = stats.exceptionByType.map((item) => ({
    name: getExceptionTypeLabel(item.type as any),
    value: item.count,
  }));

  const COLORS = ['#1e3a5f', '#f39c12', '#e74c3c', '#27ae60', '#8e44ad'];

  const deviceByStatusData = [
    { name: '可用', value: devices.filter(d => d.status === 'available').length },
    { name: '借出中', value: devices.filter(d => d.status === 'loaned').length },
    { name: '维修中', value: devices.filter(d => d.status === 'maintenance').length },
  ];

  const PIE_COLORS = ['#27ae60', '#1e3a5f', '#f39c12'];

  return (
    <PageContainer title="统计分析" subtitle="多维度数据分析与管理视图">
      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-400">总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 font-serif">
            {stats.totalDevices}
          </p>
          <p className="text-sm text-gray-500 mt-1">样机总数</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xs text-gray-400">进行中</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 font-serif">
            {stats.activeLoans}
          </p>
          <p className="text-sm text-gray-500 mt-1">在借样机</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
            <span className="text-xs text-danger-400">需关注</span>
          </div>
          <p className="text-3xl font-bold text-danger-600 font-serif">
            {stats.overdueLoans}
          </p>
          <p className="text-sm text-gray-500 mt-1">逾期数量</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-500" />
            </div>
            <span className="text-xs text-success-400">本月</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 font-serif">
            {stats.returnedThisMonth}
          </p>
          <p className="text-sm text-gray-500 mt-1">归还数量</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 客户逾期排行 */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning-500" />
              客户逾期排行
            </h3>
            <span className="text-sm text-gray-400">TOP 5</span>
          </div>

          {overdueData.length === 0 ? (
            <div className="py-12 text-center text-gray-400">暂无逾期数据</div>
          ) : (
            <div className="space-y-4">
              {overdueData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-white'
                      : index === 1
                      ? 'bg-gray-300 text-white'
                      : index === 2
                      ? 'bg-orange-400 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm text-danger-600 font-medium">
                      {item.逾期天数} 天
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-danger-400 to-danger-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((item.逾期天数 / 30) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    逾期 {item.逾期次数} 次
                  </p>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* 样机周转率 */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              样机周转排行
            </h3>
            <span className="text-sm text-gray-400">按借出次数</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={turnoverData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} />
              <YAxis
                type="category" dataKey="name" tick={{ fontSize: 12, fill: '#666' }} width={80} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                }}
                formatter={(value: number, name: string) => [value + ' 次', name]}
                labelFormatter={(label: string, payload: any) => payload?.[0]?.payload?.fullName || label}
              />
              <Bar dataKey="借出次数" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 异常类型分布 */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              异常类型分布
            </h3>
            <span className="text-sm text-gray-400">共 {exceptions.length} 条</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={exceptionTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {exceptionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 样机状态分布 */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              样机状态分布
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={deviceByStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}台`}
                labelLine={false}
              >
                {deviceByStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 平均借用周期统计 */}
      <div className="bg-white rounded-xl shadow-card p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary-600" />
          样机周转详情
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  样机名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  型号
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  借出次数
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  平均周期
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  周转效率
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.deviceTurnover.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                  {item.deviceName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-bold text-primary-900">{item.count}</span>
                  <span className="text-sm text-gray-400 ml-1">次</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-bold text-gray-800">{item.avgDays}</span>
                  <span className="text-sm text-gray-400 ml-1">天</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.avgDays <= 14
                      ? 'bg-success-50 text-success-700'
                      : item.avgDays <= 30
                      ? 'bg-warning-50 text-warning-700'
                      : 'bg-danger-50 text-danger-700'
                  }`}>
                    {item.avgDays <= 14
                      ? '周转快'
                      : item.avgDays <= 30
                      ? '周转正常'
                      : '周转慢'}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
