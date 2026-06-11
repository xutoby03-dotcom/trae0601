import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, PartyPopper } from 'lucide-react';
import { useAppStore } from '@/store';
import { isToday, isThisWeekend, isUpcoming, cn } from '@/utils/helpers';
import FilterTabs from '@/components/FilterTabs';
import ActivityCard from '@/components/ActivityCard';
import Empty from '@/components/Empty';

export default function Home() {
  const activities = useAppStore((s) => s.activities);
  const registrations = useAppStore((s) => s.registrations);
  const currentFilter = useAppStore((s) => s.currentFilter);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    result = result.filter((a) => isUpcoming(a.startTime));

    switch (currentFilter) {
      case 'today':
        result = result.filter((a) => isToday(a.startTime));
        break;
      case 'weekend':
        result = result.filter((a) => isThisWeekend(a.startTime));
        break;
      case 'indoor':
        result = result.filter((a) => a.locationType === 'indoor');
        break;
      case 'outdoor':
        result = result.filter((a) => a.locationType === 'outdoor');
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.ageRange.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return result;
  }, [activities, currentFilter, searchQuery]);

  const stats = useMemo(() => {
    const upcoming = activities.filter((a) => isUpcoming(a.startTime));
    const todayCount = upcoming.filter((a) => isToday(a.startTime)).length;
    const weekendCount = upcoming.filter((a) => isThisWeekend(a.startTime)).length;
    return { total: upcoming.length, today: todayCount, weekend: weekendCount };
  }, [activities]);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 p-6 md:p-8 text-white shadow-float">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute top-20 -right-5 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent-300/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <PartyPopper className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">欢迎来到玩伴约局板</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">给孩子找玩伴，一点也不难</h2>
          <p className="text-white/85 mb-6 max-w-xl">
            发布或浏览小区周边的玩伴活动，让孩子在快乐中社交成长
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 max-w-md">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
              <div className="text-xs md:text-sm opacity-90">进行中活动</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{stats.today}</div>
              <div className="text-xs md:text-sm opacity-90">今天可约</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold">{stats.weekend}</div>
              <div className="text-xs md:text-sm opacity-90">周末活动</div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索活动名称、地点、年龄段..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-soft transition-all"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900">筛选活动</h3>
          <Link
            to="/publish"
            className={cn(
              'hidden md:flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl px-5 py-2.5 shadow-soft hover:shadow-float transition-all active:scale-[0.98]'
            )}
          >
            <PlusCircle className="w-5 h-5" />
            发布活动
          </Link>
        </div>
        <FilterTabs />
      </section>

      <section>
        {filteredActivities.length === 0 ? (
          <Empty
            title={searchQuery ? '没有找到匹配的活动' : '暂无符合条件的活动'}
            description={
              searchQuery
                ? '试试换个关键词搜索，或者看看其他筛选条件~'
                : '换个筛选条件看看，或者发布一个新活动吧！'
            }
            action={
              <Link to="/publish" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                发布活动
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-500">
                共找到 <span className="font-bold text-ink-900">{filteredActivities.length}</span> 个活动
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredActivities.map((activity, idx) => {
                const activityRegs = registrations.filter((r) => r.activityId === activity.id);
                return (
                  <div key={activity.id} style={{ animationDelay: `${idx * 50}ms` }}>
                    <ActivityCard activity={activity} registrations={activityRegs} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <Link
        to="/publish"
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-float z-30 active:scale-95 transition-transform"
        aria-label="发布活动"
      >
        <PlusCircle className="w-7 h-7" />
      </Link>
    </div>
  );
}
