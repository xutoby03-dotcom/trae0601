import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { COURTS, LEVEL_LABELS, GameType, Level, Court } from '@/types'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const levels: Level[] = ['beginner', 'casual', 'competitive']

export default function CreateGame() {
  const navigate = useNavigate()
  const { createGame, checkConflict } = useGameStore()

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [courtName, setCourtName] = useState('')
  const [gameType, setGameType] = useState<GameType>('half')
  const [level, setLevel] = useState<Level>('casual')
  const [needTeamSplit, setNeedTeamSplit] = useState(false)
  const [contact, setContact] = useState('')
  const [conflictGame, setConflictGame] = useState<ReturnType<typeof checkConflict>>(null)

  const maxPlayers = gameType === 'half' ? 8 : 10

  useEffect(() => {
    if (courtName && date && startTime && endTime) {
      setConflictGame(checkConflict(courtName, date, startTime, endTime))
    } else {
      setConflictGame(null)
    }
  }, [courtName, date, startTime, endTime, checkConflict])

  const isDisabled = !date || !startTime || !endTime || !courtName || !contact || !!conflictGame

  const handleSubmit = () => {
    const result = createGame({
      courtName,
      date,
      startTime,
      endTime,
      gameType,
      maxPlayers,
      level,
      needTeamSplit,
      contact,
    })
    if (result.success) {
      navigate('/')
    } else if (result.conflict) {
      setConflictGame(result.conflict)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">发起球局</h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">时间段</label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-zinc-500">-</span>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">场地</label>
            <select
              value={courtName}
              onChange={e => setCourtName(e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">选择场地</option>
              {COURTS.map((court: Court) => (
                <option key={court.id} value={court.id}>
                  {court.name} {court.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">赛制</label>
            <div className="flex gap-3">
              <button
                onClick={() => setGameType('half')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  gameType === 'half'
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                半场(8人)
              </button>
              <button
                onClick={() => setGameType('full')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  gameType === 'full'
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                全场(10人)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">水平</label>
            <div className="flex gap-3">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium border ${
                    level === l
                      ? 'border-orange-500 text-orange-500'
                      : 'border-zinc-600 text-zinc-400'
                  }`}
                >
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-300 text-sm">是否分队</span>
            <button
              onClick={() => setNeedTeamSplit(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                needTeamSplit ? 'bg-orange-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  needTeamSplit ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">联系方式</label>
            <input
              type="text"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="微信号/手机号"
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-500"
            />
          </div>

          {conflictGame && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <AlertTriangle size={18} />
                <span>场地冲突！该时段已有球局</span>
              </div>
              <div className="mt-2 text-zinc-400 text-sm">
                {conflictGame.date} {conflictGame.startTime}-{conflictGame.endTime} · {conflictGame.courtName}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full bg-orange-500 rounded-xl text-white font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发起球局
          </button>
        </div>
      </div>
    </div>
  )
}
