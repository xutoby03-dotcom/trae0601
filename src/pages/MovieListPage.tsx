import { Film, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';
import { cn } from '../lib/utils';
import MovieCard from '../components/MovieCard';
import GroupSection from '../components/GroupSection';
import AddMovieModal from '../components/AddMovieModal';
import ConfirmDecideModal from '../components/ConfirmDecideModal';
import { TabType } from '../types';
import { Crown, Flame, Leaf, Moon, Sparkles } from 'lucide-react';

const TABS: { id: TabType; label: string; icon: typeof Crown; color: string }[] = [
  { id: 'all', label: '全部', icon: Sparkles, color: '#a78bfa' },
  { id: 'top', label: '最高票', icon: Crown, color: '#fbbf24' },
  { id: 'controversial', label: '争议大', icon: Flame, color: '#f97316' },
  { id: 'short', label: '短片优先', icon: Leaf, color: '#34d399' },
  { id: 'latenight', label: '适合深夜', icon: Moon, color: '#a855f7' },
];

export default function MovieListPage() {
  const {
    getGroupedMovies,
    selectedTab,
    setSelectedTab,
    setShowAddModal,
    getCurrentUser,
    currentEvent,
  } = useMovieStore();

  const grouped = getGroupedMovies();
  const currentUser = getCurrentUser();

  const getFilteredMovies = () => {
    switch (selectedTab) {
      case 'top':
        return grouped.topVoted;
      case 'controversial':
        return grouped.controversial;
      case 'short':
        return grouped.shortFilms;
      case 'latenight':
        return grouped.lateNight;
      default:
        return grouped.all;
    }
  };

  const filteredMovies = getFilteredMovies();

  const getHighlight = (movieId: string): 'top' | 'controversial' | null => {
    if (grouped.topVoted.slice(0, 3).some((m) => m.id === movieId)) return 'top';
    if (grouped.controversial.some((m) => m.id === movieId)) return 'controversial';
    return null;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-amber-400/10 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  第 8 期
                </span>
                {currentEvent.status === 'decided' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    ✅ 已选定
                  </span>
                )}
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                今晚看什么？🎬
              </h1>
              <p className="text-white/60 max-w-lg">
                {currentUser?.name} 你好！投票选出想看的电影，
                {currentEvent.status === 'voting'
                  ? '发起人定片后会自动生成观影安排~'
                  : '已定片，快去看看安排吧！'}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  placeholder="搜索电影..."
                  className="pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 w-52 transition-all"
                />
              </div>
              <button
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="筛选"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              {currentUser?.isHost && currentEvent.status === 'voting' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white text-sm font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加电影
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/10">
          {TABS.map((tab) => {
            const active = selectedTab === tab.id;
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? grouped.all.length
                : tab.id === 'top'
                ? grouped.topVoted.length
                : tab.id === 'controversial'
                ? grouped.controversial.length
                : tab.id === 'short'
                ? grouped.shortFilms.length
                : grouped.lateNight.length;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95',
                  active
                    ? 'bg-white/10 text-white shadow-inner border border-white/10'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                )}
                style={active ? { borderLeft: `3px solid ${tab.color}` } : {}}
              >
                <Icon className="w-4 h-4" style={{ color: active ? tab.color : undefined }} />
                {tab.label}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    active ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-white/40'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedTab === 'all' ? (
          <div className="space-y-8">
            <GroupSection
              title="最高票人气王"
              icon={<Crown />}
              count={grouped.topVoted.length}
              accentColor="#fbbf24"
            >
              {grouped.topVoted.map((m) => (
                <MovieCard key={m.id} movie={m} highlight="top" />
              ))}
            </GroupSection>

            {grouped.controversial.length > 0 && (
              <GroupSection
                title="争议选手"
                icon={<Flame />}
                count={grouped.controversial.length}
                accentColor="#f97316"
                defaultCollapsed
              >
                {grouped.controversial.map((m) => (
                  <MovieCard key={m.id} movie={m} highlight="controversial" />
                ))}
              </GroupSection>
            )}

            {grouped.shortFilms.length > 0 && (
              <GroupSection
                title="短片友好"
                icon={<Leaf />}
                count={grouped.shortFilms.length}
                accentColor="#34d399"
                defaultCollapsed
              >
                {grouped.shortFilms.map((m) => (
                  <MovieCard key={m.id} movie={m} highlight={getHighlight(m.id)} />
                ))}
              </GroupSection>
            )}

            {grouped.lateNight.length > 0 && (
              <GroupSection
                title="深夜专属"
                icon={<Moon />}
                count={grouped.lateNight.length}
                accentColor="#a855f7"
                defaultCollapsed
              >
                {grouped.lateNight.map((m) => (
                  <MovieCard key={m.id} movie={m} highlight={getHighlight(m.id)} />
                ))}
              </GroupSection>
            )}
          </div>
        ) : (
          <div>
            {filteredMovies.length === 0 ? (
              <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                <Film className="w-16 h-16 mx-auto text-white/20 mb-4" />
                <p className="text-white/40 mb-2">这个分组暂时没有电影</p>
                {currentUser?.isHost && currentEvent.status === 'voting' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-all"
                  >
                    添加第一部电影
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMovies.map((m) => (
                  <MovieCard key={m.id} movie={m} highlight={getHighlight(m.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddMovieModal />
      <ConfirmDecideModal />
    </div>
  );
}
