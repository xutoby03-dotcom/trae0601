import { useAppStore } from '@/store/useAppStore';
import {
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Droplets,
  Target,
  Calendar,
  Award,
} from 'lucide-react';

export default function Statistics() {
  const { points, tasks, issues, layingRecords, recoveryRecords } = useAppStore();

  const activePoints = points.filter((p) => p.status === 'active');

  const completedTasks = tasks.filter((t) => t.status === 'recovered');

  const pointCompletion = activePoints.map((point) => {
    const pointRecords = layingRecords.filter(
      (r) =>
        r.pointId === point.id &&
        (r.status === 'laid' || r.status === 'checked')
    );
    const totalTasks = completedTasks.length + 1;
    const rate = totalTasks > 0 ? (pointRecords.length / totalTasks) * 100 : 0;
    return { point, rate, count: pointRecords.length };
  });

  const sortedByRate = [...pointCompletion].sort((a, b) => b.rate - a.rate);

  const waterIssues = issues.filter((i) => i.type === 'water');
  const waterByPoint = activePoints.map((point) => ({
    point,
    count: waterIssues.filter((i) => i.pointId === point.id).length,
  }));
  const sortedWaterHotSpots = [...waterByPoint]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const unresolvedIssues = issues.filter((i) => i.status !== 'resolved');
  const unrecoveredCount = tasks
    .filter((t) => t.status === 'in_progress' || t.status === 'completed')
    .reduce((acc, task) => {
      const laid = layingRecords.filter(
        (r) =>
          r.taskId === task.id &&
          (r.status === 'laid' || r.status === 'checked')
      ).length;
      const recovered = recoveryRecords.filter((r) => r.taskId === task.id)
        .length;
      return acc + (laid - recovered);
    }, 0);

  const avgResponseTime = 25;
  const avgHandleTime = 1.8;

  const thisMonthTasks = tasks.length;
  const thisMonthIssues = issues.length;

  const maxRate = Math.max(...sortedByRate.map((item) => item.rate), 1);
  const maxWaterCount = Math.max(
    ...sortedWaterHotSpots.map((item) => item.count),
    1
  );

  const issueTypeStats = [
    {
      type: '卷边',
      count: issues.filter((i) => i.type === 'curled').length,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      type: '积水',
      count: issues.filter((i) => i.type === 'water').length,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      type: '脏污',
      count: issues.filter((i) => i.type === 'dirty').length,
      color: 'bg-slate-500',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
    },
  ];

  const totalIssues = issues.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">数据统计</h1>
        <p className="text-sm text-slate-500 mt-1">
          查看点位完成率、积水高发区域、响应时间等关键指标
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">本月雨天次数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {thisMonthTasks}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                较上月 +2
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">点位完成率</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">92.5%</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                较上月 +3.2%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">平均响应时间</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {avgResponseTime}分钟
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                快于标准 35%
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">未回收垫子</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {Math.max(0, unrecoveredCount)}
              </p>
              <p className="text-xs text-slate-400 mt-2">需关注处理</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-5">
            各点位完成率排行
          </h3>
          <div className="space-y-4">
            {sortedByRate.map((item, index) => (
              <div key={item.point.id} className="flex items-center gap-4">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-amber-100 text-amber-700'
                      : index === 1
                      ? 'bg-slate-100 text-slate-600'
                      : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {item.point.name}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {item.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.rate >= 90
                          ? 'bg-green-500'
                          : item.rate >= 70
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${(item.rate / maxRate) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-5">
            问题类型占比
          </h3>
          <div className="space-y-4">
            {issueTypeStats.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-600">{item.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.count} 件
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{
                      width: `${totalIssues > 0 ? (item.count / totalIssues) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  占比{' '}
                  {totalIssues > 0
                    ? ((item.count / totalIssues) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>平均处理时间：{avgHandleTime} 小时</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            积水高发区域 Top 5
          </h3>
          <div className="space-y-4">
            {sortedWaterHotSpots.map((item, index) => (
              <div
                key={item.point.id}
                className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-xl"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-red-500 text-white'
                      : index === 1
                      ? 'bg-orange-500 text-white'
                      : index === 2
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-400 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {item.point.name}
                  </p>
                  <p className="text-xs text-slate-400">{item.point.building}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{item.count}</p>
                  <p className="text-xs text-slate-400">次积水</p>
                </div>
                <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(item.count / maxWaterCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-5">
            本月响应时间
          </h3>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-blue-600">
              {avgResponseTime}
            </div>
            <p className="text-sm text-slate-500 mt-1">分钟 / 平均响应</p>
          </div>
          <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">最快响应</span>
              <span className="text-sm font-medium text-green-600">12分钟</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">最慢响应</span>
              <span className="text-sm font-medium text-amber-600">45分钟</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">目标响应</span>
              <span className="text-sm font-medium text-slate-700">≤30分钟</span>
            </div>
          </div>
          <div className="mt-5 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700 font-medium">达标率 88%</p>
            <p className="text-xs text-green-600 mt-1">
              大部分点位能在30分钟内完成铺设
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-500" />
          待处理问题汇总
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {unresolvedIssues.filter((i) => i.status === 'pending').length}
            </p>
            <p className="text-sm text-amber-600 mt-1">待处理</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {unresolvedIssues.filter((i) => i.status === 'processing').length}
            </p>
            <p className="text-sm text-blue-600 mt-1">处理中</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {issues.filter((i) => i.status === 'resolved').length}
            </p>
            <p className="text-sm text-green-600 mt-1">已解决</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{totalIssues}</p>
            <p className="text-sm text-slate-600 mt-1">问题总数</p>
          </div>
        </div>
      </div>
    </div>
  );
}
