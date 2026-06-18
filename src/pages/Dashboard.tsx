import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Users,
  Sofa,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { ZoneBarChart } from '@/components/charts/ZoneBarChart';
import { HandleTimeChart } from '@/components/charts/HandleTimeChart';
import { QuietHeatmap } from '@/components/charts/QuietHeatmap';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import {
  calculateTopZones,
  calculateAvgHandleTime,
  calculateRepeatReporters,
  calculateFreeSeatsByFloor,
  calculateQuietPeriods,
  calculateHandleTimeTrend,
} from '@/utils/statistics';
import { FLOOR_LABELS } from '@/types';

export default function Dashboard() {
  const { feedbacks, seats } = useFeedbackStore();

  const topZones = calculateTopZones(feedbacks);
  const avgHandleTime = calculateAvgHandleTime(feedbacks);
  const repeatReporters = calculateRepeatReporters(feedbacks);
  const freeSeats = calculateFreeSeatsByFloor(seats);
  const quietPeriods = calculateQuietPeriods(feedbacks);
  const handleTimeTrend = calculateHandleTimeTrend(feedbacks);

  const totalFree = freeSeats.reduce((sum, f) => sum + f.count, 0);

  const quietestHour = quietPeriods.flat().sort((a, b) => b.score - a.score)[0];
  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-lg font-bold">数据统计看板</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                TOP1
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {topZones[0]?.zone || '-'}
            </div>
            <div className="text-sm text-slate-500">
              {topZones[0]?.count || 0} 次反馈 · 最高发区域
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {avgHandleTime} 分钟
            </div>
            <div className="text-sm text-slate-500">平均处理时长</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Sofa className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {totalFree} 个
            </div>
            <div className="text-sm text-slate-500">当前空闲座位</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {quietestHour ? `${dayLabels[quietestHour.day]} ${quietestHour.hour}时` : '-'}
            </div>
            <div className="text-sm text-slate-500">最安静时段</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              高发区域 TOP5
            </h3>
            <ZoneBarChart data={topZones} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              近 7 天处理时长趋势
            </h3>
            <HandleTimeChart data={handleTimeTrend} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sofa className="w-5 h-5 text-emerald-600" />
              各楼层空闲座位
            </h3>
            <div className="space-y-4">
              {freeSeats.map((floor) => (
                <div key={floor.floor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">
                      {FLOOR_LABELS[floor.floor as 1 | 2 | 3]}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {floor.count} / 48
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(floor.count / 48) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              活跃反馈用户
            </h3>
            <div className="space-y-3">
              {repeatReporters.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">暂无数据</p>
              ) : (
                repeatReporters.slice(0, 5).map((reporter, index) => (
                  <div
                    key={reporter.id}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-amber-500 text-white'
                            : index === 1
                            ? 'bg-slate-400 text-white'
                            : index === 2
                            ? 'bg-orange-400 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {reporter.name}
                        </div>
                        <div className="text-xs text-slate-500">{reporter.id}</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {reporter.count} 次
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-600" />
              一周安静时段热力图
            </h3>
            <QuietHeatmap data={quietPeriods} />
          </div>
        </div>
      </main>
    </div>
  );
}
