import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation,
  Mountain,
  Bike,
  TrendingUp,
  AlertTriangle,
  Flame,
  Trophy,
  BarChart3,
  Clock,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useStore } from '@/store/useStore';
import { isThisMonth, formatDuration } from '@/utils/formatters';
import type { Route } from '@/types';

export default function Stats() {
  const { routes, checkins } = useStore();

  const stats = useMemo(() => {
    const monthCheckins = checkins.filter((c) => isThisMonth(c.date));

    let totalKm = 0;
    let totalElevation = 0;
    let totalDuration = 0;
    const routeCountMap = new Map<string, number>();
    const problemMap = new Map<string, { flat: number; lost: number; crash: number }>();

    monthCheckins.forEach((c) => {
      const route = routes.find((r) => r.id === c.routeId);
      if (!route) return;

      totalKm += route.distance;
      totalElevation += route.elevation;
      totalDuration += c.duration;

      routeCountMap.set(route.id, (routeCountMap.get(route.id) || 0) + 1);

      const problems = problemMap.get(route.id) || { flat: 0, lost: 0, crash: 0 };
      if (c.hadFlat) problems.flat++;
      if (c.gotLost) problems.lost++;
      if (c.hadCrash) problems.crash++;
      problemMap.set(route.id, problems);
    });

    // 最常骑路线排行
    const topRoutes = Array.from(routeCountMap.entries())
      .map(([routeId, count]) => ({
        route: routes.find((r) => r.id === routeId) as Route,
        count,
      }))
      .filter((item) => item.route)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 问题最多的路线
    const problemRoutes = Array.from(problemMap.entries())
      .map(([routeId, p]) => ({
        route: routes.find((r) => r.id === routeId) as Route,
        total: p.flat + p.lost + p.crash,
        ...p,
      }))
      .filter((item) => item.route && item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const avgSpeed =
      monthCheckins.length > 0
        ? (
            monthCheckins.reduce((s, c) => s + c.avgSpeed, 0) / monthCheckins.length
          ).toFixed(1)
        : '0';

    return {
      totalKm: totalKm.toFixed(1),
      totalElevation,
      totalDuration,
      ridesCount: monthCheckins.length,
      avgSpeed,
      topRoutes,
      problemRoutes,
    };
  }, [checkins, routes]);

  return (
    <div className="page-container">
      <div className="container max-w-6xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white mb-4 shadow-lg shadow-violet-900/40">
            <BarChart3 className="h-4 w-4" />
            骑行数据
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            本月骑行统计
          </h1>
          <p className="text-slate-400">用数据见证每一次轮迹</p>
        </div>

        {/* 核心数据卡 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon={Navigation}
            label="本月里程"
            value={stats.totalKm}
            unit="km"
            gradient="from-emerald-500 to-teal-400"
            iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
            delay={0}
          />
          <StatCard
            icon={Bike}
            label="骑行次数"
            value={stats.ridesCount}
            unit="次"
            gradient="from-sky-500 to-indigo-400"
            iconBg="bg-gradient-to-br from-sky-500 to-indigo-500"
            delay={80}
          />
          <StatCard
            icon={Mountain}
            label="累计爬升"
            value={stats.totalElevation}
            unit="m"
            gradient="from-orange-500 to-amber-400"
            iconBg="bg-gradient-to-br from-orange-500 to-amber-500"
            delay={160}
          />
          <StatCard
            icon={TrendingUp}
            label="平均速度"
            value={stats.avgSpeed}
            unit="km/h"
            gradient="from-violet-500 to-purple-400"
            iconBg="bg-gradient-to-br from-violet-500 to-purple-500"
            delay={240}
          />
        </div>

        {/* 总用时 */}
        {stats.totalDuration > 0 && (
          <div className="card-base p-6 mb-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 via-slate-800/20 to-transparent" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">本月骑行总时长</p>
                  <p className="font-display text-3xl font-bold text-white">
                    {formatDuration(stats.totalDuration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-full px-4 py-2">
                <Flame className="h-4 w-4" />
                坚持就是胜利！
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最常骑路线 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              最常骑路线 TOP {Math.min(5, stats.topRoutes.length)}
            </h2>

            {stats.topRoutes.length > 0 ? (
              <div className="space-y-3">
                {stats.topRoutes.map((item, idx) => (
                  <Link
                    key={item.route.id}
                    to={`/route/${item.route.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 transition-all group"
                    style={{ animation: `staggerIn 0.4s ease-out ${idx * 60}ms both` }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white flex-shrink-0 ${
                        idx === 0
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                          : idx === 1
                          ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800'
                          : idx === 2
                          ? 'bg-gradient-to-br from-orange-400 to-amber-600'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>

                    <img
                      src={item.route.coverImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {item.route.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {item.route.startPoint} · {item.route.distance}km
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-2xl font-bold text-emerald-400">
                        {item.count}
                        <span className="text-sm font-normal text-slate-400 ml-0.5">次</span>
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-5xl mb-3">🏆</div>
                <p className="text-slate-400">本月还没有骑行记录</p>
                <Link to="/" className="btn-primary mt-5 !py-2 text-sm inline-flex">
                  去选条路线出发
                </Link>
              </div>
            )}
          </div>

          {/* 问题路段分析 */}
          <div className="card-base p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              问题路段分析
            </h2>

            {stats.problemRoutes.length > 0 ? (
              <div className="space-y-4">
                {stats.problemRoutes.map((item, idx) => (
                  <div
                    key={item.route.id}
                    className="p-4 rounded-xl bg-slate-900/40"
                    style={{ animation: `staggerIn 0.4s ease-out ${idx * 60}ms both` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Link
                        to={`/route/${item.route.id}`}
                        className="font-semibold text-white truncate hover:text-emerald-400 transition-colors pr-3"
                      >
                        {item.route.name}
                      </Link>
                      <div className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-400 px-3 py-0.5 text-sm font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {item.total} 次
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div
                        className={`text-center py-2 rounded-lg text-xs ${
                          item.flat > 0 ? 'bg-rose-500/15 text-rose-300' : 'bg-slate-800/50 text-slate-500'
                        }`}
                      >
                        💥 爆胎 {item.flat}
                      </div>
                      <div
                        className={`text-center py-2 rounded-lg text-xs ${
                          item.lost > 0 ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-800/50 text-slate-500'
                        }`}
                      >
                        🧭 迷路 {item.lost}
                      </div>
                      <div
                        className={`text-center py-2 rounded-lg text-xs ${
                          item.crash > 0 ? 'bg-red-500/15 text-red-300' : 'bg-slate-800/50 text-slate-500'
                        }`}
                      >
                        🩹 摔车 {item.crash}
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            (item.total / (stats.problemRoutes[0]?.total || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold text-white mb-1">太棒了！</p>
                <p className="text-slate-400">本月骑行没有发生任何问题</p>
              </div>
            )}
          </div>
        </div>

        {/* 历史记录回顾 */}
        {checkins.length > 0 && (
          <div className="card-base p-6 md:p-8 mt-10">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              全部骑行记录 <span className="text-slate-500 text-base font-normal">({checkins.length})</span>
            </h2>
            <div className="divide-y divide-slate-700/50 -mx-2">
              {checkins
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((c, idx) => {
                  const route = routes.find((r) => r.id === c.routeId);
                  if (!route) return null;
                  return (
                    <Link
                      key={c.id}
                      to={`/route/${route.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/40 transition-colors group"
                      style={{ animation: `staggerIn 0.3s ease-out ${idx * 40}ms both` }}
                    >
                      <img
                        src={route.coverImage}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {route.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          <span className="text-emerald-400">{c.riderName}</span> ·{' '}
                          {formatDuration(c.duration)} · {c.avgSpeed}km/h
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-300">
                          {new Date(c.date).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-amber-400 mt-0.5">
                          {'★'.repeat(c.difficulty)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
