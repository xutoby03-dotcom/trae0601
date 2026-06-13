import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  Package,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/DataTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { ConsumptionRate, ReplenishmentForecast, DepartmentUsage } from '../../shared/types';

const COLORS = ['#0F4C81', '#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB', '#E3F2FD'];

export default function Statistics() {
  const navigate = useNavigate();
  const {
    consumptionRates,
    departmentUsage,
    replenishmentForecast,
    dailyTrend,
    loading,
    fetchStatistics,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'consumption' | 'department' | 'forecast'>('consumption');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const totalDailyConsumption = consumptionRates.reduce((sum, r) => sum + r.dailyAverage, 0);
  const totalWeeklyConsumption = consumptionRates.reduce((sum, r) => sum + r.weeklyAverage, 0);
  const totalMonthlyConsumption = consumptionRates.reduce((sum, r) => sum + r.monthlyAverage, 0);

  const urgentForecasts = replenishmentForecast.filter((f) => f.estimatedDaysLeft <= 7);
  const soonForecasts = replenishmentForecast.filter(
    (f) => f.estimatedDaysLeft > 7 && f.estimatedDaysLeft <= 30
  );

  const consumptionRateColumns = [
    {
      key: 'printerLocation',
      title: '打印点',
      render: (row: ConsumptionRate) => (
        <span className="font-medium text-gray-900">{row.printerLocation}</span>
      ),
    },
    {
      key: 'dailyAverage',
      title: '日均消耗',
      render: (row: ConsumptionRate) => (
        <span className="font-mono font-semibold text-gray-900">
          {row.dailyAverage.toFixed(1)} <span className="text-sm text-gray-400">包/天</span>
        </span>
      ),
    },
    {
      key: 'weeklyAverage',
      title: '周均消耗',
      render: (row: ConsumptionRate) => (
        <span className="font-mono font-semibold text-primary-600">
          {row.weeklyAverage.toFixed(1)} <span className="text-sm text-gray-400">包/周</span>
        </span>
      ),
    },
    {
      key: 'monthlyAverage',
      title: '月均消耗',
      render: (row: ConsumptionRate) => (
        <span className="font-mono font-semibold text-purple-600">
          {row.monthlyAverage.toFixed(1)} <span className="text-sm text-gray-400">包/月</span>
        </span>
      ),
    },
  ];

  const forecastColumns = [
    {
      key: 'printerLocation',
      title: '打印点',
      render: (row: ReplenishmentForecast) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{row.printerLocation}</span>
          {row.estimatedDaysLeft <= 7 && (
            <Badge variant="danger">紧急</Badge>
          )}
          {row.estimatedDaysLeft > 7 && row.estimatedDaysLeft <= 14 && (
            <Badge variant="warning">即将</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'currentStock',
      title: '当前库存',
      render: (row: ReplenishmentForecast) => (
        <div>
          <span className="font-mono font-semibold text-gray-900">
            {row.currentStock} <span className="text-sm text-gray-400">包</span>
          </span>
          <p className="text-xs text-gray-400">最低库存: {row.minStock}包</p>
        </div>
      ),
    },
    {
      key: 'dailyConsumption',
      title: '日均消耗',
      render: (row: ReplenishmentForecast) => (
        <span className="font-mono text-gray-700">
          {row.dailyConsumption.toFixed(1)} <span className="text-sm text-gray-400">包/天</span>
        </span>
      ),
    },
    {
      key: 'estimatedDaysLeft',
      title: '预计可用',
      render: (row: ReplenishmentForecast) => {
        const days = row.estimatedDaysLeft;
        let color = 'text-green-600';
        if (days <= 7) color = 'text-red-600';
        else if (days <= 14) color = 'text-orange-600';

        return (
          <div className="flex items-center gap-2">
            {days <= 7 && <AlertTriangle className="w-4 h-4 text-red-500" />}
            <span className={`font-mono font-semibold ${color}`}>
              {days} <span className="text-sm text-gray-400">天</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'nextReplenishmentDate',
      title: '预计补货日期',
      render: (row: ReplenishmentForecast) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500" />
          <span className="font-medium text-gray-900">
            {new Date(row.nextReplenishmentDate).toLocaleDateString('zh-CN')}
          </span>
        </div>
      ),
    },
    {
      key: 'suggestedQuantity',
      title: '建议补货量',
      render: (row: ReplenishmentForecast) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-green-500" />
          <span className="font-mono font-semibold text-green-600">
            {row.suggestedQuantity} <span className="text-sm text-gray-400">包</span>
          </span>
          <span className="text-xs text-gray-400">
            ({Math.ceil(row.suggestedQuantity / 10)}箱)
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (row: ReplenishmentForecast) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/replenishments')}
        >
          去补货
        </Button>
      ),
    },
  ];

  const sortedForecast = [...replenishmentForecast].sort(
    (a, b) => a.estimatedDaysLeft - b.estimatedDaysLeft
  );

  const deptChartData = departmentUsage.map((d) => ({
    name: d.department,
    value: d.totalQuantity,
    percentage: d.percentage,
  }));

  const trendChartData = dailyTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
    消耗量: d.total_quantity,
  }));

  const rateChartData = consumptionRates
    .sort((a, b) => b.monthlyAverage - a.monthlyAverage)
    .map((r) => ({
      name: r.printerLocation,
      日均: parseFloat(r.dailyAverage.toFixed(1)),
      周均: parseFloat(r.weeklyAverage.toFixed(1)),
      月均: parseFloat(r.monthlyAverage.toFixed(1)),
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
          <p className="text-gray-500 mt-1">查看消耗分析、部门用量和补货预测</p>
        </div>
        <Button
          variant="primary"
          onClick={() => fetchStatistics()}
        >
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <p className="text-sm text-gray-500">日均消耗</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold font-mono text-gray-900">
                {totalDailyConsumption.toFixed(1)}
              </p>
              <span className="text-sm text-gray-400 mb-1">包/天</span>
              <span className="flex items-center text-xs text-green-600 mb-1">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500">周均消耗</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold font-mono text-gray-900">
                {totalWeeklyConsumption.toFixed(1)}
              </p>
              <span className="text-sm text-gray-400 mb-1">包/周</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500">月均消耗</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold font-mono text-gray-900">
                {totalMonthlyConsumption.toFixed(1)}
              </p>
              <span className="text-sm text-gray-400 mb-1">包/月</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 ${urgentForecasts.length > 0 ? 'bg-red-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
                <Clock className={`w-5 h-5 ${urgentForecasts.length > 0 ? 'text-red-600' : 'text-orange-600'}`} />
              </div>
              <p className="text-sm text-gray-500">待补货点</p>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-2xl font-bold font-mono ${urgentForecasts.length > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {urgentForecasts.length + soonForecasts.length}
              </p>
              <span className="text-sm text-gray-400 mb-1">个</span>
              {urgentForecasts.length > 0 && (
                <Badge variant="danger" className="mb-1">
                  {urgentForecasts.length} 紧急
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('consumption')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'consumption'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            消耗速度
          </div>
        </button>
        <button
          onClick={() => setActiveTab('department')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'department'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            部门用量
          </div>
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'forecast'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            补货预测
          </div>
        </button>
      </div>

      {activeTab === 'consumption' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">各打印点消耗对比</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rateChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="日均" fill="#0F4C81" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="周均" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="月均" fill="#42A5F5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">消耗趋势（30天）</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="消耗量"
                        stroke="#0F4C81"
                        strokeWidth={3}
                        dot={{ fill: '#0F4C81', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">消耗速度明细</h3>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={consumptionRateColumns}
                data={consumptionRates.sort((a, b) => b.monthlyAverage - a.monthlyAverage)}
                loading={loading}
                emptyText="暂无消耗数据"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'department' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">部门用量占比</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={deptChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deptChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value} 包`, '用量']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">部门用量排行</h3>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptChartData.sort((a, b) => b.value - a.value)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#9ca3af"
                        fontSize={12}
                        width={70}
                      />
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          `${value} 包 (${props.payload.percentage}%)`,
                          '用量',
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar dataKey="value" fill="#0F4C81" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">部门用量明细</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentUsage
                  .sort((a, b) => b.totalQuantity - a.totalQuantity)
                  .map((dept, index) => (
                    <div
                      key={dept.department}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {dept.department}
                          </span>
                        </div>
                        <Badge variant="primary">{dept.percentage}%</Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold font-mono text-gray-900">
                            {dept.totalQuantity}
                          </p>
                          <p className="text-xs text-gray-500">累计用量（包）</p>
                        </div>
                        {index === 0 && (
                          <span className="text-xs text-orange-600 flex items-center">
                            <ArrowUpRight className="w-4 h-4" />
                            最高
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {urgentForecasts.length > 0 && (
            <Card className="border-l-4 border-red-500 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    紧急补货提醒（{urgentForecasts.length}个打印点）
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {urgentForecasts.map((f) => (
                    <div
                      key={f.printerId}
                      className="bg-white rounded-xl p-4 border border-red-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {f.printerLocation}
                        </span>
                        <Badge variant="danger">还剩 {f.estimatedDaysLeft} 天</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        当前库存 {f.currentStock} 包，日均消耗 {f.dailyConsumption.toFixed(1)} 包
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          建议补货 {f.suggestedQuantity} 包（{Math.ceil(f.suggestedQuantity / 10)}箱）
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => navigate('/replenishments')}
                        >
                          立即补货
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {soonForecasts.length > 0 && (
            <Card className="border-l-4 border-orange-500 bg-orange-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    即将需要补货（{soonForecasts.length}个打印点）
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {soonForecasts.map((f) => (
                    <div
                      key={f.printerId}
                      className="bg-white rounded-xl p-4 border border-orange-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {f.printerLocation}
                        </span>
                        <Badge variant="warning">还剩 {f.estimatedDaysLeft} 天</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        当前库存 {f.currentStock} 包，日均消耗 {f.dailyConsumption.toFixed(1)} 包
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          预计 {new Date(f.nextReplenishmentDate).toLocaleDateString('zh-CN')} 补货
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate('/replenishments')}
                        >
                          安排补货
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">补货预测明细</h3>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={forecastColumns}
                data={sortedForecast}
                loading={loading}
                emptyText="暂无预测数据"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
