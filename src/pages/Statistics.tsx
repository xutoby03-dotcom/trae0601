import { useEffect, useState } from 'react';
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
  TrendingUp,
  AlertTriangle,
  Droplets,
  Crown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { statisticsApi } from '../services/costumeService';
import { costumeApi } from '../services/costumeService';
import type { UsageStat, ClubRanking, MissingRateStat, Costume } from '../../shared/types';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../stores/appStore';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<'usage' | 'clubs' | 'wash'>('usage');
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [clubRankings, setClubRankings] = useState<ClubRanking[]>([]);
  const [missingRate, setMissingRate] = useState<MissingRateStat | null>(null);
  const [washList, setWashList] = useState<Costume[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshOverview } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usage, clubs, missing, wash] = await Promise.all([
        statisticsApi.getUsageStats(10),
        statisticsApi.getClubRankings(),
        statisticsApi.getMissingRate(),
        statisticsApi.getWashList(),
      ]);
      setUsageStats(usage);
      setClubRankings(clubs);
      setMissingRate(missing);
      setWashList(wash);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWashed = async (id: string) => {
    try {
      await costumeApi.markWashed(id);
      await refreshOverview();
      loadData();
    } catch (error) {
      console.error('Failed to mark as washed:', error);
    }
  };

  const handleMarkAllWashed = async () => {
    if (!confirm('确定要将所有待洗服装标记为已清洗吗？')) return;
    try {
      for (const costume of washList) {
        await costumeApi.markWashed(costume.id);
      }
      await refreshOverview();
      loadData();
    } catch (error) {
      console.error('Failed to mark all as washed:', error);
    }
  };

  const COLORS = ['#1e5aff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const pieData = [
    { name: '正常归还', value: missingRate ? missingRate.total_returns - missingRate.missing_returns : 0 },
    { name: '缺件归还', value: missingRate?.missing_returns || 0 },
  ];

  const tabs = [
    { key: 'usage', label: '使用统计', icon: TrendingUp },
    { key: 'clubs', label: '社团排行', icon: Crown },
    { key: 'wash', label: '待洗管理', icon: Droplets },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">统计报表</h1>
        <p className="text-gray-500 mt-1">查看服装使用数据和统计分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总使用次数</p>
              <p className="text-2xl font-bold text-gray-800">
                {usageStats.reduce((sum, item) => sum + item.use_count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">缺件率</p>
              <p className="text-2xl font-bold text-gray-800">
                {missingRate?.missing_rate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">待清洗数量</p>
              <p className="text-2xl font-bold text-gray-800">{washList.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-3">加载中...</p>
            </div>
          ) : activeTab === 'usage' ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">使用次数排行</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="costume_name"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => [`${value} 次`, '使用次数']}
                      />
                      <Bar dataKey="use_count" fill="#1e5aff" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">缺件率分析</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.name === '正常归还' ? '#10b981' : '#ef4444'}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">正常归还</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-600">缺件归还</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">快速统计</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">总归还次数</span>
                      </div>
                      <span className="font-bold text-gray-800 text-lg">
                        {missingRate?.total_returns}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-gray-700">缺件归还次数</span>
                      </div>
                      <span className="font-bold text-gray-800 text-lg">
                        {missingRate?.missing_returns}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'clubs' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">社团借用排行</h3>
              {clubRankings.length > 0 ? (
                <div className="space-y-3">
                  {clubRankings.map((club, index) => (
                    <div
                      key={club.club_name}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-white'
                            : index === 1
                            ? 'bg-gray-300 text-white'
                            : index === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{club.club_name}</p>
                        <p className="text-sm text-gray-500">
                          借用 {club.borrow_count} 次
                          {club.overdue_count > 0 && (
                            <span className="text-red-500 ml-2">
                              · 逾期 {club.overdue_count} 次
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${(club.borrow_count / Math.max(...clubRankings.map((c) => c.borrow_count), 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-12">暂无数据</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">待清洗服装</h3>
                {washList.length > 0 && (
                  <Button size="sm" variant="outline" onClick={handleMarkAllWashed}>
                    全部标记已洗
                  </Button>
                )}
              </div>
              {washList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {washList.map((costume) => (
                    <div
                      key={costume.id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-gray-50">
                        {costume.photo_url ? (
                          <img
                            src={costume.photo_url}
                            alt={costume.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            👗
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-800 truncate">{costume.name}</h4>
                        <p className="text-sm text-gray-500">{costume.id} · {costume.size}</p>
                        <Button
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => handleMarkWashed(costume.id)}
                        >
                          标记已清洗
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">太棒了！所有服装都已清洗干净</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
