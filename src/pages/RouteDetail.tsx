import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Mountain,
  TrendingUp,
  Clock,
  Play,
  Users,
  Star,
  Calendar,
  Map,
  AlertTriangle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { useStore } from '@/store/useStore';
import {
  CATEGORY_LABELS,
  ROAD_CONDITION_LABELS,
  SUPPLY_LABELS,
  RISK_LABELS,
  DIFFICULTY_LABELS,
} from '@/utils/constants';
import { formatDuration, formatDate, formatDateTime } from '@/utils/formatters';

export default function RouteDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getRouteById, getCheckinsByRouteId, getEventsByRouteId } = useStore();

  const route = getRouteById(id);
  const checkins = getCheckinsByRouteId(id);
  const events = getEventsByRouteId(id);

  if (!route) {
    return (
      <div className="page-container">
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-3">
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <div className="card-base py-24 text-center">
            <div className="text-6xl mb-4">🧭</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">路线不存在</h2>
            <p className="text-slate-400 mb-6">该路线可能已被删除</p>
            <Link to="/" className="btn-primary">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_LABELS[route.category];
  const avgSpeed =
    checkins.length > 0
      ? (checkins.reduce((s, c) => s + c.avgSpeed, 0) / checkins.length).toFixed(1)
      : null;
  const avgDuration =
    checkins.length > 0
      ? Math.round(checkins.reduce((s, c) => s + c.duration, 0) / checkins.length)
      : null;
  const avgDifficulty =
    checkins.length > 0
      ? (checkins.reduce((s, c) => s + c.difficulty, 0) / checkins.length).toFixed(1)
      : null;

  const hasDanger = route.risks.some((r) => RISK_LABELS[r].level === 'danger');

  return (
    <div className="page-container">
      <div className="container max-w-6xl">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        {/* 头图区 */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <div className="aspect-[21/9] max-h-[380px] bg-slate-900">
            <img
              src={route.coverImage}
              alt={route.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r ${cat.color} shadow-lg`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </div>
              {route.risks.map((r) => (
                <RiskBadge key={r} type={r} />
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              {route.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                {route.startPoint} → {route.endPoint}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                创建于 {formatDate(route.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 风险提醒（如果有高风险） */}
        {route.risks.length > 0 && (
          <div
            className={`card-base p-5 mb-8 border-2 ${
              hasDanger ? 'border-red-500/40 bg-red-500/5' : 'border-amber-500/40 bg-amber-500/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  hasDanger ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {hasDanger ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${hasDanger ? 'text-red-300' : 'text-amber-300'}`}>
                  安全提醒 - 请务必注意
                </h3>
                <div className="flex flex-wrap gap-2">
                  {route.risks.map((r) => (
                    <div
                      key={r}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        RISK_LABELS[r].level === 'danger'
                          ? 'bg-red-500/15 text-red-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      <span className="mr-1">{RISK_LABELS[r].emoji}</span>
                      <span className="font-medium">{RISK_LABELS[r].label}</span>
                      <span className="opacity-70 ml-2">
                        {RISK_LABELS[r].level === 'danger' ? '高风险' : '注意'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 核心数据 + 操作按钮 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card-base p-6">
            <h3 className="font-display text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Map className="h-5 w-5 text-emerald-400" />
              路线数据
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-slate-900/40">
                <Navigation className="h-5 w-5 text-sky-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">距离</p>
                <p className="font-display text-2xl font-bold text-white">
                  {route.distance}
                  <span className="text-xs font-normal text-slate-400 ml-1">km</span>
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-900/40">
                <Mountain className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">累计爬升</p>
                <p className="font-display text-2xl font-bold text-white">
                  {route.elevation}
                  <span className="text-xs font-normal text-slate-400 ml-1">m</span>
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-900/40">
                <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">平均速度</p>
                <p className="font-display text-2xl font-bold text-white">
                  {avgSpeed || '--'}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    {avgSpeed ? 'km/h' : ''}
                  </span>
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-900/40">
                <Clock className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">平均用时</p>
                <p className="font-display text-2xl font-bold text-white">
                  {avgDuration ? formatDuration(avgDuration) : '--'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-slate-400">路况：</span>
                  <span className="text-slate-200">
                    {ROAD_CONDITION_LABELS[route.roadCondition].emoji}{' '}
                    {ROAD_CONDITION_LABELS[route.roadCondition].label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">补给：</span>
                  {route.hasSupply && route.supplyTypes.length > 0 ? (
                    <span className="text-emerald-400">
                      {route.supplyTypes.map((s) => SUPPLY_LABELS[s].emoji).join(' ')}
                      {route.supplyTypes.map((s) => SUPPLY_LABELS[s].label).join('、')}
                    </span>
                  ) : (
                    <span className="text-rose-400">无，请自备</span>
                  )}
                </div>
                {avgDifficulty && (
                  <div>
                    <span className="text-slate-400">体感难度：</span>
                    <span className="text-amber-400">
                      {'★'.repeat(Math.round(Number(avgDifficulty)))}
                      {'☆'.repeat(5 - Math.round(Number(avgDifficulty)))}{' '}
                      {DIFFICULTY_LABELS[Math.round(Number(avgDifficulty))]}
                    </span>
                  </div>
                )}
              </div>

              {route.description && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">路线介绍：</p>
                  <p className="text-slate-200 leading-relaxed">{route.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="space-y-4">
            <Link
              to={`/route/${route.id}/checkin`}
              className="card-base p-5 block hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white">记录骑行打卡</h4>
                  <p className="text-xs text-slate-400 mt-0.5">记录用时、速度、问题</p>
                </div>
              </div>
            </Link>

            <Link
              to={`/route/${route.id}/join`}
              className="card-base p-5 block hover:border-sky-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 shadow-lg shadow-sky-900/40 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white">发起/参与约骑</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {events.length > 0 ? `${events.length} 场活动进行中` : '找个同伴一起骑'}
                  </p>
                </div>
              </div>
            </Link>

            <div className="card-base p-5">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                快速统计
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">打卡次数</span>
                  <span className="font-semibold text-white">{checkins.length} 次</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">约骑活动</span>
                  <span className="font-semibold text-sky-400">{events.length} 场</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">问题上报</span>
                  <span className="font-semibold text-rose-400">
                    {checkins.filter((c) => c.hadFlat || c.gotLost || c.hadCrash).length} 次
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 约骑活动 */}
        {events.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-400" />
              近期约骑活动
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((e) => (
                <div key={e.id} className="card-base p-5 hover:border-sky-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-bold text-white">{e.title}</h3>
                    <Link
                      to={`/route/${route.id}/join`}
                      className="text-xs text-sky-400 hover:text-sky-300"
                    >
                      报名 →
                    </Link>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {formatDateTime(e.meetTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {e.meetPoint}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">
                        {e.participants.length} 人已报名
                      </span>
                      {e.participants.some((p) => p.canLead) && (
                        <span className="ml-auto text-xs bg-emerald-500/15 text-emerald-400 rounded-full px-2.5 py-0.5">
                          ✅ 有领队
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 打卡记录 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-400" />
              骑行打卡记录
            </h2>
            <Link to={`/route/${route.id}/checkin`} className="btn-primary !py-2 !px-4 text-sm">
              <Plus className="h-4 w-4" />
              新增打卡
            </Link>
          </div>

          {checkins.length > 0 ? (
            <div className="card-base overflow-hidden">
              <div className="divide-y divide-slate-700/50">
                {checkins.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-5 hover:bg-slate-800/40 transition-colors"
                    style={{ animation: `staggerIn 0.4s ease-out ${idx * 50}ms both` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-lg font-bold text-white">
                          {c.riderName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{c.riderName}</p>
                          <p className="text-xs text-slate-400">{formatDate(c.date)}</p>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">用时</p>
                          <p className="font-medium text-white">{formatDuration(c.duration)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">均速</p>
                          <p className="font-medium text-white">{c.avgSpeed} km/h</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">难度</p>
                          <p className="font-medium text-amber-400">
                            {'★'.repeat(c.difficulty)}
                            {'☆'.repeat(5 - c.difficulty)}
                          </p>
                        </div>
                        <div className="col-span-3 md:col-span-1 flex flex-wrap gap-1.5">
                          {c.hadFlat && (
                            <span className="text-[11px] rounded-md bg-rose-500/15 text-rose-400 px-2 py-0.5">
                              💥 爆胎
                            </span>
                          )}
                          {c.gotLost && (
                            <span className="text-[11px] rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5">
                              🧭 迷路
                            </span>
                          )}
                          {c.hadCrash && (
                            <span className="text-[11px] rounded-md bg-red-500/15 text-red-400 px-2 py-0.5">
                              🩹 摔车
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {c.notes && (
                      <p className="mt-3 pt-3 border-t border-slate-700/30 text-sm text-slate-400 pl-[52px] md:pl-0">
                        💬 {c.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-base py-16 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">还没有打卡记录</h3>
              <p className="text-slate-400 mb-5">成为第一个完成这条路线的人吧！</p>
              <Link to={`/route/${route.id}/checkin`} className="btn-primary">
                <Play className="h-4 w-4" />
                开始打卡
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
