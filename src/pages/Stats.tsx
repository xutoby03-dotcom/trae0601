import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSeasoningStore } from '@/store/useSeasoningStore';
import { getSeasoningStatus } from '@/utils/seasoningUtils';

const COLORS = ['#E67E22', '#27AE60', '#F39C12', '#3498DB', '#9B59B6', '#E74C3C', '#1ABC9C'];

export default function StatsPage() {
  const navigate = useNavigate();
  const { seasonings, wasteRecords } = useSeasoningStore();

  const activeSeasonings = seasonings.filter((s) => s.status === 'active');

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    activeSeasonings.forEach((s) => {
      map.set(s.category, (map.get(s.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeSeasonings]);

  const wasteByCategory = useMemo(() => {
    const map = new Map<string, { count: number; amount: number; unit: string }>();
    wasteRecords.forEach((w) => {
      const existing = map.get(w.category) || { count: 0, amount: 0, unit: w.unit };
      map.set(w.category, {
        count: existing.count + 1,
        amount: existing.amount + w.wastedAmount,
        unit: w.unit,
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, count: data.count, amount: data.amount, unit: data.unit }))
      .sort((a, b) => b.count - a.count);
  }, [wasteRecords]);

  const duplicateItems = useMemo(() => {
    const map = new Map<string, typeof activeSeasonings>();
    activeSeasonings.forEach((s) => {
      const key = `${s.name}-${s.brand}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries())
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => {
        const [name, brand] = key.split('-');
        return { name, brand, count: items.length, items };
      })
      .sort((a, b) => b.count - a.count);
  }, [activeSeasonings]);

  const statusStats = useMemo(() => {
    let fresh = 0;
    let soon = 0;
    let expired = 0;

    activeSeasonings.forEach((s) => {
      const status = getSeasoningStatus(s);
      if (status === 'fresh') fresh++;
      else if (status === 'soon') soon++;
      else expired++;
    });

    return [
      { name: '正常', value: fresh, color: '#27AE60' },
      { name: '快到期', value: soon, color: '#F39C12' },
      { name: '已过期', value: expired, color: '#E74C3C' },
    ].filter((s) => s.value > 0);
  }, [activeSeasonings]);

  const totalWasted = wasteRecords.length;
  const totalWastedAmount = wasteRecords.reduce((sum, w) => sum + w.wastedAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-gray-50 pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={24} />
              <h1 className="text-lg font-bold text-gray-800">统计分析</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-primary-500" size={18} />
              <span className="text-sm text-gray-500">在用调料</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{activeSeasonings.length}</div>
            <div className="text-xs text-gray-400 mt-1">
              {categoryData.length} 个类别
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-status-expired" size={18} />
              <span className="text-sm text-gray-500">累计浪费</span>
            </div>
            <div className="text-2xl font-bold text-status-expired">{totalWasted}</div>
            <div className="text-xs text-gray-400 mt-1">
              约 {totalWastedAmount.toFixed(0)} 份
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 状态分布
          </h2>
          {statusStats.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {statusStats.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-gray-600">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🗑️ 浪费类别分析
          </h2>
          {wasteByCategory.length > 0 ? (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteByCategory} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#E74C3C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {wasteByCategory.slice(0, 3).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {item.name}
                    </span>
                    <span className="text-sm font-medium text-status-expired">
                      {item.count} 次浪费
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm">还没有浪费记录，继续保持！</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-status-soon" size={20} />
            重复购买预警
          </h2>
          {duplicateItems.length > 0 ? (
            <div className="space-y-3">
              {duplicateItems.map((item) => (
                <div
                  key={`${item.name}-${item.brand}`}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-2">{item.brand}</span>
                    </div>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                      {item.count} 瓶
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700">
                    💡 同一调料同时开了 {item.count} 瓶，容易过期浪费，建议用完一瓶再开下一瓶
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center text-gray-400">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm">没有重复购买的情况</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📦 各类别数量
          </h2>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
                  <span className="text-sm font-medium text-gray-800">{cat.value} 种</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cat.value / categoryData[0].value) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
