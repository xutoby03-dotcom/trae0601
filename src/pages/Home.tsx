import { Search, Sparkles, Bike } from 'lucide-react';
import CategoryTabs from '@/components/CategoryTabs';
import RouteCard from '@/components/RouteCard';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';

export default function Home() {
  const { routes, searchQuery, setSearchQuery, activeCategory, checkins } = useStore();

  const filteredRoutes = useMemo(() => {
    let result = routes;
    if (activeCategory !== 'all') {
      result = result.filter((r) => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.startPoint.toLowerCase().includes(q) ||
          r.endPoint.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [routes, activeCategory, searchQuery]);

  const totalKmThisMonth = useMemo(() => {
    const now = new Date();
    return checkins
      .filter((c) => {
        const d = new Date(c.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, c) => {
        const route = routes.find((r) => r.id === c.routeId);
        return sum + (route?.distance || 0);
      }, 0);
  }, [checkins, routes]);

  return (
    <div className="page-container">
      <div className="container">
        {/* Hero 区 */}
        <section className="relative mb-12 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-slate-900" />
          <div
            className="absolute inset-0 bg-grid-pattern opacity-30"
            style={{ backgroundSize: '40px 40px' }}
          />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />

          <div className="relative px-6 py-12 md:px-12 md:py-16 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-emerald-300 mb-6 border border-white/10">
                <Sparkles className="h-4 w-4" />
                本月已骑行 <span className="font-bold text-white">{totalKmThisMonth.toFixed(1)}</span> 公里
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
                周末骑行，别只靠群里
                <br />
                <span className="gradient-text">甩定位</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                发现优质路线、记录每一次骑行、约上志同道合的伙伴。
                结构化的路线信息让每一次出行更安心、更有趣。
              </p>

              {/* 搜索框 */}
              <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索路线名称、起点、终点..."
                  className="input-base pl-12 pr-4 py-4 !bg-slate-900/80 backdrop-blur-sm !text-base !rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 分类 */}
        <section className="mb-8">
          <CategoryTabs />
        </section>

        {/* 路线列表 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Bike className="h-6 w-6 text-emerald-400" />
                {activeCategory === 'all' ? '全部路线' : '路线列表'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                共找到 <span className="text-emerald-400 font-medium">{filteredRoutes.length}</span> 条路线
              </p>
            </div>
          </div>

          {filteredRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route, idx) => (
                <RouteCard key={route.id} route={route} index={idx} />
              ))}
            </div>
          ) : (
            <div className="card-base py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-bold text-white mb-2">暂无匹配路线</h3>
              <p className="text-slate-400">试试其他关键词或分类，或者创建一条新路线吧</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
