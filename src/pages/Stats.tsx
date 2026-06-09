import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { getWeeklyStats, getPlayerRankings, getTimeSlotHeat } from '@/utils/stats'
import { ArrowLeft, TrendingUp, Award, Flame } from 'lucide-react'

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export default function Stats() {
  const navigate = useNavigate()
  const players = useGameStore(s => s.players)
  const games = useGameStore(s => s.games)

  const weeklyStats = getWeeklyStats(games)
  const playerRankings = getPlayerRankings(players, games).slice(0, 10)
  const timeSlotHeat = getTimeSlotHeat(games)
  const maxHeat = Math.max(...timeSlotHeat.map(t => t.gameCount), 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold">数据统计</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold">每周统计</h2>
          </div>
          {weeklyStats.length === 0 ? (
            <p className="text-zinc-500 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {weeklyStats.map(week => (
                <div key={week.weekLabel} className="bg-zinc-900 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{week.weekLabel}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 text-xl font-bold">{week.gameCount}</span>
                    <span className="text-zinc-500 text-xs">{week.totalPlayers}人参与</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold">活跃排行</h2>
          </div>
          {playerRankings.length === 0 || playerRankings.every(p => p.gameCount === 0) ? (
            <p className="text-zinc-500 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {playerRankings.filter(p => p.gameCount > 0).map((player, idx) => (
                <div key={player.playerId} className="bg-zinc-900 rounded-lg p-3 flex items-center gap-3">
                  <span
                    className={`text-sm font-bold w-5 text-center ${idx >= 3 ? 'text-zinc-400' : ''}`}
                    style={{ color: idx < 3 ? RANK_COLORS[idx] : undefined }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-lg">{player.avatar}</span>
                  <span className="text-sm flex-1">{player.name}</span>
                  <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
                    {player.gameCount}场
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold">时段热度</h2>
          </div>
          {timeSlotHeat.length === 0 ? (
            <p className="text-zinc-500 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {timeSlotHeat.map(slot => {
                const ratio = maxHeat > 0 ? slot.gameCount / maxHeat : 0
                const barColor = ratio < 0.33 ? 'bg-green-500' : ratio < 0.66 ? 'bg-orange-500' : 'bg-red-500'
                return (
                  <div key={slot.timeSlot} className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400 w-14 text-right">{slot.timeSlot}</span>
                    <div className="w-48 bg-zinc-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400">{slot.gameCount}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
