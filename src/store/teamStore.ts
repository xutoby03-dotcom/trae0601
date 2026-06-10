import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team, Member, Review, CreateTeamForm, JoinTeamForm, TeamStatus } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const normalizeTeamStatus = (team: Team): Team => {
  if (team.status === 'completed') return team;
  const isFull = team.members.length >= team.totalPeople;
  return {
    ...team,
    status: isFull ? 'locked' : 'recruiting',
  };
};

const normalizeTeams = (teams: Team[]): Team[] => teams.map(normalizeTeamStatus);

const mockTeams: Team[] = [
  {
    id: 'team1',
    shopName: '谜境密室体验馆',
    themeName: '幽冥客栈',
    themeType: 'horror',
    totalPeople: 6,
    price: 168,
    duration: 120,
    difficulty: 'hard',
    horrorLevel: 'high',
    availableTimes: ['2026-06-15 19:00', '2026-06-15 20:00', '2026-06-16 19:30'],
    status: 'recruiting',
    members: [
      { id: 'm1', name: '张三', acceptHorror: true, motionSickness: false, skill: 'puzzle', budgetLimit: 200, joinedAt: '2026-06-10T10:00:00Z' },
      { id: 'm2', name: '李四', acceptHorror: true, motionSickness: false, skill: 'search', budgetLimit: 180, joinedAt: '2026-06-10T10:30:00Z' },
      { id: 'm3', name: '王五', acceptHorror: false, motionSickness: true, skill: 'both', budgetLimit: 200, joinedAt: '2026-06-10T11:00:00Z' },
    ],
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'team2',
    shopName: 'Xcape异时刻',
    themeName: '博物馆奇妙夜',
    themeType: 'mystery',
    totalPeople: 4,
    price: 128,
    duration: 90,
    difficulty: 'medium',
    horrorLevel: 'mild',
    availableTimes: ['2026-06-12 18:00', '2026-06-12 19:30'],
    status: 'locked',
    members: [
      { id: 'm4', name: '赵六', acceptHorror: true, motionSickness: false, skill: 'puzzle', budgetLimit: 150, joinedAt: '2026-06-10T12:00:00Z' },
      { id: 'm5', name: '钱七', acceptHorror: true, motionSickness: false, skill: 'puzzle', budgetLimit: 150, joinedAt: '2026-06-10T12:10:00Z' },
      { id: 'm6', name: '孙八', acceptHorror: true, motionSickness: false, skill: 'search', budgetLimit: 130, joinedAt: '2026-06-10T12:20:00Z' },
      { id: 'm7', name: '周九', acceptHorror: false, motionSickness: false, skill: 'both', budgetLimit: 200, joinedAt: '2026-06-10T12:30:00Z' },
    ],
    createdAt: '2026-06-10T11:00:00Z',
  },
  {
    id: 'team3',
    shopName: '暴风岛多结局密室',
    themeName: '机械迷城',
    themeType: 'mechanism',
    totalPeople: 5,
    price: 198,
    duration: 150,
    difficulty: 'expert',
    horrorLevel: 'none',
    availableTimes: ['2026-06-11 14:00'],
    status: 'locked',
    members: [
      { id: 'm8', name: '吴十', acceptHorror: false, motionSickness: false, skill: 'both', budgetLimit: 250, joinedAt: '2026-06-09T10:00:00Z' },
      { id: 'm9', name: '郑十一', acceptHorror: true, motionSickness: false, skill: 'puzzle', budgetLimit: 200, joinedAt: '2026-06-09T10:10:00Z' },
      { id: 'm10', name: '王十二', acceptHorror: false, motionSickness: false, skill: 'puzzle', budgetLimit: 220, joinedAt: '2026-06-09T10:20:00Z' },
      { id: 'm11', name: '冯十三', acceptHorror: true, motionSickness: true, skill: 'search', budgetLimit: 200, joinedAt: '2026-06-09T10:30:00Z' },
      { id: 'm12', name: '陈十四', acceptHorror: false, motionSickness: false, skill: 'both', budgetLimit: 250, joinedAt: '2026-06-09T10:40:00Z' },
    ],
    review: {
      id: 'r1',
      teamId: 'team3',
      rating: 5,
      bestPuzzleSolver: '吴十',
      hiddenCost: false,
      notes: '机关设计很精妙，下次还要来！',
      createdAt: '2026-06-10T18:00:00Z',
    },
    createdAt: '2026-06-09T09:00:00Z',
  },
  {
    id: 'team4',
    shopName: '长古世家',
    themeName: '鬼打墙',
    themeType: 'horror',
    totalPeople: 8,
    price: 218,
    duration: 180,
    difficulty: 'hard',
    horrorLevel: 'extreme',
    availableTimes: ['2026-06-20 20:00'],
    status: 'recruiting',
    members: [
      { id: 'm13', name: '林十五', acceptHorror: true, motionSickness: false, skill: 'search', budgetLimit: 300, joinedAt: '2026-06-10T14:00:00Z' },
    ],
    createdAt: '2026-06-10T13:00:00Z',
  },
];

