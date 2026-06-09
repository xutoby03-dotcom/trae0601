import { CircleDot, Square } from 'lucide-react'
import type { Game } from '@/types'
import { STATUS_LABELS, LEVEL_LABELS } from '@/types'
import { getCourtName } from '@/store/useGameStore'

const STATUS_COLORS: Record<Game['status'], string> = {
  recruiting: 'bg-orange-500/20 text-orange-400',
  confirmed: 'bg-green-500/20 text-green-400',
  completed: 'bg-zinc-600/50 text-zinc-400',
}

const LEVEL_COLORS: Record<Game['level'], string> = {
  beginner: 'bg-green-500/20 text-green-400',
  casual: 'bg-blue-500/20 text-blue-400',
  competitive: 'bg-red-500/20 text-red-400',
}

const TYPE_LABELS: Record<Game['gameType'], string> = { half: '半场', full: '全场' }

export default function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  const current = game.players.length
  const max = game.maxPlayers
  const ratio = current / max
  const isFull = current >= max
  const isAlmostFull = ratio >= 0.8 && !isFull
  const isRecruiting = game.status === 'recruiting' && ratio < 0.6

  const barColor = isFull ? 'bg-green-500' : isAlmostFull ? 'bg-orange-400 animate-pulse' : 'bg-zinc-500'

  return (
    <div
      onClick={onClick}
      className="bg-zinc-800/80 rounded-xl border border-zinc-700/50 p-4 hover:border-orange-400/40 hover:bg-zinc-750 transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div>
            <div className="text-orange-400 font-semibold text-lg">
              {game.startTime} - {game.endTime}
            </div>
            <div className="text-zinc-400 text-sm mt-0.5">{game.date}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[game.status]}`}>
            {STATUS_LABELS[game.status]}
          </span>
          <span className="text-zinc-300 text-sm">{getCourtName(game.courtName)}</span>
          <div className="flex gap-1.5">
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-700/60 text-zinc-300">
              {game.gameType === 'half' ? <CircleDot size={12} /> : <Square size={12} />}
              {TYPE_LABELS[game.gameType]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[game.level]}`}>
              {LEVEL_LABELS[game.level]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-zinc-400">
            {current}/{max}人
            {isRecruiting && (
              <span className="ml-2 text-orange-400 font-medium px-1.5 py-0.5 bg-orange-500/20 rounded text-[10px]">缺人</span>
            )}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  )
}
