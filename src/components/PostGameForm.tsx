import { useState } from 'react'
import { Game, Player } from '@/types'

interface PostGameFormProps {
  game: Game
  players: Player[]
  onSubmit: (score: { teamA: number; teamB: number }, mvpId: string, latePlayerIds: string[]) => void
}

export default function PostGameForm({ game, players, onSubmit }: PostGameFormProps) {
  const [score, setScore] = useState({ teamA: 0, teamB: 0 })
  const [mvpId, setMvpId] = useState('')
  const [latePlayerIds, setLatePlayerIds] = useState<string[]>([])

  const adjustScore = (team: 'teamA' | 'teamB', delta: number) => {
    setScore(prev => ({ ...prev, [team]: Math.max(0, prev[team] + delta) }))
  }

  const toggleLate = (playerId: string) => {
    setLatePlayerIds(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    )
  }

  return (
    <div className="bg-zinc-800 rounded-xl p-5 space-y-5">
      <div className="space-y-3">
        <h3 className="text-white font-bold">比分记录</h3>
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => adjustScore('teamA', 1)}
              className="bg-zinc-600 rounded w-10 h-10 text-white font-bold text-xl flex items-center justify-center"
            >
              +
            </button>
            <input
              type="text"
              readOnly
              value={score.teamA}
              className="bg-zinc-700 rounded-lg text-center w-24 h-16 text-white font-bold text-3xl"
            />
            <button
              onClick={() => adjustScore('teamA', -1)}
              className="bg-zinc-600 rounded w-10 h-10 text-white font-bold text-xl flex items-center justify-center"
            >
              −
            </button>
          </div>
          <span className="text-zinc-500 font-bold text-xl">VS</span>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => adjustScore('teamB', 1)}
              className="bg-zinc-600 rounded w-10 h-10 text-white font-bold text-xl flex items-center justify-center"
            >
              +
            </button>
            <input
              type="text"
              readOnly
              value={score.teamB}
              className="bg-zinc-700 rounded-lg text-center w-24 h-16 text-white font-bold text-3xl"
            />
            <button
              onClick={() => adjustScore('teamB', -1)}
              className="bg-zinc-600 rounded w-10 h-10 text-white font-bold text-xl flex items-center justify-center"
            >
              −
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-bold">MVP</h3>
        <div className="grid grid-cols-4 gap-3">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => setMvpId(player.id)}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 ${
                mvpId === player.id ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              <span className="text-3xl">{player.avatar}</span>
              <span className="text-white text-xs truncate w-full text-center">{player.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-bold">迟到</h3>
        <div className="space-y-2">
          {players.map(player => (
            <label
              key={player.id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={latePlayerIds.includes(player.id)}
                onChange={() => toggleLate(player.id)}
                className="w-5 h-5 rounded accent-orange-500"
              />
              <span className="text-white">{player.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit(score, mvpId, latePlayerIds)}
        className="w-full bg-orange-500 rounded-xl text-white font-bold h-12"
      >
        提交记录
      </button>
    </div>
  )
}
