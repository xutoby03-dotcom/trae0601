import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import GameCard from '@/components/GameCard'
import type { Game } from '@/types'
import { Plus, Trophy } from 'lucide-react'

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  return day === 0 || day === 6
}

type TabKey = 'today' | 'weekend' | 'recruiting'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'weekend', label: '周末' },
  { key: 'recruiting', label: '缺人中' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('today')
  const navigate = useNavigate()
  const games = useGameStore(s => s.games)

  const today = getTodayStr()

  const filteredGames: Game[] = (() => {
    switch (activeTab) {
      case 'today':
        return games
          .filter(g => g.date === today)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
      case 'weekend':
        return games
          .filter(g => isWeekend(g.date))
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      case 'recruiting':
        return games
          .filter(g => g.status === 'recruiting')
          .sort((a, b) => (a.players.length / a.maxPlayers) - (b.players.length / b.maxPlayers))
    }
  })()

  const recruitingCount = games.filter(g => g.status === 'recruiting').length

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="relative overflow-hidden px-4 py-4">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏀</span>
            <h1 className="text-white font-bold text-xl tracking-tight">小区约场</h1>
          </div>
          <button onClick={() => navigate('/stats')} className="text-zinc-400 hover:text-orange-400 transition-colors p-1">
            <Trophy size={22} />
          </button>
        </div>
      </header>

      <div className="flex border-b border-zinc-800 px-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 pb-3 pt-2 text-center relative"
          >
            <span className={`text-sm font-medium transition-colors ${activeTab === tab.key ? 'text-orange-400' : 'text-zinc-400'}`}>
              {tab.label}
              {tab.key === 'recruiting' && recruitingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-orange-500 text-white rounded-full align-middle">
                  {recruitingCount}
                </span>
              )}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto pb-24">
        {filteredGames.length > 0 ? (
          filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => navigate(`/game/${game.id}`)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <span className="text-5xl mb-4 opacity-30">🏀</span>
            <p className="text-lg font-medium">还没有球局</p>
            <p className="text-sm mt-1">点击右下角发起一个吧</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-8 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  )
}
