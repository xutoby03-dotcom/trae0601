import { useState } from 'react';
import {
  Clock,
  Star,
  PlayCircle,
  MessageSquare,
  Send,
  Trash2,
  Crown,
  Flame,
  Leaf,
  Moon,
} from 'lucide-react';
import { Movie } from '../types';
import VoteButton from './VoteButton';
import VoteProgressBar from './VoteProgressBar';
import { useMovieStore } from '../store/useMovieStore';
import { cn, formatDuration } from '../lib/utils';
import { isLateNight, isShortFilm } from '../utils/voteUtils';

interface MovieCardProps {
  movie: Movie;
  highlight?: 'top' | 'controversial' | null;
}

export default function MovieCard({ movie, highlight }: MovieCardProps) {
  const {
    getMovieVotes,
    castVote,
    currentUserId,
    currentEvent,
    getCurrentUser,
    getCommentsForMovie,
    addComment,
    removeMovie,
    users,
  } = useMovieStore();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);

  const voteResult = getMovieVotes(movie.id);
  const userVote = voteResult.userVotes[currentUserId];
  const comments = getCommentsForMovie(movie.id);
  const currentUser = getCurrentUser();
  const isHost = currentUser?.isHost;

  const handleVote = (type: 'want_to_watch' | 'dont_want_to_watch' | 'watched') => {
    if (currentEvent.status !== 'voting') return;
    const newType = userVote === type ? null : type;
    castVote(movie.id, currentUserId, newType);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment(movie.id, currentUserId, commentText);
    setCommentText('');
  };

  const getUserById = (id: string) => users.find((u) => u.id === id);
  const addedByUser = getUserById(movie.addedBy);

  const borderClass =
    highlight === 'top'
      ? 'ring-2 ring-amber-400/50 shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]'
      : highlight === 'controversial'
      ? 'ring-2 ring-orange-500/50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]'
      : 'border-white/10';

  return (
    <div
      className={cn(
        'group rounded-2xl bg-white/[0.03] border backdrop-blur-sm overflow-hidden transition-all duration-500',
        'hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1',
        borderClass
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-40 w-full h-56 sm:h-auto shrink-0 overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E]/90 via-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#1A0B2E]/60" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {highlight === 'top' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-xs font-bold text-amber-950 shadow-lg">
                <Crown className="w-3 h-3" />
                人气王
              </span>
            )}
            {highlight === 'controversial' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white shadow-lg">
                <Flame className="w-3 h-3" />
                争议大
              </span>
            )}
            {isShortFilm(movie) && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-xs font-bold text-white shadow">
                <Leaf className="w-3 h-3" />
                短片
              </span>
            )}
            {isLateNight(movie) && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600/90 text-xs font-bold text-white shadow">
                <Moon className="w-3 h-3" />
                深夜档
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="text-xl font-bold text-white truncate"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70 border border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
            {isHost && currentEvent.status === 'voting' && (
              <button
                onClick={() => removeMovie(movie.id)}
                className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="删除电影"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(movie.duration)}
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-amber-300">{movie.rating.toFixed(1)}</span>
              <span className="text-white/40">豆瓣</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-xs font-medium">
              {movie.platform}
            </div>
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                预告片
              </a>
            )}
          </div>

          <VoteProgressBar result={voteResult} />

          <div className="flex flex-wrap gap-2 pt-1">
            <VoteButton
              type="want_to_watch"
              active={userVote === 'want_to_watch'}
              count={voteResult.want}
              onClick={() => handleVote('want_to_watch')}
              disabled={currentEvent.status !== 'voting'}
            />
            <VoteButton
              type="dont_want_to_watch"
              active={userVote === 'dont_want_to_watch'}
              count={voteResult.dontWant}
              onClick={() => handleVote('dont_want_to_watch')}
              disabled={currentEvent.status !== 'voting'}
            />
            <VoteButton
              type="watched"
              active={userVote === 'watched'}
              count={voteResult.watched}
              onClick={() => handleVote('watched')}
              disabled={currentEvent.status !== 'voting'}
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments) setExpanded(true);
                }}
                className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                留言备注
                {comments.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold">
                    {comments.length}
                  </span>
                )}
              </button>
              <div className="text-xs text-white/40">
                {addedByUser?.avatar} {addedByUser?.name} 推荐
              </div>
            </div>

            {showComments && (
              <div
                className={cn(
                  'mt-3 space-y-3 transition-all duration-300',
                  expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                )}
              >
                {comments.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {comments.map((c) => {
                      const u = getUserById(c.userId);
                      return (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{u?.avatar}</span>
                            <span className="text-sm font-medium text-white/80">
                              {u?.name}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 pl-7">{c.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentEvent.status === 'voting' && (
                  <div className="flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                      placeholder="说说你的理由..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
