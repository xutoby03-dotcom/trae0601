import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore, getCourtName, getPlayerById } from '@/store/useGameStore'
import { Game, GamePlayer, Player, STATUS_LABELS, LEVEL_LABELS, POSITION_LABELS } from '@/types'
import SignupSheet from '@/components/SignupSheet'
import PostGameForm from '@/components/PostGameForm'
import { ArrowLeft, Clock, MapPin, Users, MessageCircle } from 'lucide-react'

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

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { games, players, currentUserId, joinGame, leaveGame, completeGame } = useGameStore()
  const [signupOpen, setSignupOpen] = useState(false)
  const [showPostGame, setShowPostGame] = useState(false)

  const game = games.find((g: Game) => g.id === gameId)
  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400 text-lg">球局不存在</p>
      </div>
    )
  }

  const gamePlayers = game.players.map((gp: GamePlayer) => ({
    ...gp,
    player: getPlayerById(players, gp.playerId),
  })).filter((gp: GamePlayer & { player: Player | undefined }) => gp.player)

  const isJoined = game.players.some((p: GamePlayer) => p.playerId === currentUserId)
  const isCreator = game.creatorId === currentUserId
  const isRecruitingOrConfirmed = game.status === 'recruiting' || game.status === 'confirmed'
  const now = new Date()
  const gameDateTime = new Date(`${game.date}T${game.endTime}`)
  const hasPassed = now > gameDateTime

  const handleSignup = (position: 'G' | 'F' | 'C' | 'any', level: 'beginner' | 'casual' | 'competitive', bringBall: boolean) => {
    joinGame(game.id, position, level, bringBall)
    setSignupOpen(false)
  }

  const handleComplete = (score: { teamA: number; teamB: number }, mvpId: string, latePlayerIds: string[]) => {
    completeGame(game.id, score, mvpId, latePlayerIds)
    setShowPostGame(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-lg font-bold">球局详情</h1>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[game.status]}`}>
              {STATUS_LABELS[game.status]}
            </span>
            <span className="text-zinc-500 text-sm">{game.date}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <Clock size={16} className="text-orange-400 shrink-0" />
            <span>{game.date} {game.startTime} - {game.endTime}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <MapPin size={16} className="text-orange-400 shrink-0" />
            <span>{getCourtName(game.courtName)}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-700/60 text-zinc-300">
              {TYPE_LABELS[game.gameType]}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${LEVEL_COLORS[game.level]}`}>
              {LEVEL_LABELS[game.level]}
            </span>
            {game.needTeamSplit && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400">
                需要分队
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-zinc-300">
            <MessageCircle size={16} className="text-orange-400 shrink-0" />
            <span>{game.contact}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-orange-400" />
            <h2 className="text-white font-bold text-base">队友</h2>
            <span className="text-zinc-500 text-sm">{game.players.length}/{game.maxPlayers}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {gamePlayers.map((gp: GamePlayer & { player: Player }) => (
              <div key={gp.playerId} className="bg-zinc-800 rounded-xl p-3 flex flex-col items-center gap-1.5 relative">
                {gp.isMVP && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">
                    MVP
                  </span>
                )}
                <span className="text-3xl">{gp.player!.avatar}</span>
                <span className="text-white text-sm font-medium truncate w-full text-center">{gp.player!.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                  {POSITION_LABELS[gp.position]}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${LEVEL_COLORS[gp.level]}`}>
                  {LEVEL_LABELS[gp.level]}
                </span>
                {gp.bringBall && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                    带球
                  </span>
                )}
                {gp.isLate && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                    迟到
                  </span>
                )}
              </div>
            ))}
          </div>

          {isRecruitingOrConfirmed && (
            <div className="text-center text-sm">
              {isJoined ? (
                <span className="text-green-400">已报名</span>
              ) : (
                <span className="text-zinc-500">未报名</span>
              )}
            </div>
          )}
        </div>

        {game.status === 'completed' && game.score && (
          <div className="bg-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-white font-bold text-base">比赛结果</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-white text-3xl font-bold">{game.score.teamA}</span>
              <span className="text-zinc-500 font-bold">VS</span>
              <span className="text-white text-3xl font-bold">{game.score.teamB}</span>
            </div>
            {game.mvpId && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-400 text-sm font-medium">🏆 MVP:</span>
                <span className="text-white text-sm">
                  {getPlayerById(players, game.mvpId)?.name ?? '—'}
                </span>
              </div>
            )}
          </div>
        )}

        {isRecruitingOrConfirmed && !isJoined && (
          <button
            onClick={() => setSignupOpen(true)}
            className="w-full bg-orange-500 rounded-xl text-white font-bold h-12"
          >
            报名参加
          </button>
        )}

        {isRecruitingOrConfirmed && isJoined && (
          <button
            onClick={() => leaveGame(game.id)}
            className="w-full bg-zinc-700 rounded-xl text-zinc-300 font-bold h-12"
          >
            退出
          </button>
        )}

        {game.status === 'confirmed' && hasPassed && isCreator && !showPostGame && (
          <button
            onClick={() => setShowPostGame(true)}
            className="w-full bg-orange-500 rounded-xl text-white font-bold h-12"
          >
            记录战绩
          </button>
        )}

        {showPostGame && (
          <PostGameForm
            game={game}
            players={gamePlayers.map((gp: GamePlayer & { player: Player }) => gp.player)}
            onSubmit={handleComplete}
          />
        )}

        {(game.status === 'confirmed' || game.status === 'completed') && (
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400">报名进度</span>
              <span className="text-zinc-300">{game.players.length}/{game.maxPlayers}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${game.players.length >= game.maxPlayers ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min((game.players.length / game.maxPlayers) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <SignupSheet
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSignup={handleSignup}
      />
    </div>
  )
}