interface TeamState {
  teams: Team[];
  createTeam: (form: CreateTeamForm) => Team;
  joinTeam: (teamId: string, form: JoinTeamForm) => void;
  leaveTeam: (teamId: string, memberId: string) => void;
  addReview: (teamId: string, review: Omit<Review, 'id' | 'teamId' | 'createdAt'>) => void;
  markTeamCompleted: (teamId: string) => void;
  getTeam: (teamId: string) => Team | undefined;
  normalizeAllTeams: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: normalizeTeams(mockTeams),

      createTeam: (form) => {
        const newTeam: Team = {
          id: generateId(),
          ...form,
          status: 'recruiting',
          members: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ teams: [newTeam, ...state.teams] }));
        return newTeam;
      },

      joinTeam: (teamId, form) => {
        set((state) => {
          const teams = state.teams.map((team) => {
            if (team.id !== teamId) return team;
            if (team.members.length >= team.totalPeople) return team;

            const newMember: Member = {
              id: generateId(),
              ...form,
              joinedAt: new Date().toISOString(),
            };

            const updatedMembers = [...team.members, newMember];
            const newStatus: TeamStatus = updatedMembers.length >= team.totalPeople ? 'locked' : team.status;

            return {
              ...team,
              members: updatedMembers,
              status: newStatus,
            };
          });
          return { teams };
        });
      },

      leaveTeam: (teamId, memberId) => {
        set((state) => {
          const teams = state.teams.map((team) => {
            if (team.id !== teamId) return team;
            if (team.status === 'completed') return team;
            const updatedMembers = team.members.filter((m) => m.id !== memberId);
            return {
              ...team,
              members: updatedMembers,
              status: 'recruiting' as TeamStatus,
            };
          });
          return { teams };
        });
      },

      addReview: (teamId, reviewData) => {
        set((state) => {
          const teams = state.teams.map((team) => {
            if (team.id !== teamId) return team;
            const review: Review = {
              id: generateId(),
              teamId,
              ...reviewData,
              createdAt: new Date().toISOString(),
            };
            return { ...team, review, status: 'completed' as TeamStatus };
          });
          return { teams };
        });
      },

      markTeamCompleted: (teamId) => {
        set((state) => {
          const teams = state.teams.map((team) =>
            team.id === teamId ? { ...team, status: 'completed' as TeamStatus } : team
          );
          return { teams };
        });
      },

      getTeam: (teamId) => {
        return get().teams.find((t) => t.id === teamId);
      },

      normalizeAllTeams: () => {
        set((state) => ({
          teams: normalizeTeams(state.teams),
        }));
      },
    }),
    {
      name: 'escape-room-teams',
      onRehydrateStorage: () => (state) => {
        if (state?.teams) {
          state.teams = normalizeTeams(state.teams);
        }
      },
    }
  )
);
