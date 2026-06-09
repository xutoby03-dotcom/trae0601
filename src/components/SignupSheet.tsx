import { useState } from 'react'
import { Position, Level, POSITION_LABELS, LEVEL_LABELS } from '@/types'

interface SignupSheetProps {
  open: boolean
  onClose: () => void
  onSignup: (position: Position, level: Level, bringBall: boolean) => void
}

const positions: Position[] = ['G', 'F', 'C', 'any']
const levels: Level[] = ['beginner', 'casual', 'competitive']

export default function SignupSheet({ open, onClose, onSignup }: SignupSheetProps) {
  const [position, setPosition] = useState<Position | null>(null)
  const [level, setLevel] = useState<Level>('casual')
  const [bringBall, setBringBall] = useState(false)

  if (!open) return null

  const handleSubmit = () => {
    if (!position) return
    onSignup(position, level, bringBall)
    setPosition(null)
    setLevel('casual')
    setBringBall(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 rounded-t-2xl p-6 max-w-lg mx-auto z-50">
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4" />
        <h2 className="text-white text-xl font-bold mb-6">报名参加</h2>

        <div className="mb-6">
          <p className="text-zinc-400 text-sm mb-3">位置</p>
          <div className="flex justify-center gap-4">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    position === pos ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {pos === 'any' ? '不限' : pos}
                </div>
                <span className="text-zinc-400 text-xs">{POSITION_LABELS[pos]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-zinc-400 text-sm mb-3">水平</p>
          <div className="flex gap-2">
            {levels.map((l) => (
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

        <div className="mb-6 flex items-center justify-between">
          <span className="text-zinc-300 text-sm">自带篮球</span>
          <div
            onClick={() => setBringBall(!bringBall)}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
              bringBall ? 'bg-orange-500' : 'bg-zinc-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                bringBall ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!position}
          className={`w-full h-12 rounded-xl text-white font-bold ${
            position ? 'bg-orange-500' : 'bg-orange-500/40 cursor-not-allowed'
          }`}
        >
          报名
        </button>
      </div>
    </>
  )
}
