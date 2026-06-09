import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game, GamePlayer, Player, Level, Position } from '@/types'
import { COURTS } from '@/types'

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

const AVATARS = [
  '🏀', '🔥', '⚡', '🎯', '💪', '🏃', '⭐', '🏆', '👑', '🦅',
  '🐉', '🦁', '🐺', '🦊', '🐻', '🐼', '🦈', '🐅', '🦅', '🐬',
]

interface GameState {
  players: Player[]
  games: Game[]
  currentUserId: string
  demoSeeded: boolean

  initUser: (name: string, phone: string, wechat: string) => string
  getCurrentUser: () => Player | undefined
  seedDemoData: () => void

  createGame: (data: Omit<Game, 'id' | 'creatorId' | 'players' | 'status' | 'createdAt'>) => { success: boolean; conflict?: Game }
  joinGame: (gameId: string, position: Position, level: Level, bringBall: boolean) => boolean
  leaveGame: (gameId: string) => void
  completeGame: (gameId: string, score: { teamA: number; teamB: number }, mvpId: string, latePlayerIds: string[]) => void

  checkConflict: (courtName: string, date: string, startTime: string, endTime: string, excludeGameId?: string) => Game | null
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      games: [],
      currentUserId: '',
      demoSeeded: false,

      seedDemoData: () => {
        const state = get()
        if (state.demoSeeded) return
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        const sat = new Date(today)
        sat.setDate(today.getDate() + (6 - today.getDay()))
        const satStr = `${sat.getFullYear()}-${String(sat.getMonth() + 1).padStart(2, '0')}-${String(sat.getDate()).padStart(2, '0')}`
        const sun = new Date(sat)
        sun.setDate(sat.getDate() + 1)
        const sunStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`
        const prevWeek = new Date(today)
        prevWeek.setDate(today.getDate() - 7)
        const prevStr = `${prevWeek.getFullYear()}-${String(prevWeek.getMonth() + 1).padStart(2, '0')}-${String(prevWeek.getDate()).padStart(2, '0')}`

        const demoPlayers: Player[] = [
          { id: 'dp1', name: '小明', phone: '13800001111', wechat: 'xiaoming_ball', avatar: '🏀' },
          { id: 'dp2', name: '阿强', phone: '13800002222', wechat: 'aqiang_nba', avatar: '🔥' },
          { id: 'dp3', name: '大飞', phone: '13800003333', wechat: 'dafei_23', avatar: '⚡' },
          { id: 'dp4', name: '老王', phone: '13800004444', wechat: 'laowang_court', avatar: '💪' },
          { id: 'dp5', name: '小黑', phone: '13800005555', wechat: 'xiaohei_dunk', avatar: '🏃' },
          { id: 'dp6', name: '阿杰', phone: '13800006666', wechat: 'ajie_3pt', avatar: '⭐' },
          { id: 'dp7', name: '铁柱', phone: '13800007777', wechat: 'tiezhu_block', avatar: '🦁' },
          { id: 'dp8', name: '小刘', phone: '13800008888', wechat: 'xiaoliu_fast', avatar: '🐺' },
        ]

        const gp = (pid: string, pos: Position, lvl: Level, ball: boolean): GamePlayer => ({
          playerId: pid, position: pos, level: lvl, bringBall: ball, isLate: false, isMVP: false,
        })

        const demoGames: Game[] = [
          {
            id: 'dg1', creatorId: 'dp1', courtName: 'court-a', date: todayStr,
            startTime: '18:00', endTime: '20:00', gameType: 'half', maxPlayers: 8,
            level: 'casual', needTeamSplit: true, contact: 'xiaoming_ball',
            players: [gp('dp1','G','casual',true), gp('dp2','F','casual',false), gp('dp3','C','casual',false), gp('dp4','any','casual',false), gp('dp5','G','casual',true)],
            status: 'recruiting', createdAt: new Date().toISOString(),
          },
          {
            id: 'dg2', creatorId: 'dp2', courtName: 'court-b', date: todayStr,
            startTime: '19:30', endTime: '21:00', gameType: 'full', maxPlayers: 10,
            level: 'competitive', needTeamSplit: true, contact: 'aqiang_nba',
            players: [gp('dp2','G','competitive',true), gp('dp6','F','competitive',false), gp('dp7','C','competitive',false), gp('dp8','F','casual',false), gp('dp1','any','casual',false), gp('dp3','G','competitive',true), gp('dp4','any','casual',false), gp('dp5','F','competitive',false)],
            status: 'confirmed', createdAt: new Date().toISOString(),
          },
          {
            id: 'dg3', creatorId: 'dp3', courtName: 'court-c', date: satStr,
            startTime: '09:00', endTime: '11:00', gameType: 'half', maxPlayers: 8,
            level: 'beginner', needTeamSplit: false, contact: 'dafei_23',
            players: [gp('dp3','any','beginner',true), gp('dp5','any','beginner',false)],
            status: 'recruiting', createdAt: new Date().toISOString(),
          },
          {
            id: 'dg4', creatorId: 'dp4', courtName: 'court-a', date: sunStr,
            startTime: '15:00', endTime: '17:00', gameType: 'half', maxPlayers: 8,
            level: 'casual', needTeamSplit: true, contact: 'laowang_court',
            players: [gp('dp4','F','casual',true), gp('dp1','G','casual',false), gp('dp2','F','casual',false), gp('dp3','C','casual',false), gp('dp5','G','casual',false), gp('dp6','any','casual',false), gp('dp7','any','casual',true)],
            status: 'recruiting', createdAt: new Date().toISOString(),
          },
          {
            id: 'dg5', creatorId: 'dp1', courtName: 'court-b', date: prevStr,
            startTime: '19:00', endTime: '21:00', gameType: 'half', maxPlayers: 8,
            level: 'casual', needTeamSplit: true, contact: 'xiaoming_ball',
            players: [
              { ...gp('dp1','G','casual',true), isMVP: true },
              gp('dp2','F','casual',false), gp('dp3','C','casual',false),
              gp('dp4','any','casual',false), gp('dp5','G','casual',true),
              gp('dp6','F','casual',false), gp('dp7','any','casual',false),
              { ...gp('dp8','any','casual',false), isLate: true },
            ],
            status: 'completed', score: { teamA: 21, teamB: 18 }, mvpId: 'dp1',
            latePlayerIds: ['dp8'], createdAt: new Date().toISOString(),
          },
        ]

        set({ players: demoPlayers, games: demoGames, demoSeeded: true })
      },

      initUser: (name, phone, wechat) => {
        const state = get()
        const existing = state.players.find(p => p.phone === phone)
        if (existing) {
          set({ currentUserId: existing.id })
          return existing.id
        }
        const id = generateId()
        const avatar = AVATARS[state.players.length % AVATARS.length]
        const player: Player = { id, name, phone, wechat, avatar }
        set(s => ({
          players: [...s.players, player],
          currentUserId: id,
        }))
        return id
      },

      getCurrentUser: () => {
        const state = get()
        return state.players.find(p => p.id === state.currentUserId)
      },

      createGame: (data) => {
        const state = get()
        const conflict = state.checkConflict(data.courtName, data.date, data.startTime, data.endTime)
        if (conflict) {
          return { success: false, conflict }
        }
        const game: Game = {
          ...data,
          id: generateId(),
          creatorId: state.currentUserId,
          players: [{
            playerId: state.currentUserId,
            position: 'any',
            level: data.level,
            bringBall: false,
            isLate: false,
            isMVP: false,
          }],
          status: 'recruiting',
          createdAt: new Date().toISOString(),
        }
        set(s => ({ games: [...s.games, game] }))
        return { success: true }
      },

      joinGame: (gameId, position, level, bringBall) => {
        const state = get()
        const game = state.games.find(g => g.id === gameId)
        if (!game) return false
        if (game.status !== 'recruiting' && game.status !== 'confirmed') return false
        if (game.players.length >= game.maxPlayers) return false
        if (game.players.some(p => p.playerId === state.currentUserId)) return false

        const newPlayer: GamePlayer = {
          playerId: state.currentUserId,
          position,
          level,
          bringBall,
          isLate: false,
          isMVP: false,
        }

        const updatedPlayers = [...game.players, newPlayer]
        const newStatus: Game['status'] = updatedPlayers.length >= game.maxPlayers ? 'confirmed' : game.status

        set(s => ({
          games: s.games.map(g =>
            g.id === gameId ? { ...g, players: updatedPlayers, status: newStatus } : g
          ),
        }))
        return true
      },

      leaveGame: (gameId) => {
        const state = get()
        const game = state.games.find(g => g.id === gameId)
        if (!game) return
        if (game.status === 'completed') return
        if (!game.players.some(p => p.playerId === state.currentUserId)) return

        const updatedPlayers = game.players.filter(p => p.playerId !== state.currentUserId)
        const newStatus: Game['status'] = updatedPlayers.length < game.maxPlayers && game.status === 'confirmed'
          ? 'recruiting'
          : game.status

        set(s => ({
          games: s.games.map(g =>
            g.id === gameId ? { ...g, players: updatedPlayers, status: newStatus } : g
          ),
        }))
      },

      completeGame: (gameId, score, mvpId, latePlayerIds) => {
        set(s => ({
          games: s.games.map(g =>
            g.id === gameId
              ? {
                  ...g,
                  status: 'completed' as const,
                  score,
                  mvpId,
                  latePlayerIds,
                  players: g.players.map(p => ({
                    ...p,
                    isLate: latePlayerIds.includes(p.playerId),
                    isMVP: p.playerId === mvpId,
                  })),
                }
              : g
          ),
        }))
      },

      checkConflict: (courtName, date, startTime, endTime, excludeGameId) => {
        const state = get()
        return state.games.find(g => {
          if (g.id === excludeGameId) return false
          if (g.courtName !== courtName) return false
          if (g.date !== date) return false
          if (g.status === 'completed') return false
          return startTime < g.endTime && endTime > g.startTime
        }) || null
      },
    }),
    {
      name: 'basketball-store',
    }
  )
)

export function getCourtName(courtId: string): string {
  const court = COURTS.find(c => c.id === courtId)
  return court ? `${court.name}(${court.location})` : courtId
}

export function getPlayerById(players: Player[], id: string): Player | undefined {
  return players.find(p => p.id === id)
}
