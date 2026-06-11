import { Movie, Vote, VoteResult, VoteType } from '../types';

export const LATE_NIGHT_GENRES = ['悬疑', '恐怖', '惊悚'];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function calculateMovieVotes(movieId: string, votes: Vote[], userCount: number): VoteResult {
  const movieVotes = votes.filter(v => v.movieId === movieId);
  const want = movieVotes.filter(v => v.voteType === 'want_to_watch').length;
  const dontWant = movieVotes.filter(v => v.voteType === 'dont_want_to_watch').length;
  const watched = movieVotes.filter(v => v.voteType === 'watched').length;
  const total = want + dontWant + watched;

  const userVotes: Record<string, VoteType> = {};
  movieVotes.forEach(v => {
    userVotes[v.userId] = v.voteType;
  });

  const isControversial = Math.abs(want - dontWant) <= 2 && (want > 0 || dontWant > 0);

  return {
    want,
    dontWant,
    watched,
    total,
    wantPercent: total > 0 ? (want / total) * 100 : 0,
    dontWantPercent: total > 0 ? (dontWant / total) * 100 : 0,
    watchedPercent: total > 0 ? (watched / total) * 100 : 0,
    isControversial,
    userVotes,
  };
}

export function isShortFilm(movie: Movie): boolean {
  return movie.duration <= 100;
}

export function isLateNight(movie: Movie): boolean {
  return movie.genres.some(g => LATE_NIGHT_GENRES.includes(g)) || movie.duration >= 130;
}

export function groupMovies(movies: Movie[], votes: Vote[], userCount: number) {
  const withVotes = movies.map(m => ({
    movie: m,
    voteResult: calculateMovieVotes(m.id, votes, userCount),
  }));

  const sortedByWant = [...withVotes].sort((a, b) => b.voteResult.want - a.voteResult.want);
  const topVoted = sortedByWant.slice(0, 3).map(item => item.movie);

  const controversial = withVotes
    .filter(item => item.voteResult.isControversial)
    .map(item => item.movie);

  const shortFilms = withVotes
    .filter(item => isShortFilm(item.movie))
    .sort((a, b) => a.movie.duration - b.movie.duration)
    .map(item => item.movie);

  const lateNight = withVotes
    .filter(item => isLateNight(item.movie))
    .map(item => item.movie);

  return {
    all: movies,
    topVoted,
    controversial,
    shortFilms,
    lateNight,
  };
}

export function calculateMovieScore(movie: Movie, votes: Vote[]): number {
  const result = calculateMovieVotes(movie.id, votes, 0);
  const controversialPenalty = result.isControversial ? 1 : 0;
  return result.want * 2 + result.watched * 1 - result.dontWant * 1.5 - controversialPenalty;
}

export function recommendMovie(movies: Movie[], votes: Vote[]): Movie {
  const sorted = [...movies].sort(
    (a, b) => calculateMovieScore(b, votes) - calculateMovieScore(a, votes)
  );
  return sorted[0] || movies[0];
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分钟`;
  if (mins === 0) return `${hours}小时`;
  return `${hours}小时${mins}分钟`;
}
