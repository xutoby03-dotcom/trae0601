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
  Legend,
} from 'recharts';
import { Package, AlertTriangle, TrendingDown, ShoppingBag, ArrowRight } from 'lucide-react';
import { useBatchStore } from '@/store/batchStore';
import { useJarStore } from '@/store/jarStore';
import { getDamageLabel } from '@/utils/alert';
import { addDays, nowISO } from '@/utils/date';

const PIE_COLORS = ['#E67E22', '#C0392B', '#7A6B3C'];
const SAFE_STOCK_WEIGHT = 500;

export default function Statistics() {
  const navigate = useNavigate();
  const { batches } = useBatchStore();
  const { jars, operations } = useJarStore();

  const remainingByTea = useMemo(() => {
    const map = new Map<string, number>();
    batches.forEach((b) => {
      const current = map.get(b.name) || 0;
      map.set(b.name, current + b.remainingWeight);
    });
    jars
      .filter((j) => j.status !== 'sold' && j.status !== 'damaged')
      .forEach((j) => {
        const batch = batches.find((b) => b.id === j.batchId);
        if (batch) {
          const current = map.get(batch.name) || 0;
          map.set(batch.name, current + j.currentWeight);
        }
      });
    return Array.from(map.entries())
      .map(([name, weight]) => ({ name, weight: Math.round(weight) }))
      .sort((a, b) => b.weight - a.weight);
  }, [batches, jars]);

  const damageAnalysis = useMemo(() => {
    const map = new Map<string, number>();
    operations
      .filter((o) => o.type === 'damage')
      .forEach((o) => {
        const reason = o.reason.split(' - ')[0];
        const current = map.get(reason) || 0;
        map.set(reason, current + o.weight);
      });
    return Array.from(map.entries()).map(([reason, weight]) => ({
      name: getDamageLabel(reason),
      value: weight,
    }));
  }, [operations]);

  const fastestSelling = useMemo(() => {
    return batches
      .map((batch) => {
        const soldWeight = operations
          .filter((o) => {
            const jar = jars.find((j) => j.id === o.jarId);
            return o.type === 'sale' && jar?.batchId === batch.id;
          })
          .reduce((sum, o) => sum + o.weight, 0);

        const totalRemaining =
          batch.remainingWeight +
          jars
            .filter((j) => j.batchId === batch.id && j.status !== 'sold' && j.status !== 'damaged')
            .reduce((sum, j) => sum + j.currentWeight, 0);

        const sevenDaysAgo = addDays(nowISO(), -7);
        const recentSales = operations
          .filter((o) => {
            const jar = jars.find((j) => j.id === o.jarId);
            return (
              o.type === 'sale' &&
              jar?.batchId === batch.id &&
              new Date(o.operatedAt) >= new Date(sevenDaysAgo)
            );
          })
          .reduce((sum, o) => sum + o.weight, 0);

        const dailyAvg = recentSales / 7;
        const daysLeft = dailyAvg > 0 ? Math.round(totalRemaining / dailyAvg) : 999;

        return {
          batch,
          soldWeight,
          totalRemaining,
          dailyAvg: Math.round(dailyAvg),
          daysLeft,
        };
      })
      .filter((b) => b.totalRemaining > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [batches, jars, operations]);

  const replenishSuggestions = useMemo(() => {
    return remainingByTea
      .filter((item) => item.weight < SAFE_STOCK_WEIGHT)
      .map((item) => ({
        ...item,
        suggestAmount: SAFE_STOCK_WEIGHT * 4 - item.weight,
        urgency: item.weight < SAFE_STOCK_WEIGHT / 2 ? '紧急' : '建议',
      }))
      .sort((a, b) => a.weight - b.weight);
  }, [remainingByTea]);

  const summaryStats = useMemo(() => {
    const totalTeaTypes = new Set(batches.map((b) => b.name)).size;
    const totalJars = jars.filter((j) => j.status !== 'sold' && j.status !== 'damaged').length;
    const totalDamage = operations
      .filter((o) => o.type === 'damage')
      .reduce((sum, o) => sum + o.weight, 0);
    const totalSold = operations.filter((o) => o.type === 'sale').reduce((sum, o) => sum + o.weight, 0);
    return { totalTeaTypes, totalJars, totalDamage, totalSold };
  }, [batches, jars, operations]);

  const statCards = [
    { label: '茶品数量', value: `${summaryStats.totalTeaTypes} 种`, icon: Package, color: 'text-teaGreen-600', bg: 'bg-teaGreen-50' },
    { label: '在库罐数', value: `${summaryStats.totalJars} 罐`, icon: ShoppingBag, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: '累计售卖', value: `${summaryStats.totalSold} g`, icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '累计报损', value: `${summaryStats.totalDamage} g`, icon: AlertTriangle, color: 'text-dangerRed', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="card !p-0 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 font-serif">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">各茶品剩余重量</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={remainingByTea} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDC4" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#5A4F2B', fontSize: 12 }} axisLine={{ stroke: '#D4C59E' }} tickLine={false} />
              <YAxis tick={{ fill: '#5A4F2B', fontSize: 12 }} axisLine={{ stroke: '#D4C59E' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #D4C59E',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: number) => [`${value} g`, '剩余重量']}
              />
              <Bar dataKey="weight" fill="#2D5A27" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">报损原因分析</h3>
          {damageAnalysis.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-gray-400">暂无报损数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={damageAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {damageAnalysis.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D4C59E',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value} g`, '报损重量']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-warnOrange" />
            最快售完批次 TOP5
          </h3>
          <div className="space-y-3">
            {fastestSelling.map((item, idx) => (
              <div
                key={item.batch.id}
                className="p-4 rounded-xl bg-gradient-to-r from-tea-50 to-transparent hover:shadow-sm transition-shadow flex items-center gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-dangerRed text-white' : idx < 3 ? 'bg-warnOrange text-white' : 'bg-tea-200 text-tea-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">{item.batch.name}</p>
                    <span
                      className={`text-sm font-bold ${
                        item.daysLeft <= 7 ? 'text-dangerRed' : item.daysLeft <= 15 ? 'text-warnOrange' : 'text-teaGreen-600'
                      }`}
                    >
                      约 {item.daysLeft} 天售完
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>剩余 {item.totalRemaining}g</span>
                    <span>日均销 {item.dailyAvg}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-tea-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.daysLeft <= 7 ? 'bg-dangerRed' : item.daysLeft <= 15 ? 'bg-warnOrange' : 'bg-teaGreen-500'
                      }`}
                      style={{ width: `${Math.min(100, (1 - item.totalRemaining / item.batch.totalWeight) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-teaGreen-600" />
            补货建议
          </h3>
          {replenishSuggestions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>所有茶品库存充足</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replenishSuggestions.map((item) => (
                <div
                  key={item.name}
                  className={`p-4 rounded-xl border-2 transition-shadow hover:shadow-sm flex items-center justify-between ${
                    item.urgency === '紧急' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.urgency === '紧急' ? 'bg-dangerRed animate-pulse' : 'bg-warnOrange'
                      }`}
                    ></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.urgency === '紧急' ? 'bg-red-100 text-dangerRed' : 'bg-amber-100 text-warnOrange'
                          }`}
                        >
                          {item.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">当前库存 {item.weight}g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">建议补货</p>
                    <p className="font-bold text-teaGreen-600">{item.suggestAmount}g</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate('/batches/new')}
                className="w-full mt-2 p-3 rounded-xl border-2 border-dashed border-tea-200 text-teaGreen-600 hover:border-teaGreen-400 hover:bg-teaGreen-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                去新增批次
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
