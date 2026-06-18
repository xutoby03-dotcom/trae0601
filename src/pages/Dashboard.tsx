import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, CheckCircle, AlertTriangle, Clock, TrendingUp, ShoppingCart, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '../store/index.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { MoldTypeLabels } from '../../shared/types.js';

function StatCard({ title, value, icon: Icon, color, subtitle, onClick }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-4xl font-serif font-bold mt-2 text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${color.replace('from-', 'from-').replace('to-', 'to-')}`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading, fetchAllDashboard, dashboardStats, conflicts, overdueList, usageBySize, purchaseSuggestions } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAllDashboard();
  }, [fetchAllDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllDashboard();
    setIsRefreshing(false);
  };

  const chartData = usageBySize.map(item => ({
    name: `${MoldTypeLabels[item.type as keyof typeof MoldTypeLabels] || item.type} ${item.size}`,
    借用次数: item.borrowCount,
  }));

  const chartColors = ['#D2691E', '#CD853F', '#DEB887', '#8B4513', '#D2B48C', '#FFE4B5'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="数据看板"
        subtitle="实时掌握模具库存、借还状态和采购建议"
        icon={<LayoutDashboard className="w-6 h-6" />}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {loading.stats && !dashboardStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="可用模具"
            value={dashboardStats.availableMolds}
            icon={CheckCircle}
            color="from-matcha-400 to-matcha-600"
            subtitle={`共 ${dashboardStats.totalMolds} 个模具档案`}
            onClick={() => navigate('/molds?status=available')}
          />
          <StatCard
            title="借用中"
            value={dashboardStats.borrowedMolds}
            icon={Package}
            color="from-blue-400 to-blue-600"
            subtitle="正在使用的模具数量"
            onClick={() => navigate('/borrow?status=borrowed')}
          />
          <StatCard
            title="逾期未还"
            value={dashboardStats.overdueCount}
            icon={Clock}
            color="from-tomato-400 to-tomato-600"
            subtitle={`${dashboardStats.conflictCount} 个预约冲突`}
            onClick={() => navigate('/borrow?status=overdue')}
          />
          <StatCard
            title="异常待处理"
            value={dashboardStats.exceptionMolds}
            icon={AlertTriangle}
            color="from-yellow-400 to-orange-500"
            subtitle="需要及时处理的问题"
            onClick={() => navigate('/exception?status=pending')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-caramel-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-caramel-600" />
              常用尺寸统计
            </h2>
            <span className="text-sm text-gray-500">按借用次数排名</span>
          </div>
          {loading.usageBySize ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-caramel-500"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="借用次数" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-serif font-bold text-caramel-900 flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-tomato-500" />
            逾期预警
          </h2>
          {loading.overdue ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
              ))}
            </div>
          ) : overdueList.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {overdueList.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="bg-tomato-50 border border-tomato-200 rounded-xl p-4 hover:bg-tomato-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/return/${item.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{item.mold_name}</p>
                      <p className="text-sm text-gray-500">借用人：{item.master_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-tomato-500 text-white text-xs px-2 py-1 rounded-full">
                        逾期 {Math.floor(item.overdue_days)} 天
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{item.order_no}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-matcha-400" />
              <p>暂无逾期记录</p>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-orange-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                预约冲突 ({conflicts.length})
              </h3>
              <div className="space-y-2">
                {conflicts.slice(0, 2).map(conflict => (
                  <div key={conflict.moldId} className="bg-orange-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-orange-800">{conflict.moldName}</p>
                    <p className="text-orange-600 text-xs mt-1">
                      {conflict.conflicts.map(c => c.masterName).join('、')} 同时借用
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif font-bold text-caramel-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-caramel-600" />
            采购建议
          </h2>
          <span className="text-sm text-gray-500">基于使用频率和库存情况智能推荐</span>
        </div>
        {loading.purchaseSuggestions ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
            ))}
          </div>
        ) : purchaseSuggestions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">模具名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型/尺寸</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">当前库存</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">建议采购</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">建议原因</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSuggestions.map((item, index) => (
                  <tr key={item.moldId} className="border-b border-gray-50 hover:bg-caramel-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status="available" type="mold" />
                      <span className="text-sm text-gray-500 ml-2">{item.size}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${item.currentQuantity <= 1 ? 'text-tomato-500' : 'text-gray-700'}`}>
                        {item.currentQuantity} 个
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-caramel-100 text-caramel-700 px-3 py-1 rounded-full font-bold">
                        <TrendingUp className="w-4 h-4" />
                        {item.suggestQuantity} 个
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 max-w-xs">
                      {item.reason}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/molds/${item.moldId}`)}
                        className="inline-flex items-center gap-1 text-caramel-600 hover:text-caramel-700 font-medium text-sm transition-colors"
                      >
                        查看详情 <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="w-16 h-16 mx-auto mb-3 text-matcha-400" />
            <p className="text-lg">库存充足，暂无需采购</p>
            <p className="text-sm mt-1">系统会在库存不足时自动提醒</p>
          </div>
        )}
      </div>
    </div>
  );
}
