import { useState } from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useLossReportStore } from '@/store/lossReportStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { formatCurrency } from '@/utils/format';

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Statistics() {
  const { getStatistics, lossReports } = useLossReportStore();
  const { inspections } = useInspectionStore();
  const stats = getStatistics();
  const [activeTab, setActiveTab] = useState<'freezer' | 'category' | 'shift' | 'trend'>('freezer');

  const approvedReports = lossReports.filter((r) => r.status === 'approved');
  const totalApprovedAmount = approvedReports.reduce((sum, r) => sum + r.totalAmount, 0);
  const abnormalCount = inspections.filter((i) => i.isAbnormal).length;

  const shiftData = stats.lossByShift.map((item) => ({
    name: item.name,
    异常次数: item.count,
    报损金额: item.amount,
  }));

  const pieData = stats.lossByCategory.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  const trendData = stats.lossByMonth.map((item) => ({
    name: item.month,
    报损金额: item.amount,
  }));

  const freezerData = stats.abnormalByFreezer.map((item) => ({
    name: item.name,
    异常次数: item.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="统计分析"
        description="查看冷柜异常数据、报损金额、受影响品类和责任班次统计"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="累计异常次数"
          value={stats.totalAbnormal}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="累计报损金额"
          value={formatCurrency(stats.totalLossAmount)}
          icon={DollarSign}
          color="red"
        />
        <StatCard
          title="受影响品类"
          value={stats.lossByCategory.length}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="涉及班次"
          value={stats.lossByShift.length}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'freezer', label: '冷柜异常统计', icon: BarChart3 },
              { key: 'trend', label: '报损趋势', icon: TrendingUp },
              { key: 'category', label: '品类分布', icon: PieChartIcon },
              { key: 'shift', label: '责任班次', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'freezer' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">各冷柜异常次数</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={freezerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="异常次数" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'trend' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">报损金额趋势</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="报损金额"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'category' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">受影响品类分布</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} 件`, '数量']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="md:w-64 space-y-3">
                <h4 className="font-medium text-slate-700">品类明细</h4>
                {pieData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value} 件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shift' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">责任班次统计</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm">
                      <th className="px-6 py-4 text-left font-medium rounded-tl-xl">班次</th>
                      <th className="px-6 py-4 text-right font-medium">异常次数</th>
                      <th className="px-6 py-4 text-right font-medium">报损金额</th>
                      <th className="px-6 py-4 text-right font-medium rounded-tr-xl">占比</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.lossByShift.map((item, index) => {
                      const percentage =
                        stats.totalLossAmount > 0
                          ? ((item.amount / stats.totalLossAmount) * 100).toFixed(1)
                          : '0';
                      return (
                        <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                  backgroundColor: `${COLORS[index % COLORS.length]}20`,
                                  color: COLORS[index % COLORS.length],
                                }}
                              >
                                <Clock className="w-5 h-5" />
                              </div>
                              <span className="font-medium text-slate-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            {item.count} 次
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-red-600">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: COLORS[index % COLORS.length],
                                  }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">关键指标</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">平均单次报损</p>
                  <p className="font-semibold text-slate-900">
                    {approvedReports.length > 0
                      ? formatCurrency(totalApprovedAmount / approvedReports.length)
                      : '¥0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">异常处理率</p>
                  <p className="font-semibold text-slate-900">
                    {abnormalCount > 0
                      ? `${((approvedReports.length / abnormalCount) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">最常受影响品类</p>
                  <p className="font-semibold text-slate-900">
                    {stats.lossByCategory.length > 0
                      ? stats.lossByCategory.sort((a, b) => b.value - a.value)[0]?.name
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">异常冷柜排行</h3>
          <div className="space-y-3">
            {stats.abnormalByFreezer
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-amber-400 text-white'
                          : index === 1
                          ? 'bg-slate-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-semibold">
                      {item.count} 次
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
