import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  UserCheck,
  Trophy,
  PieChart as PieChartIcon,
  CalendarCheck,
  CalendarX,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Activity, Registration } from '@/types';
import { cn, formatDateTime, isUpcoming, getConfirmedCount } from '@/utils/helpers';
import Empty from '@/components/Empty';
import Drawer from '@/components/Drawer';

type TabType = 'stats' | 'published' | 'registered';

interface RegistrationDetailContentProps {
  activity: Activity;
  registrations: Registration[];
}

function RegistrationDetailContent({ activity, registrations }: RegistrationDetailContentProps) {
  const confirmed = useMemo(
    () => registrations.filter(r => r.status === 'confirmed')
      .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()),
    [registrations]
  );
  const waitlist = useMemo(
    () => registrations.filter(r => r.status === 'waitlist')
      .sort((a, b) => (a.waitlistNumber || 0) - (b.waitlistNumber || 0)),
    [registrations]
  );
  const cancelled = useMemo(
    () => registrations.filter(r => r.status === 'cancelled')
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()),
    [registrations]
  );

  const confirmedCount = getConfirmedCount(registrations);
  const progress = Math.min((confirmedCount / activity.maxParticipants) * 100, 100);

  return (
    <div className="p-5 space-y-6">
      <div className="p-4 rounded-2xl bg-cream-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink-700">报名进度</span>
          <span className="text-sm font-bold text-primary-600">
            {confirmedCount}/{activity.maxParticipants} 人
          </span>
        </div>
        <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              progress >= 100
                ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                : 'bg-gradient-to-r from-accent-400 to-accent-600'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {waitlist.length > 0 && (
          <div className="text-xs text-ink-500 mt-2">
            候补 <span className="font-medium text-primary-600">{waitlist.length}</span> 人
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-accent-500 rounded-full" />
          <h4 className="font-bold text-ink-900">已确认 ({confirmed.length}组)</h4>
        </div>
        {confirmed.length === 0 ? (
          <div className="text-center py-8 text-ink-500 text-sm bg-cream-50 rounded-2xl">
            还没有确认的报名
          </div>
        ) : (
          <div className="space-y-3">
            {confirmed.map(reg => (
              <RegistrationItem key={reg.id} registration={reg} statusLabel="已确认" statusType="confirmed" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary-500 rounded-full" />
          <h4 className="font-bold text-ink-900">候补队列 ({waitlist.length}人)</h4>
        </div>
        {waitlist.length === 0 ? (
          <div className="text-center py-8 text-ink-500 text-sm bg-cream-50 rounded-2xl">
            暂无候补
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map(reg => (
              <RegistrationItem
                key={reg.id}
                registration={reg}
                statusLabel={`候补第${reg.waitlistNumber}位`}
                statusType="waitlist"
              />
            ))}
          </div>
        )}
      </div>

      {cancelled.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-ink-400 rounded-full" />
            <h4 className="font-bold text-ink-700">已取消 ({cancelled.length}人)</h4>
          </div>
          <div className="space-y-3 opacity-60">
            {cancelled.map(reg => (
              <RegistrationItem
                key={reg.id}
                registration={reg}
                statusLabel="已取消"
                statusType="cancelled"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RegistrationItemProps {
  registration: Registration;
  statusLabel: string;
  statusType: 'confirmed' | 'waitlist' | 'cancelled';
}

function RegistrationItem({ registration, statusLabel, statusType }: RegistrationItemProps) {
  const statusClass = {
    confirmed: 'bg-accent-100 text-accent-700 border-accent-200',
    waitlist: 'bg-primary-100 text-primary-700 border-primary-200',
    cancelled: 'bg-ink-100 text-ink-500 border-ink-200',
  }[statusType];

  return (
    <div className="p-4 rounded-2xl bg-white border-2 border-cream-200 hover:border-cream-300 transition-colors animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold shrink-0 shadow-soft">
          {registration.childNickname.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-ink-900 truncate">{registration.childNickname}</span>
            <span className={cn('chip border text-xs py-0.5 shrink-0', statusClass)}>
              {statusLabel}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-3 text-sm">
            <div className="flex items-center gap-1.5 text-ink-500">
              <Users className="w-3.5 h-3.5 text-primary-500" />
              <span>到场 <span className="font-medium text-ink-700">{registration.attendeeCount}人</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-ink-500">
              <Phone className="w-3.5 h-3.5 text-accent-500" />
              <span className="font-medium text-ink-700 truncate">{registration.parentPhone}</span>
            </div>
            {registration.allergyInfo && registration.allergyInfo !== '无' && (
              <div className="flex items-start gap-1.5 text-ink-500 col-span-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-600">过敏：{registration.allergyInfo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Statistics() {
  const activities = useAppStore((s) => s.activities);
  const registrations = useAppStore((s) => s.registrations);
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [drawerActivity, setDrawerActivity] = useState<Activity | null>(null);

  const stats = useMemo(() => {
    const totalActivities = activities.length;
    const upcoming = activities.filter((a) => isUpcoming(a.endTime)).length;

    const totalRegistrations = registrations.filter((r) => r.status !== 'cancelled').length;
    const cancelledCount = registrations.filter((r) => r.status === 'cancelled').length;
    const cancelRate = totalRegistrations + cancelledCount > 0
      ? Math.round((cancelledCount / (totalRegistrations + cancelledCount)) * 100)
      : 0;

    return {
      totalActivities,
      upcoming,
      totalRegistrations,
      cancelRate,
      cancelledCount,
    };
  }, [activities, registrations]);

  const locationStats = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) => {
      map.set(a.location, (map.get(a.location) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [activities]);

  const ageRangeStats = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) => {
      map.set(a.ageRange, (map.get(a.ageRange) || 0) + 1);
    });
    const result = Array.from(map.entries())
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(...result.map((r) => r.count), 1);
    return result.map((r) => ({ ...r, percent: Math.round((r.count / max) * 100) }));
  }, [activities]);

  const highCancelActivities = useMemo(() => {
    return activities
      .map((a) => {
        const regs = registrations.filter((r) => r.activityId === a.id);
        const total = regs.length;
        const cancelled = regs.filter((r) => r.status === 'cancelled').length;
        const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
        return { activity: a, rate, cancelled, total };
      })
      .filter((x) => x.rate >= 10)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [activities, registrations]);

  const myPublished = useMemo(() => {
    return activities.filter((a) => a.creatorName === '我');
  }, [activities]);

  const myRegistered = useMemo(() => {
    const mine = registrations.filter((r) => r.status !== 'cancelled');
    return mine
      .map((r) => ({
        registration: r,
        activity: activities.find((a) => a.id === r.activityId),
      }))
      .filter((x) => x.activity) as { registration: typeof registrations[0]; activity: typeof activities[0] }[];
  }, [registrations, activities]);

  const ageColors = [
    'from-primary-400 to-primary-600',
    'from-accent-400 to-accent-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-blue-400 to-blue-600',
  ];

  const statCards = [
    {
      label: '活动总数',
      value: stats.totalActivities,
      icon: Calendar,
      gradient: 'from-primary-500 to-primary-600',
      bgIcon: 'bg-primary-100',
      iconColor: 'text-primary-600',
      sub: `即将开始 ${stats.upcoming} 个`,
    },
    {
      label: '报名人次',
      value: stats.totalRegistrations,
      icon: Users,
      gradient: 'from-accent-500 to-accent-600',
      bgIcon: 'bg-accent-100',
      iconColor: 'text-accent-600',
      sub: `取消 ${stats.cancelledCount} 次`,
    },
    {
      label: '热门地点',
      value: locationStats[0]?.count || 0,
      icon: MapPin,
      gradient: 'from-green-500 to-green-600',
      bgIcon: 'bg-green-100',
      iconColor: 'text-green-600',
      sub: locationStats[0]?.location ? `TOP1 ${locationStats[0].location.slice(0, 8)}` : '暂无数据',
    },
    {
      label: '取消率',
      value: `${stats.cancelRate}%`,
      icon: AlertCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgIcon: 'bg-purple-100',
      iconColor: 'text-purple-600',
      sub: stats.cancelRate > 20 ? '略高，注意活动安排' : '正常范围',
    },
  ];

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'stats', label: '数据统计', icon: BarChart3 },
    { key: 'published', label: `我发布的 (${myPublished.length})`, icon: Sparkles },
    { key: 'registered', label: `我报名的 (${myRegistered.length})`, icon: UserCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 p-6 md:p-8 text-white shadow-float mb-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute top-20 -right-5 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6" />
            <h2 className="text-2xl font-bold">管理统计中心</h2>
          </div>
          <p className="text-white/90">查看活动数据、管理你的发布和报名记录</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft'
                  : 'bg-white text-ink-700 hover:bg-cream-100 border border-cream-300'
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="card p-5 animate-slide-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', card.bgIcon)}>
                      <Icon className={cn('w-5.5 h-5.5', card.iconColor)} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-ink-400" />
                  </div>
                  <div className="text-3xl font-bold text-ink-900 mb-1">{card.value}</div>
                  <div className="text-sm font-medium text-ink-700 mb-1">{card.label}</div>
                  <div className="text-xs text-ink-500">{card.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  热门地点 TOP
                </h3>
                <MapPin className="w-4 h-4 text-ink-400" />
              </div>

              {locationStats.length === 0 ? (
                <Empty title="暂无地点数据" description="发布活动后将显示热门地点统计" />
              ) : (
                <div className="space-y-3.5">
                  {locationStats.map((item, idx) => {
                    const maxCount = locationStats[0].count;
                    const percent = Math.round((item.count / maxCount) * 100);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={item.location}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg shrink-0">
                              {medals[idx] || `#${idx + 1}`}
                            </span>
                            <span className="font-medium text-ink-900 truncate">{item.location}</span>
                          </div>
                          <span className="chip bg-primary-100 text-primary-700 shrink-0">
                            {item.count} 次活动
                          </span>
                        </div>
                        <div className="h-2 bg-cream-200 rounded-full overflow-hidden ml-9">
                          <div
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                              idx === 0
                                ? 'from-primary-400 to-primary-600'
                                : idx === 1
                                ? 'from-accent-400 to-accent-600'
                                : 'from-purple-400 to-purple-600'
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-accent-500" />
                  年龄段分布
                </h3>
                <Users className="w-4 h-4 text-ink-400" />
              </div>

              {ageRangeStats.length === 0 ? (
                <Empty title="暂无年龄段数据" />
              ) : (
                <div className="space-y-4">
                  {ageRangeStats.map((item, idx) => (
                    <div key={item.range} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-ink-900">{item.range}</span>
                        <span className="text-sm text-ink-500">{item.count} 个活动</span>
                      </div>
                      <div className="h-8 bg-cream-200 rounded-xl overflow-hidden relative">
                        <div
                          className={cn(
                            'h-full rounded-xl bg-gradient-to-r transition-all duration-700 flex items-center justify-end pr-3',
                            ageColors[idx % ageColors.length]
                          )}
                          style={{ width: `${item.percent}%` }}
                        >
                          {item.percent > 20 && (
                            <span className="text-white text-xs font-bold">
                              {Math.round((item.count / activities.length) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary-500" />
                  取消率较高的活动
                  <span className="text-xs font-normal text-ink-500 chip bg-cream-100">
                    帮助优化活动体验
                  </span>
                </h3>
                <CalendarX className="w-4 h-4 text-ink-400" />
              </div>

              {highCancelActivities.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-100 flex items-center justify-center">
                    <CalendarCheck className="w-8 h-8 text-accent-600" />
                  </div>
                  <h4 className="font-bold text-ink-900 mb-1">活动状态良好</h4>
                  <p className="text-sm text-ink-500">目前没有取消率超过10%的活动，继续保持！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {highCancelActivities.map((item, idx) => (
                    <Link
                      key={item.activity.id}
                      to={`/activity/${item.activity.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-cream-50 hover:bg-cream-100 transition-colors group animate-slide-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-soft flex items-center justify-center text-2xl shrink-0">
                          {item.activity.coverEmoji}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-ink-900 truncate group-hover:text-primary-600 transition-colors">
                            {item.activity.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-ink-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(item.activity.startTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {getConfirmedCount(registrations.filter(r => r.activityId === item.activity.id))}/{item.activity.maxParticipants}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{item.rate}%</div>
                          <div className="text-xs text-ink-500">
                            取消 {item.cancelled}/{item.total}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'published' && (
        <div>
          {myPublished.length === 0 ? (
            <Empty
              title="还没有发布过活动"
              description="成为第一个发布活动的家长吧~"
              action={
                <Link to="/publish" className="btn-primary inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  发布第一个活动
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {myPublished.map((activity, idx) => {
                const confirmed = getConfirmedCount(registrations.filter(r => r.activityId === activity.id));
                return (
                  <button
                    key={activity.id}
                    onClick={() => setDrawerActivity(activity)}
                    className="card w-full text-left p-5 flex items-center gap-5 group animate-slide-up hover:translate-y-[-2px]"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl shrink-0 shadow-soft">
                      {activity.coverEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-ink-900 truncate group-hover:text-primary-600 transition-colors">
                        {activity.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary-500" />
                          {formatDateTime(activity.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-accent-500" />
                          {activity.location}
                        </span>
                        <span className="chip bg-cream-100 text-ink-600 text-xs py-0.5">
                          {activity.ageRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full"
                            style={{ width: `${Math.min((confirmed / activity.maxParticipants) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-ink-600">
                          {confirmed}/{activity.maxParticipants}人报名
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'registered' && (
        <div>
          {myRegistered.length === 0 ? (
            <Empty
              title="还没有报名任何活动"
              description="去活动广场看看有没有感兴趣的活动吧~"
              action={
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  浏览活动
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {myRegistered.map(({ activity, registration }, idx) => (
                <Link
                  key={`${activity.id}-${registration.id}`}
                  to={`/activity/${activity.id}`}
                  className="card p-5 flex items-center gap-5 group animate-slide-up hover:translate-y-[-2px]"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl shadow-soft">
                      {activity.coverEmoji}
                    </div>
                    {registration.status === 'waitlist' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-soft">
                        #{registration.waitlistNumber}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-ink-900 truncate group-hover:text-primary-600 transition-colors">
                        {activity.title}
                      </h4>
                      {registration.status === 'confirmed' ? (
                        <span className="chip bg-accent-100 text-accent-700 text-xs py-0.5">
                          <UserCheck className="w-3 h-3" />
                          已确认
                        </span>
                      ) : (
                        <span className="chip bg-primary-100 text-primary-700 text-xs py-0.5">
                          <Clock className="w-3 h-3" />
                          候补第{registration.waitlistNumber}位
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500 mt-1.5">
                      <span>报名昵称：<span className="font-medium text-ink-700">{registration.childNickname}</span></span>
                      <span>·</span>
                      <span>{registration.attendeeCount}人参加</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-500 mt-1">
                      <Calendar className="w-3 h-3.5" />
                      {formatDateTime(activity.startTime)}
                      <span className="text-ink-400">·</span>
                      <MapPin className="w-3 h-3.5" />
                      <span className="truncate max-w-xs">{activity.location}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Drawer
        open={!!drawerActivity}
        onClose={() => setDrawerActivity(null)}
        title={drawerActivity?.title || ''}
        subtitle={drawerActivity ? `${formatDateTime(drawerActivity.startTime)} · ${drawerActivity.location}` : ''}
      >
        {drawerActivity && (
          <RegistrationDetailContent
            activity={drawerActivity}
            registrations={registrations.filter(r => r.activityId === drawerActivity.id)}
          />
        )}
      </Drawer>
    </div>
  );
}
