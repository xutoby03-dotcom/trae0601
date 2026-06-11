import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Movie,
  User,
  Vote,
  Comment,
  MovieEvent,
  Arrangement,
  Statistics,
  TabType,
  VoteType,
} from '../types';
import {
  mockArrangement,
  mockComments,
  mockEvent,
  mockMovies,
  mockPastEvents,
  mockUsers,
  mockVotes,
} from '../data/mockData';
import { calculateMovieVotes, groupMovies, recommendMovie } from '../utils/voteUtils';
import { calculateStatistics } from '../utils/statsUtils';
import { assignSnacks, formatDateTime, getNextFriday } from '../utils/arrangementUtils';
import { generateId } from '../utils/voteUtils';

interface MovieStore {
  currentEvent: MovieEvent;
  pastEvents: MovieEvent[];
  movies: Movie[];
  users: User[];
  votes: Vote[];
  comments: Comment[];
  arrangement: Arrangement | null;
  selectedTab: TabType;
  currentUserId: string;
  showAddModal: boolean;
  showConfirmModal: boolean;

  setSelectedTab: (tab: TabType) => void;
  setShowAddModal: (show: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;

  addMovie: (movie: Omit<Movie, 'id' | 'addedAt'>) => void;
  removeMovie: (movieId: string) => void;

  castVote: (movieId: string, userId: string, voteType: VoteType) => void;
  addComment: (movieId: string, userId: string, content: string) => void;

  decideMovie: (movieId?: string) => void;
  generateArrangement: () => void;
  updateArrangement: (patch: Partial<Arrangement>) => void;
  reassignSnack: (index: number) => void;

  getMovieVotes: (movieId: string) => ReturnType<typeof calculateMovieVotes>;
  getGroupedMovies: () => ReturnType<typeof groupMovies>;
  getStats: () => Statistics;
  getCommentsForMovie: (movieId: string) => Comment[];
  getCurrentUser: () => User | undefined;
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      currentEvent: mockEvent,
      pastEvents: mockPastEvents,
      movies: mockMovies,
      users: mockUsers,
      votes: mockVotes,
      comments: mockComments,
      arrangement: mockArrangement,
      selectedTab: 'all',
      currentUserId: 'u1',
      showAddModal: false,
      showConfirmModal: false,

      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setShowAddModal: (show) => set({ showAddModal: show }),
      setShowConfirmModal: (show) => set({ showConfirmModal: show }),

      addMovie: (movie) =>
        set((state) => ({
          movies: [
            ...state.movies,
            { ...movie, id: generateId(), addedAt: new Date().toISOString() },
          ],
          showAddModal: false,
        })),

      removeMovie: (movieId) =>
        set((state) => ({
          movies: state.movies.filter((m) => m.id !== movieId),
          votes: state.votes.filter((v) => v.movieId !== movieId),
          comments: state.comments.filter((c) => c.movieId !== movieId),
        })),

      castVote: (movieId, userId, voteType) =>
        set((state) => {
          const existingVoteIndex = state.votes.findIndex(
            (v) => v.movieId === movieId && v.userId === userId
          );
          let newVotes = [...state.votes];

          if (voteType === null) {
            if (existingVoteIndex >= 0) {
              newVotes.splice(existingVoteIndex, 1);
            }
          } else {
            const newVote: Vote = {
              id: generateId(),
              movieId,
              userId,
              voteType,
              votedAt: new Date().toISOString(),
            };
            if (existingVoteIndex >= 0) {
              newVotes[existingVoteIndex] = newVote;
            } else {
              newVotes.push(newVote);
            }
          }

          return { votes: newVotes };
        }),

      addComment: (movieId, userId, content) => {
        if (!content.trim()) return;
        set((state) => ({
          comments: [
            ...state.comments,
            {
              id: generateId(),
              movieId,
              userId,
              content: content.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      decideMovie: (movieId) => {
        const { movies, votes } = get();
        const selectedId = movieId || recommendMovie(movies, votes).id;
        set((state) => ({
          currentEvent: {
            ...state.currentEvent,
            status: 'decided',
            selectedMovieId: selectedId,
            decidedAt: new Date().toISOString(),
          },
          showConfirmModal: false,
        }));
        get().generateArrangement();
      },

      generateArrangement: () =>
        set((state) => {
          const viewingTime = formatDateTime(getNextFriday());
          const arrangement: Arrangement = {
            id: generateId(),
            eventId: state.currentEvent.id,
            viewingTime,
            location: '小明家（朝阳区XX路XX号）',
            snacks: assignSnacks(state.users),
            createdAt: new Date().toISOString(),
          };
          return { arrangement };
        }),

      updateArrangement: (patch) =>
        set((state) => ({
          arrangement: state.arrangement ? { ...state.arrangement, ...patch } : null,
        })),

      reassignSnack: (index) =>
        set((state) => {
          if (!state.arrangement) return {};
          const availableUsers = state.users.filter(
            (u) =>
              !state.arrangement!.snacks.some(
                (s, i) => i !== index && s.ownerId === u.id
              )
          );
          if (availableUsers.length === 0) return {};
          const newOwner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
          const newSnacks = [...state.arrangement.snacks];
          newSnacks[index] = {
            ...newSnacks[index],
            owner: newOwner.name,
            ownerId: newOwner.id,
          };
          return {
            arrangement: { ...state.arrangement, snacks: newSnacks },
          };
        }),

      getMovieVotes: (movieId) => {
        const { votes, users } = get();
        return calculateMovieVotes(movieId, votes, users.length);
      },

      getGroupedMovies: () => {
        const { movies, votes, users } = get();
        return groupMovies(movies, votes, users.length);
      },

      getStats: () => {
        const { movies, votes, users, currentEvent, pastEvents, comments } = get();
        const allEvents = [...pastEvents, currentEvent];
        return calculateStatistics(movies, votes, users, allEvents, comments);
      },

      getCommentsForMovie: (movieId) => {
        const { comments } = get();
        return comments.filter((c) => c.movieId === movieId);
      },

      getCurrentUser: () => {
        const { currentUserId, users } = get();
        return users.find((u) => u.id === currentUserId);
      },
    }),
    {
      name: 'movie-night-store',
    }
  )
);
