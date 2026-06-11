import { X, Crown, Sparkles, Check, Trophy } from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';
import { recommendMovie, calculateMovieScore, formatDuration } from '../utils/voteUtils';
import { cn } from '../lib/utils';

export default function ConfirmDecideModal() {
  const {
    showConfirmModal,
    setShowConfirmModal,
    movies,
    votes,
    decideMovie,
    getMovieVotes,
  } = useMovieStore();

  if (!showConfirmModal) return null;

  const recommended = recommendMovie(movies, votes);
  const topMovies = [...movies]
    .map((m) => ({ movie: m, score: calculateMovieScore(m, votes) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setShowConfirmModal(false)}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A0B2E] via-[#2A1045] to-[#1A0B2E] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        </div>

        <button
          onClick={() => setShowConfirmModal(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-400 mb-4 shadow-xl shadow-pink-500/40">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <Sparkles className="w-7 h-7 inline-block mr-2 text-amber-400" />
            定片时刻！
          </h2>
          <p className="text-white/60">根据大家的投票，智能推荐以下影片</p>
        </div>

        <div className="relative space-y-3 px-6 pb-4">
          {topMovies.map(({ movie, score }, index) => {
            const result = getMovieVotes(movie.id);
            const isRecommended = index === 0;
            return (
              <button
                key={movie.id}
                onClick={() => decideMovie(movie.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group',
                  'hover:scale-[1.01] active:scale-[0.99]',
                  isRecommended
                    ? 'bg-gradient-to-r from-pink-500/20 via-amber-400/10 to-transparent border-amber-400/40 shadow-lg shadow-amber-400/10'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0',
                    isRecommended
                      ? 'bg-gradient-to-br from-amber-400 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60'
                  )}
                >
                  {index === 0 ? <Crown className="w-5 h-5" /> : index + 1}
                </div>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-14 h-20 rounded-lg object-cover shrink-0 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-lg font-bold text-white truncate"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {movie.title}
                    </h3>
                    {isRecommended && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        推荐
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-2 flex-wrap">
                    <span>{movie.genres.join(' · ')}</span>
                    <span>·</span>
                    <span>{formatDuration(movie.duration)}</span>
                    <span>·</span>
                    <span className="text-amber-300">★ {movie.rating}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400">👍 {result.want}</span>
                    <span className="text-sky-400">👀 {result.watched}</span>
                    <span className="text-rose-400">👎 {result.dontWant}</span>
                    <span className="ml-auto text-white/30 font-mono">
                      综合 {score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <Check
                  className={cn(
                    'w-6 h-6 shrink-0 transition-all',
                    isRecommended
                      ? 'text-amber-400 opacity-100'
                      : 'text-white/20 opacity-0 group-hover:opacity-100'
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="relative p-6 pt-4 flex justify-center gap-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            再想想
          </button>
          <button
            onClick={() => decideMovie()}
            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-amber-400 shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 inline mr-1.5" />
            就看推荐的！
          </button>
        </div>
      </div>
    </div>
  );
}
