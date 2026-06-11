export type VoteType = 'want_to_watch' | 'dont_want_to_watch' | 'watched' | null;

export type EventStatus = 'voting' | 'decided' | 'completed';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  joinDate: string;
}

export interface Movie {
  id: string;
  title: string;
  genres: string[];
  duration: number;
  platform: string;
  rating: number;
  trailerUrl: string;
  posterUrl: string;
  addedBy: string;
  addedAt: string;
}

export interface Vote {
  id: string;
  movieId: string;
  userId: string;
  voteType: VoteType;
  votedAt: string;
}

export interface Comment {
  id: string;
  movieId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface MovieEvent {
  id: string;
  title: string;
  hostId: string;
  participantIds: string[];
  status: EventStatus;
  selectedMovieId: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface SnackAssignment {
  snack: string;
  owner: string;
  ownerId: string;
}

export interface Arrangement {
  id: string;
  eventId: string;
  viewingTime: string;
  location: string;
  snacks: SnackAssignment[];
  createdAt: string;
}

export interface VoteResult {
  want: number;
  dontWant: number;
  watched: number;
  total: number;
  wantPercent: number;
  dontWantPercent: number;
  watchedPercent: number;
  isControversial: boolean;
  userVotes: Record<string, VoteType>;
}

export interface MovieComments {
  [movieId: string]: Comment[];
}

export interface UserAbstainRate {
  userId: string;
  userName: string;
  rate: number;
  votedCount: number;
  totalCount: number;
}

export interface GenreStat {
  genre: string;
  wantCount: number;
  totalCount: number;
  wantRate: number;
}

export interface DecisionTime {
  eventName: string;
  hours: number;
}

export interface VoteHeatmapData {
  hour: number;
  dayOfWeek: number;
  count: number;
}

export interface Statistics {
  totalEvents: number;
  totalVotes: number;
  avgDecisionHours: number;
  mostActiveUser: { name: string; count: number };
  abstainRates: UserAbstainRate[];
  genreStats: GenreStat[];
  decisionTimes: DecisionTime[];
  voteHeatmap: VoteHeatmapData[];
}

export type TabType = 'all' | 'top' | 'controversial' | 'short' | 'latenight';
