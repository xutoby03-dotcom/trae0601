import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import TodayPickups from '@/components/dashboard/TodayPickups';
import FreshWarning from '@/components/dashboard/FreshWarning';
import CancelledRanking from '@/components/dashboard/CancelledRanking';
import { useReservationStore } from '@/store/reservationStore';
import { useBouquetStore } from '@/store/bouquetStore';
import { daysUntil } from '@/utils/date';
import { CalendarCheck, AlertTriangle, TrendingUp, Flower2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { reservations, getTodayPickups } = useReservationStore();
  const { bouquets } = useBouquetStore();

  const todayPickups = getTodayPickups();
  const completedCount = reservations.filter(r => r.status === 'completed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
  const totalReservations = reservations.length;
  const conversionRate = totalReservations > 0 
    ? Math.round((completedCount / (completedCount + cancelledCount || 1)) * 100)
    : 0;

  const freshWarningCount = bouquets.filter(b => daysUntil(b.freshUntil) <= 2 && b.stock > 0).length;

  const weeklyData = [
    { name: '周一', 预留: 5, 完成: 4 },
    { name: '周二', 预留: 8, 完成: 7 },
    { name: '周三', 预留: 6, 完成: 5 },
    { name: '周四', 预留: 10, 完成: 9 },
    { name: '周五', 预留: 7, 完成: 6 },
    { name: '周六', 预留: 12, 完成: 11 },
    { name: '周日', 预留: 9, 完成: 8 },
  ];

  const statusData = [
    { name: '待取花', value: reservations.filter(r => r.status === 'pending').length, color: '#3B82F6' },
    { name: '待确认', value: reservations.filter(r => r.status === 'to_confirm').length, color: '#F59E0B' },
    { name: '已完成', value: reservations.filter(r => r.status === 'completed').length, color: '#10B981' },
    { name: '已取消', value: reservations.filter(r => r.status === 'cancelled').length, color: '#F43F5E' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="老板看板" 
        subtitle="今日营业数据一览"
      />
      
      <div className="flex-1 p-8 bg-cream-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="今日待取"
            value={todayPickups.length}
            subtitle="笔订单"
            icon={<CalendarCheck className="w-6 h-6" />}
            trend={{ value: '15%', isUp: true }}
            color="rose"
            onClick={() => navigate('/reservations?status=pending')}
            clickableHint="查看待取"
          />
          <StatCard
            title="保鲜预警"
            value={freshWarningCount}
            subtitle="款花束快到期"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="gold"
            onClick={() => navigate('/bouquets?filter=expiring')}
            clickableHint="查看花束"
          />
          <StatCard
            title="成交转化率"
            value={`${conversionRate}%`}
            subtitle="预留转成交比例"
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: '5%', isUp: true }}
            color="forest"
          />
          <StatCard
            title="花束款式"
            value={bouquets.length}
            subtitle="在售款式数"
            icon={<Flower2 className="w-6 h-6" />}
            color="blue"
            onClick={() => navigate('/bouquets')}
            clickableHint="全部花束"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-5">
            <h3 className="font-semibold font-serif text-forest-700 mb-4">本周预留趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3ECE2" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E9DDCC',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar dataKey="预留" fill="#E8A598" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="完成" fill="#2D4A3E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h3 className="font-semibold font-serif text-forest-700 mb-4">订单状态分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E9DDCC',
                      borderRadius: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-forest-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <TodayPickups />
          </div>
          <div className="lg:col-span-1">
            <FreshWarning />
          </div>
          <div className="lg:col-span-1">
            <CancelledRanking />
          </div>
        </div>
      </div>
    </div>
  );
}
