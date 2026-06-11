import { useState } from 'react';
import {
  MapPin,
  Clock,
  RefreshCw,
  Calendar,
  Share2,
  Copy,
  ChevronRight,
  Edit3,
  Check,
  ArrowLeft,
  Film,
  Star,
  PlayCircle,
  X,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMovieStore } from '../store/useMovieStore';
import { cn, formatDuration } from '../lib/utils';
import { formatDisplayDateTime, formatDateTime, getNextFriday } from '../utils/arrangementUtils';
import { generateId } from '../utils/voteUtils';

export default function ArrangementPage() {
  const navigate = useNavigate();
  const {
    currentEvent,
    movies,
    arrangement,
    updateArrangement,
    reassignSnack,
    generateArrangement,
    currentUserId,
    users,
    arrangement: _arrangement,
  } = useMovieStore();

  const [editing, setEditing] = useState<'time' | 'location' | null>(null);
  const [timeValue, setTimeValue] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);
  const [showPoster, setShowPoster] = useState(false);

  const selectedMovie = movies.find((m) => m.id === currentEvent.selectedMovieId);
  const effectiveArrangement = _arrangement || (() => {
    const viewingTime = formatDateTime(getNextFriday());
    return {
      id: generateId(),
      eventId: currentEvent.id,
      viewingTime,
      location: '发起人地址（待确认）',
      snacks: users.slice(0, 4).map((u, i) => ({
        snack: ['🍿 薯片', '🥤 饮料', '🍰 甜品', '🍓 水果'][i],
        owner: u.name,
        ownerId: u.id,
      })),
      createdAt: new Date().toISOString(),
    };
  })();

  const handleStartEdit = (field: 'time' | 'location') => {
    setEditing(field);
    if (field === 'time') setTimeValue(effectiveArrangement.viewingTime);
    else setLocationValue(effectiveArrangement.location);
  };

  const handleSaveEdit = () => {
    if (editing === 'time') {
      updateArrangement({ viewingTime: timeValue });
      if (!arrangement) generateArrangement();
    } else if (editing === 'location') {
      updateArrangement({ location: locationValue });
      if (!arrangement) generateArrangement();
    }
    setEditing(null);
  };

  const handleReassign = (index: number) => {
    setSpinningIndex(index);
    setTimeout(() => {
      reassignSnack(index);
      if (!arrangement) generateArrangement();
      setSpinningIndex(null);
    }, 600);
  };

  const handleCopy = () => {
    const host = users.find((u) => u.id === currentEvent.hostId);
    const text = `🎬 ${currentEvent.title} 观影安排

📽️ 影片：${selectedMovie?.title}
🎭 类型：${selectedMovie?.genres.join(' / ')}
⏰ 时长：${selectedMovie ? formatDuration(selectedMovie.duration) : ''}
⭐ 评分：${selectedMovie?.rating}

📅 时间：${formatDisplayDateTime(effectiveArrangement.viewingTime)}
📍 地点：${effectiveArrangement.location}

🍱 零食分配：
${effectiveArrangement.snacks.map((s) => `${s.snack} - ${s.owner}`).join('\n')}

🧑‍🤝‍🧑 组织者：${host?.name}
👥 参与：${users.length}人

不见不散！🎥`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!selectedMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Film className="w-10 h-10 text-white/20" />
          </div>
          <h2
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            还没有选定电影哦~
          </h2>
          <p className="text-white/50 mb-8">
            先去片单页投票，发起人定片后这里会生成观影安排
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回片单
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 group">
          <img
            src={selectedMovie.posterUrl}
            alt={selectedMovie.title}
            className="w-full h-72 lg:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] via-[#1A0B2E]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B2E]/90 via-[#1A0B2E]/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="flex items-end gap-6">
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                className="w-28 h-40 lg:w-36 lg:h-52 rounded-xl object-cover shadow-2xl border-2 border-white/20 hidden sm:block"
              />
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {selectedMovie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white/90 font-medium border border-white/10"
                    >
                      {g}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/80 to-pink-500/80 text-xs font-bold text-white">
                    🎯 已选定
                  </span>
                </div>
                <h1
                  className="text-3xl lg:text-5xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {selectedMovie.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-white/70 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(selectedMovie.duration)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-amber-300">{selectedMovie.rating}</span>
                    <span>豆瓣</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-pink-500/30 text-pink-200 font-medium">
                    {selectedMovie.platform}
                  </span>
                  {selectedMovie.trailerUrl && (
                    <a
                      href={selectedMovie.trailerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sky-300 hover:text-sky-200 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      预告片
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 flex items-center justify-center border border-sky-500/20">
                  <Calendar className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">观影时间</h3>
                  <p className="text-xs text-white/40">建议本周五晚~</p>
                </div>
              </div>
              {editing !== 'time' ? (
                <button
                  onClick={() => handleStartEdit('time')}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>

            {editing === 'time' ? (
              <input
                type="datetime-local"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500/50 text-sm"
              />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">
                  {formatDisplayDateTime(effectiveArrangement.viewingTime)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center border border-rose-500/20">
                  <MapPin className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">观影地点</h3>
                  <p className="text-xs text-white/40">谁家里？还是电影院？</p>
                </div>
              </div>
              {editing !== 'location' ? (
                <button
                  onClick={() => handleStartEdit('location')}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>

            {editing === 'location' ? (
              <input
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="输入地址..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 text-sm"
              />
            ) : (
              <p className="text-lg text-white/90">{effectiveArrangement.location}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 flex items-center justify-center border border-amber-400/20">
                <span className="text-xl">🍱</span>
              </div>
              <div>
                <h3 className="font-bold text-white">零食分配</h3>
                <p className="text-xs text-white/40">随机抽取，公平公正公开~</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!arrangement) generateArrangement();
                else {
                  setSpinningIndex(-1);
                  setTimeout(() => {
                    [0, 1, 2, 3].forEach((i) => reassignSnack(i));
                    setSpinningIndex(null);
                  }, 600);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <RefreshCw
                className={cn('w-4 h-4 transition-transform', spinningIndex === -1 && 'animate-spin')}
              />
              全部重抽
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {effectiveArrangement.snacks.map((snackItem, index) => (
              <div
                key={index}
                className="group relative rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-4 overflow-hidden transition-all hover:border-white/20"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full" />
                <button
                  onClick={() => handleReassign(index)}
                  disabled={spinningIndex !== null}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-amber-400 hover:bg-amber-400/10 transition-all disabled:opacity-50"
                  title="重新分配"
                >
                  <RefreshCw
                    className={cn(
                      'w-3.5 h-3.5 transition-transform',
                      spinningIndex === index && 'animate-spin'
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'text-3xl mb-3 transition-transform',
                    spinningIndex === index && 'animate-bounce'
                  )}
                >
                  {snackItem.snack.split(' ')[0]}
                </div>
                <p className="text-sm text-white/50 mb-1.5">{snackItem.snack.split(' ').slice(1).join(' ')}</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/40 to-amber-400/40 flex items-center justify-center text-sm border border-white/10">
                    {users.find((u) => u.id === snackItem.ownerId)?.avatar || '👤'}
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    {snackItem.owner}
                  </span>
                  {snackItem.ownerId === currentUserId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">
                      我
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-amber-400/10 border border-white/10">
          <div>
            <h3 className="font-bold text-white mb-1">分享给小伙伴</h3>
            <p className="text-sm text-white/50">生成精美海报，一键复制转发</p>
          </div>
          <button
            onClick={() => setShowPoster(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            生成海报
          </button>
        </div>
      </div>

      {showPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm" onClick={() => setShowPoster(false)}>
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPoster(false)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95 touch-manipulation"
              aria-label="关闭海报"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#1A0B2E] via-[#1A0B2E] to-[#0f051a] border border-white/10 shadow-2xl shadow-pink-500/10">
              <div className="relative">
                <img
                  src={selectedMovie?.posterUrl}
                  alt={selectedMovie?.title}
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] via-[#1A0B2E]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B2E]/70 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/90 to-amber-400/90 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                    🎬 {currentEvent.title}
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium">
                    ⭐ {selectedMovie?.rating}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedMovie?.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[10px] text-white/90 font-medium border border-white/10"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {selectedMovie?.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedMovie ? formatDuration(selectedMovie.duration) : ''}
                    </span>
                    <span>{selectedMovie?.platform}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                      <span className="text-[11px] text-white/50 font-medium">观影时间</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug break-words">
                      {formatDisplayDateTime(effectiveArrangement.viewingTime)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                      <span className="text-[11px] text-white/50 font-medium">观影地点</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-snug break-words whitespace-normal">
                      {effectiveArrangement.location}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-amber-400/[0.08] to-pink-500/[0.05] border border-amber-400/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🍱</span>
                    <h4 className="text-sm font-bold text-white">零食分工</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {effectiveArrangement.snacks.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-lg">{s.snack.split(' ')[0]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white/50 truncate">{s.snack.split(' ').slice(1).join(' ')}</p>
                          <p className="text-xs font-semibold text-white/90 truncate">{s.owner}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>🧑‍🤝‍🧑 组织者：{users.find((u) => u.id === currentEvent.hostId)?.name}</span>
                    <span>👥 {users.length} 人参与</span>
                  </div>
                  <p className="text-center text-xs text-white/30 mt-3 font-medium tracking-wider">
                    ✨ 不见不散 · 周末电影夜 ✨
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className={cn(
                  'flex-1 min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] touch-manipulation select-none',
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                )}
              >
                {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                {copied ? '已复制文案' : '复制文案'}
              </button>
              <button
                onClick={() => setShowPoster(false)}
                className="flex-1 min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 active:scale-[0.97] transition-all touch-manipulation select-none"
              >
                <X className="w-4 h-4 shrink-0" />
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
