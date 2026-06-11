import { Comment, GenreStat, Movie, Statistics, UserAbstainRate, Vote, VoteHeatmapData, User, MovieEvent, DecisionTime } from '../types';

export function calculateStatistics(
  movies: Movie[],
  votes: Vote[],
  users: User[],
  events: MovieEvent[],
  _comments: Comment[]
): Statistics {
  const totalEvents = events.length;
  const totalVotes = votes.length;

  const userVoteCounts: Record<string, number> = {};
  users.forEach(u => { userVoteCounts[u.id] = 0; });
  votes.forEach(v => {
    if (v.voteType) userVoteCounts[v.userId] = (userVoteCounts[v.userId] || 0) + 1;
  });

  const mostActiveUserId = Object.entries(userVoteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const mostActiveUser = users.find(u => u.id === mostActiveUserId) || users[0];

  const abstainRates: UserAbstainRate[] = users.map(user => {
    const totalCount = movies.length;
    const votedCount = userVoteCounts[user.id] || 0;
    const rate = totalCount > 0 ? ((totalCount - votedCount) / totalCount) * 100 : 0;
    return {
      userId: user.id,
      userName: user.name,
      rate: Math.round(rate * 10) / 10,
      votedCount,
      totalCount,
    };
  }).sort((a, b) => b.rate - a.rate);

  const genreCountMap: Record<string, { want: number; total: number }> = {};
  votes.forEach(v => {
    const movie = movies.find(m => m.id === v.movieId);
    if (!movie) return;
    movie.genres.forEach(g => {
      if (!genreCountMap[g]) genreCountMap[g] = { want: 0, total: 0 };
      genreCountMap[g].total++;
      if (v.voteType === 'want_to_watch') genreCountMap[g].want++;
    });
  });

  const genreStats: GenreStat[] = Object.entries(genreCountMap).map(([genre, data]) => ({
    genre,
    wantCount: data.want,
    totalCount: data.total,
    wantRate: data.total > 0 ? Math.round((data.want / data.total) * 1000) / 10 : 0,
  })).sort((a, b) => b.wantRate - a.wantRate);

  const decisionTimes: DecisionTime[] = events
    .filter(e => e.createdAt && e.decidedAt)
    .map(e => {
      const hours = (new Date(e.decidedAt!).getTime() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60);
      return { eventName: e.title, hours: Math.round(hours * 10) / 10 };
    });

  const avgDecisionHours = decisionTimes.length > 0
    ? Math.round((decisionTimes.reduce((s, d) => s + d.hours, 0) / decisionTimes.length) * 10) / 10
    : 0;

  const heatmap: Record<string, number> = {};
  votes.forEach(v => {
    const date = new Date(v.votedAt);
    const key = `${date.getDay()}-${date.getHours()}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  });

  const voteHeatmap: VoteHeatmapData[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      voteHeatmap.push({
        dayOfWeek: day,
        hour,
        count: heatmap[`${day}-${hour}`] || 0,
      });
    }
  }

  return {
    totalEvents,
    totalVotes,
    avgDecisionHours,
    mostActiveUser: { name: mostActiveUser?.name || '未知', count: userVoteCounts[mostActiveUserId] || 0 },
    abstainRates,
    genreStats,
    decisionTimes,
    voteHeatmap,
  };
}
