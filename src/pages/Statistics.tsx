import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';
import {
  BarChart3,
  TrendingDown,
  AlertTriangle,
  Package,
  Star,
  Coffee,
  Clock,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useBatchStore } from '../store/useBatchStore';
import { computeStatistics } from '../utils/statsUtils';
import { getBatchStatus } from '../utils/statusUtils';
import { formatDateShort } from '../utils/dateUtils';

const COLORS = ['#5D4037', '#8D6E63', '#FF8A65', '#81C784', '#FFD54F', '#BCAAA4'];

export default function Statistics() {
  const navigate = useNavigate();
  const { batches, records } = useBatchStore();

  const stats = useMemo(() => {
    return computeStatistics(batches, records);
  }, [batches, records]);

  const methodStats = useMemo(() => {
    const methods: Record<string, number> = {
      pour_over: 0,
      espresso: 0,
      cold_brew: 0,
    };
    records.forEach((r) => {
      methods[r.method] = (methods[r.method] || 0) + r.grams;
    });
    return [
      { name: '手冲', value: methods.pour_over },
      { name: '意式', value: methods.espresso },
      { name: '冷萃', value: methods.cold_brew },
    ].filter((d) => d.value > 0);
  }, [records]);

  const weeklyConsumption = useMemo(() => {
    const last7Days: { date: string; grams: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecords = records.filter((r) => r.date === dateStr);
      const totalGrams = dayRecords.reduce((sum, r) => sum + r.grams, 0);
      last7Days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        grams: totalGrams,
      });
    }
    return last7Days;
  }, [records]);

  const avgDailyConsumption = useMemo(() => {
    const total = weeklyConsumption.reduce((sum, d) => sum + d.grams, 0);
    return Math.round(total / 7);
  }, [weeklyConsumption]);

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 font-serif mb-2 flex items-center gap-3">
            <BarChart3 className="text-sunset-500" />
            数据统计
          </h1>
          <p className="text-coffee-500">了解你的咖啡消耗和风味偏好</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-coffee-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-coffee-700" />
              </div>
            </div>
            <p className="text-sm text-coffee-500 mb-1">总批次</p>
            <p className="text-2xl font-bold text-coffee-900 font-serif">
              {stats.totalBatches}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-coffee-500 mb-1">养豆中</p>
            <p className="text-2xl font-bold text-amber-600 font-serif">
              {stats.restingCount}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-sunset-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-sunset-500" />
              </div>
            </div>
            <p className="text-sm text-coffee-500 mb-1">即将过期</p>
            <p className="text-2xl font-bold text-sunset-500 font-serif">
              {stats.expiringSoon}
            </p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-matcha-100 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-matcha-600" />
              </div>
            </div>
            <p className="text-sm text-coffee-500 mb-1">总消耗</p>
            <p className="text-2xl font-bold text-matcha-600 font-serif">
              {stats.totalConsumed}g
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4">
              近 7 天消耗趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8D6E63', fontSize: 12 }}
                    axisLine={{ stroke: '#D7CCC8' }}
                  />
                  <YAxis
                    tick={{ fill: '#8D6E63', fontSize: 12 }}
                    axisLine={{ stroke: '#D7CCC8' }}
                    unit="g"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFDF5',
                      border: '1px solid #D7CCC8',
                      borderRadius: '12px',
                      color: '#3E2723',
                    }}
                    formatter={(value: number) => [`${value}g`, '消耗量']}
                  />
                  <Bar dataKey="grams" fill="#8D6E63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-coffee-50">
              <p className="text-sm text-coffee-500">
                日均消耗：
                <span className="font-semibold text-coffee-800">
                  {avgDailyConsumption}g
                </span>
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4">
              冲煮方式占比
            </h3>
            <div className="h-64 flex items-center justify-center">
              {methodStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={methodStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {methodStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}g`, '消耗量']}
                      contentStyle={{
                        backgroundColor: '#FFFDF5',
                        border: '1px solid #D7CCC8',
                        borderRadius: '12px',
                        color: '#3E2723',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-coffee-400">暂无数据</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {methodStats.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-coffee-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-coffee-600" />
              消耗速度排行
            </h3>
            <div className="space-y-3">
              {stats.consumptionRates.length === 0 ? (
                <p className="text-coffee-400 text-center py-8">暂无数据</p>
              ) : (
                stats.consumptionRates.slice(0, 5).map((item, index) => (
                  <div
                    key={item.batchId}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/batch/${item.batchId}`)}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-400 text-white'
                          : index === 1
                          ? 'bg-coffee-300 text-white'
                          : index === 2
                          ? 'bg-coffee-200 text-coffee-700'
                          : 'bg-cream-100 text-coffee-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-coffee-800 truncate">
                        {item.origin}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-coffee-900">
                        {item.rate}g
                      </p>
                      <p className="text-xs text-coffee-400">/ 天</p>
                    </div>
                    <ArrowRight size={16} className="text-coffee-300" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              出品评价排行
            </h3>
            <div className="space-y-3">
              {stats.avgRatings.length === 0 ? (
                <p className="text-coffee-400 text-center py-8">暂无评分</p>
              ) : (
                stats.avgRatings.slice(0, 5).map((item, index) => (
                  <div
                    key={item.batchId}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/batch/${item.batchId}`)}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-400 text-white'
                          : index === 1
                          ? 'bg-coffee-300 text-white'
                          : index === 2
                          ? 'bg-coffee-200 text-coffee-700'
                          : 'bg-cream-100 text-coffee-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-coffee-800 truncate">
                        {item.origin}
                      </p>
                      <p className="text-xs text-coffee-400">
                        {item.count} 次评价
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="font-semibold text-coffee-900">
                        {item.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              浪费统计
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
                <TrendingDown className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500 font-serif">
                  {stats.totalWasted}g
                </p>
                <p className="text-sm text-coffee-500">
                  因过期或余量不足浪费
                </p>
              </div>
            </div>
            <div className="p-4 bg-cream-50 rounded-xl">
              <p className="text-sm text-coffee-600">
                💡 建议：关注即将过期的豆子，优先饮用风味下降期的批次
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-coffee-900 font-serif mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sunset-500" />
              下周补货建议
            </h3>
            <div className="space-y-3">
              {stats.restockSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-matcha-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-matcha-500" />
                  </div>
                  <p className="text-coffee-500">库存充足</p>
                  <p className="text-sm text-coffee-400 mt-1">
                    所有豆子都能维持一周以上
                  </p>
                </div>
              ) : (
                stats.restockSuggestions.map((item) => (
                  <div
                    key={item.batchId}
                    className="p-4 bg-sunset-50 rounded-xl border border-sunset-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-coffee-900">
                        {item.origin}
                      </p>
                      <span className="text-xs bg-sunset-400 text-white px-2 py-0.5 rounded-full">
                        需补货
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-coffee-500">当前剩余</p>
                        <p className="font-medium text-coffee-800">
                          {item.currentWeight}g
                        </p>
                      </div>
                      <div>
                        <p className="text-coffee-500">日均消耗</p>
                        <p className="font-medium text-coffee-800">
                          {item.dailyRate.toFixed(1)}g
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-coffee-500">预计耗尽日期</p>
                        <p className="font-medium text-sunset-600">
                          {formatDateShort(item.estimatedEmptyDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
