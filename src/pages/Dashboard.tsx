import React, { useEffect } from 'react';
import {
  Package,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCard } from '@/components/AlertCard';
import { PrinterCard } from '@/components/PrinterCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    printers,
    alerts,
    consumptions,
    replenishments,
    dailyTrend,
    departmentUsage,
    loading,
    fetchAll,
    fetchStatistics,
  } = useAppStore();

  useEffect(() => {
    fetchAll();
    fetchStatistics();
  }, []);

  const totalStock = printers.reduce((sum, p) => sum + p.currentStock, 0);
  const totalConsumption = consumptions.reduce((sum, c) => sum + c.quantity, 0);
  const totalReplenishment = replenishments.reduce((sum, r) => sum + r.boxCount * 10, 0);
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length;

  const lowStockPrinters = printers.filter(
    (p) => p.currentStock <= p.minStock * 0.7
  );

  const chartData = dailyTrend.map((d) => ({
    date: new Date(d.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
    消耗量: d.total_quantity,
  }));

  const deptChartData = departmentUsage.map((d) => ({
    name: d.department,
    value: d.totalQuantity,
    percentage: d.percentage,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="当前总库存"
          value={`${totalStock} 包`}
          icon={<Package />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/printers')}
        />
        <StatCard
          title="累计领用"
          value={`${totalConsumption} 包`}
          icon={<ClipboardList />}
          color="green"
          trend={{ value: 8, isPositive: true }}
          onClick={() => navigate('/consumptions')}
        />
        <StatCard
          title="累计补货"
          value={`${totalReplenishment} 包`}
          icon={<TrendingUp />}
          color="purple"
          onClick={() => navigate('/replenishments')}
        />
        <StatCard
          title="待处理预警"
          value={unresolvedAlerts}
          icon={<AlertTriangle />}
          color={unresolvedAlerts > 0 ? 'red' : 'orange'}
          onClick={() => navigate('/alerts')}
        />
      </div>

      {unresolvedAlerts > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              预警提醒
            </h3>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/alerts')}
            >
              查看全部
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alerts
              .filter((a) => !a.isResolved)
              .slice(0, 4)
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">消耗趋势</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>最近30天</option>
              <option>最近7天</option>
              <option>最近90天</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">部门用量占比</h3>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} layout="vertical">
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
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} 包 (${props.payload.percentage}%)`,
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="#0F4C81"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            需要关注的打印点
          </h3>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/printers')}
          >
            新增打印点
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(lowStockPrinters.length > 0 ? lowStockPrinters : printers)
            .slice(0, 4)
            .map((printer) => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                onEdit={() => navigate(`/printers/${printer.id}/edit`)}
                onDelete={() => {
                  if (confirm('确定要删除这个打印点吗？')) {
                    useAppStore.getState().deletePrinter(printer.id);
                  }
                }}
              />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => navigate('/consumptions')}
        >
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              快速领用
            </h4>
            <p className="text-sm text-gray-500">登记打印纸领用记录</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => navigate('/replenishments')}
        >
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success-500/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              登记补货
            </h4>
            <p className="text-sm text-gray-500">添加打印纸补货记录</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => navigate('/statistics')}
        >
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              查看统计
            </h4>
            <p className="text-sm text-gray-500">消耗分析与补货预测</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
