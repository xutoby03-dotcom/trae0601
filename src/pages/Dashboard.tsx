import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Shirt,
  Clock,
  Droplets,
  AlertTriangle,
  Package,
  TrendingUp,
  Users,
  ArrowRight,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../store';
import { STATUS_COLORS } from '../../shared/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { statistics, costumes, fetchStatistics, fetchCostumes, loading } = useStore();

  useEffect(() => {
    fetchStatistics();
    fetchCostumes();
  }, [fetchStatistics, fetchCostumes]);

  const sizeChartData = statistics ? Object.entries(statistics.sizeDemand)
    .filter(([size]) => size !== '均码')
    .map(([size, count]) => ({ size, count })) : [];

  const statusChartData = statistics ? Object.entries(statistics.statusDistribution)
    .map(([status, count]) => ({ name: status, value: count }))
    .filter(d => d.value > 0) : [];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#8B5CF6', '#6B7280'];

  const stats = [
    { label: '今日预约', value: statistics?.todayReservations || 0, icon: Calendar, color: 'bg-blue-500', path: '/reservations' },
    { label: '在借数量', value: statistics?.statusDistribution?.借出中 || 0, icon: Package, color: 'bg-yellow-500', path: '/lendings' },
    { label: '逾期未还', value: statistics?.overdueCount || 0, icon: AlertTriangle, color: 'bg-red-500', path: '/statistics' },
    { label: '清洗排队', value: statistics?.cleaningQueueCount || 0, icon: Droplets, color: 'bg-purple-500', path: '/cleaning' },
    { label: '服装总数', value: costumes.length || 0, icon: Shirt, color: 'bg-green-500', path: '/costumes' },
    { label: '缺配件记录', value: statistics?.missingAccessoryCount || 0, icon: Clock, color: 'bg-orange-500', path: '/statistics' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">数据概览</h1>
          <p className="text-gray-500 mt-1">实时监控服装库存、预约和清洗状态</p>
        </div>
        <button
          onClick={() => navigate('/reservations/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建预约
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="card cursor-pointer hover:shadow-lg transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-start justify-between">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">各尺码需求统计</h3>
            <TrendingUp className="w-5 h-5 text-primary-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">服装状态分布</h3>
            <Shirt className="w-5 h-5 text-gold-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {statusChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-slide-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">快捷操作</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '新增服装', icon: Shirt, path: '/costumes/new', color: 'primary' },
              { label: '借出服装', icon: ArrowRight, path: '/lendings', color: 'green' },
              { label: '归还检查', icon: Users, path: '/returns', color: 'blue' },
              { label: '清洗队列', icon: Droplets, path: '/cleaning', color: 'purple' },
            ].map((action, index) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:shadow-md ${
                  action.color === 'primary' ? 'border-primary-200 hover:border-primary-400 hover:bg-primary-50' :
                  action.color === 'green' ? 'border-green-200 hover:border-green-400 hover:bg-green-50' :
                  action.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                  'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <action.icon className={`w-6 h-6 ${
                  action.color === 'primary' ? 'text-primary-500' :
                  action.color === 'green' ? 'text-green-500' :
                  action.color === 'blue' ? 'text-blue-500' :
                  'text-purple-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card animate-slide-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">库存状态速览</h3>
          </div>
          <div className="space-y-3">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
              const inStock = costumes.filter(c => c.size === size && c.status === '在库' && c.cleaningStatus === '干净').length;
              const total = costumes.filter(c => c.size === size).length;
              const percentage = total > 0 ? (inStock / total) * 100 : 0;
              
              return (
                <div key={size} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{size} 码</span>
                    <span className="text-gray-500">{inStock} / {total} 套可用</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 50 ? 'bg-green-500' :
                        percentage > 20 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
