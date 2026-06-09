import type { Game, Player, WeeklyStats, PlayerRanking, TimeSlotHeat } from '@/types'

function getWeekRange(dateStr: string): { weekStart: Date; weekEnd: Date; label: string } {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const weekStart = new Date(d)
  weekStart.setDate(d.getDate() - diffToMonday)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
  return { weekStart, weekEnd, label }
}

export function getWeeklyStats(games: Game[]): WeeklyStats[] {
  const completed = games.filter(g => g.status === 'completed')
  const weekMap = new Map<string, { gameCount: number; playerIds: Set<string> }>()

  for (const game of completed) {
    const { label } = getWeekRange(game.date)
    const existing = weekMap.get(label)
    if (existing) {
      existing.gameCount += 1
      for (const p of game.players) {
        existing.playerIds.add(p.playerId)
      }
    } else {
      weekMap.set(label, {
        gameCount: 1,
        playerIds: new Set(game.players.map(p => p.playerId)),
      })
    }
  }

  return Array.from(weekMap.entries()).map(([weekLabel, data]) => ({
    weekLabel,
    gameCount: data.gameCount,
    totalPlayers: data.playerIds.size,
  }))
}

export function getPlayerRankings(players: Player[], games: Game[]): PlayerRanking[] {
  const completed = games.filter(g => g.status === 'completed' || g.status === 'confirmed')
  const countMap = new Map<string, number>()

  for (const game of completed) {
    for (const p of game.players) {
      countMap.set(p.playerId, (countMap.get(p.playerId) ?? 0) + 1)
    }
  }

  return players
    .map(player => ({
      playerId: player.id,
      name: player.name,
      avatar: player.avatar,
      gameCount: countMap.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.gameCount - a.gameCount)
}

export function getTimeSlotHeat(games: Game[]): TimeSlotHeat[] {
  const slotMap = new Map<string, number>()

  for (const game of games) {
    const hour = game.startTime.split(':')[0]
    const timeSlot = `${hour}:00`
    slotMap.set(timeSlot, (slotMap.get(timeSlot) ?? 0) + 1)
  }

  return Array.from(slotMap.entries())
    .map(([timeSlot, gameCount]) => ({ timeSlot, gameCount }))
    .sort((a, b) => b.gameCount - a.gameCount)
}
