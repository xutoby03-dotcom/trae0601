import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Trophy, AlertTriangle, TrendingUp, Star, Clock, Users, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useScriptStore } from '@/store/useScriptStore';
import { useSessionStore } from '@/store/useSessionStore';
import StarRating from '@/components/StarRating';
import Modal from '@/components/Modal';
import { calculateScriptRanking, calculatePlayerFit, calculateTriggerStats } from '@/utils/statistics';
import type { Rating, GameSession } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'sessions' | 'rankings' | 'stats';

export default function Stats() {
  const { players, loadPlayers } = usePlayerStore();
  const { scripts, loadScripts } = useScriptStore();
  const { sessions, ratings, addRating, getSession, loadData } = useSessionStore();

  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [characterScore, setCharacterScore] = useState(3);
  const [scriptScore, setScriptScore] = useState(3);
  const [comment, setComment] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
    loadScripts();
    loadData();
  }, [loadPlayers, loadScripts, loadData]);

  const scriptRanking = useMemo(() =>
    calculateScriptRanking(ratings, scripts, sessions),
    [ratings, scripts, sessions]
  );

  const playerFits = useMemo(() =>
    calculatePlayerFit(players, ratings, scripts, sessions),
    [players, ratings, scripts, sessions]
  );

  const triggerStats = useMemo(() => {
    const allCharacters = scripts.flatMap(s => s.characters);
    return calculateTriggerStats(ratings, players, allCharacters, sessions);
  }, [ratings, players, scripts, sessions]);

  const visibleSessions = useMemo(() =>
    sessions.filter(s => s.status === 'finished')
      .sort((a, b) => b.createdAt - a.createdAt),
    [sessions]
  );

  const getScriptTitle = (scriptId: string) => {
    return scripts.find(s => s.id === scriptId)?.title || '未知剧本';
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || '未知玩家';
  };

  const getPlayerAvatar = (playerId: string) => {
    return players.find(p => p.id === playerId)?.avatar || '👤';
  };

  const getCharacterName = (session: GameSession, playerId: string) => {
    const assignment = session.assignments.find(a => a.playerId === playerId);
    if (!assignment) return '';
    const script = scripts.find(s => s.id === session.scriptId);
    return script?.characters.find(c => c.id === assignment.characterId)?.name || '';
  };

  const getRatingsForSession = (sessionId: string) => {
    return ratings.filter(r => r.sessionId === sessionId);
  };

  const hasRated = (sessionId: string, playerId: string) => {
    return ratings.some(r => r.sessionId === sessionId && r.playerId === playerId);
  };

  const openRatingModal = (session: GameSession) => {
    setSelectedSession(session);
    const unratedPlayers = session.playerIds.filter(pid => !hasRated(session.id, pid));
    if (unratedPlayers.length > 0) {
      setCurrentPlayerIndex(session.playerIds.indexOf(unratedPlayers[0]));
    } else {
      setCurrentPlayerIndex(0);
    }
    setCharacterScore(3);
    setScriptScore(3);
    setComment('');
    setRatingModalOpen(true);
  };

  const handleSaveRating = () => {
    if (!selectedSession) return;

    const playerId = selectedSession.playerIds[currentPlayerIndex];
    const assignment = selectedSession.assignments.find(a => a.playerId === playerId);

    if (assignment) {
      addRating({
        sessionId: selectedSession.id,
        playerId,
        characterId: assignment.characterId,
        characterScore,
        scriptScore,
        comment
      });
    }

    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex < selectedSession.playerIds.length) {
      setCurrentPlayerIndex(nextIndex);
      setCharacterScore(3);
      setScriptScore(3);
      setComment('');
    } else {
      setRatingModalOpen(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">评分统计</h1>
        <p className="text-slate-400 text-sm">记录体验，发现最适合你的角色</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        {[
          { key: 'sessions', label: '历史局次', icon: Clock },
          { key: 'rankings', label: '排行榜', icon: Trophy },
          { key: 'stats', label: '数据分析', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {visibleSessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <Clock className="text-slate-600" size={32} />
              </div>
              <p className="text-slate-400 mb-2">还没有已结束的局次</p>
              <p className="text-sm text-slate-500">完成一局剧本杀后，来这里评分和查看统计吧</p>
            </div>
          ) : (
            visibleSessions.map(session => {
              const sessionRatings = getRatingsForSession(session.id);
              const isExpanded = expandedSession === session.id;
              const allRated = session.playerIds.every(pid => hasRated(session.id, pid));

              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors"
                    onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-2xl">
                        {scripts.find(s => s.id === session.scriptId)?.cover || '📖'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{getScriptTitle(session.scriptId)}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {session.playerIds.length}人
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(session.createdAt)}
                          </span>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs',
                            allRated
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          )}>
                            {allRated ? '已全部评分' : `${sessionRatings.length}/${session.playerIds.length} 已评分`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!allRated && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openRatingModal(session); }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                        >
                          去评分
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-700/50 p-4 space-y-3">
                      {session.playerIds.map(playerId => {
                        const playerRating = sessionRatings.find(r => r.playerId === playerId);
                        const characterName = getCharacterName(session, playerId);

                        return (
                          <div
                            key={playerId}
                            className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50"
                          >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">
                              {getPlayerAvatar(playerId)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{getPlayerName(playerId)}</span>
                                <span className="text-slate-500 text-sm">→</span>
                                <span className="text-purple-300 text-sm">{characterName}</span>
                              </div>
                              {playerRating ? (
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-slate-400">角色 {playerRating.characterScore}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-slate-400">剧本 {playerRating.scriptScore}</span>
                                  </div>
                                  {playerRating.comment && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <MessageSquare size={12} />
                                      <span className="truncate max-w-[200px]">{playerRating.comment}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 mt-1">未评分</p>
                              )}
                            </div>
                            {!playerRating && (
                              <button
                                onClick={() => openRatingModal(session)}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                评分
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-amber-400" size={20} />
              <h3 className="font-semibold text-white">剧本评分榜</h3>
            </div>
            <div className="space-y-3">
              {scriptRanking.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">暂无评分数据</p>
              ) : (
                scriptRanking.map((script, index) => (
                  <div
                    key={script.scriptId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      index === 0 && 'bg-amber-500/20 text-amber-400',
                      index === 1 && 'bg-slate-400/20 text-slate-300',
                      index === 2 && 'bg-orange-500/20 text-orange-400',
                      index > 2 && 'bg-slate-700/50 text-slate-500'
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{script.title}</p>
                      <p className="text-xs text-slate-500">{script.ratingCount} 人评价</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-white font-semibold">{script.avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-400" size={20} />
              <h3 className="font-semibold text-white">玩家角色适配度</h3>
            </div>
            <div className="space-y-3">
              {playerFits.filter(p => p.totalGames > 0).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">暂无评分数据</p>
              ) : (
                playerFits
                  .filter(p => p.totalGames > 0)
                  .map((player, index) => (
                    <div
                      key={player.playerId}
                      className="p-3 rounded-xl bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                          index === 0 && 'bg-emerald-500/20 text-emerald-400',
                          index > 0 && 'bg-slate-700/50 text-slate-500'
                        )}>
                          {index + 1}
                        </div>
                        <span className="text-white font-medium flex-1">{player.playerName}</span>
                        <div className="flex items-center gap-1">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          <span className="text-white text-sm font-semibold">{player.avgCharacterScore.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-slate-500">{player.totalGames}局</span>
                      </div>
                      {player.bestGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 ml-10">
                          {player.bestGenres.slice(0, 3).map(genre => (
                            <span
                              key={genre.genre}
                              className="px-2 py-0.5 text-xs rounded-md bg-purple-500/15 text-purple-300"
                            >
                              {genre.genre} {genre.avgScore.toFixed(1)}分
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-red-400" size={20} />
              <h3 className="font-semibold text-white">雷点踩中频率</h3>
            </div>
            {triggerStats.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {triggerStats.slice(0, 10).map((stat, index) => {
                  const maxCount = Math.max(...triggerStats.map(s => s.hitCount));
                  const percentage = (stat.hitCount / maxCount) * 100;
                  return (
                    <div key={stat.trigger}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{stat.trigger}</span>
                        <span className="text-xs text-slate-500">{stat.hitCount} 次</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500/70 to-amber-500/70 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-3">已结束局次</h3>
              <p className="text-3xl font-bold text-purple-300">{visibleSessions.length}</p>
              <p className="text-xs text-slate-500 mt-1">累计完成的剧本杀局次</p>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-3">总评分数</h3>
              <p className="text-3xl font-bold text-amber-300">{ratings.length}</p>
              <p className="text-xs text-slate-500 mt-1">累计提交的评分数量</p>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-3">剧本库</h3>
              <p className="text-3xl font-bold text-emerald-300">{scripts.length}</p>
              <p className="text-xs text-slate-500 mt-1">已录入的剧本数量</p>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-5">
              <h3 className="font-semibold text-white mb-3">玩家档案</h3>
              <p className="text-3xl font-bold text-cyan-300">{players.length}</p>
              <p className="text-xs text-slate-500 mt-1">已注册的玩家数量</p>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title="游戏评分"
      >
        {selectedSession && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
              <p className="text-sm text-slate-400 mb-1">当前评分</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">
                  {getPlayerAvatar(selectedSession.playerIds[currentPlayerIndex])}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {getPlayerName(selectedSession.playerIds[currentPlayerIndex])}
                  </p>
                  <p className="text-xs text-slate-500">
                    角色: {getCharacterName(selectedSession, selectedSession.playerIds[currentPlayerIndex])}
                  </p>
                </div>
                <span className="ml-auto text-xs text-slate-500">
                  {currentPlayerIndex + 1} / {selectedSession.playerIds.length}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">角色体验评分</label>
              <div className="flex items-center gap-4">
                <StarRating
                  value={characterScore}
                  onChange={setCharacterScore}
                  size="lg"
                />
                <span className="text-2xl font-bold text-amber-400">{characterScore}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">剧本整体评分</label>
              <div className="flex items-center gap-4">
                <StarRating
                  value={scriptScore}
                  onChange={setScriptScore}
                  size="lg"
                />
                <span className="text-2xl font-bold text-amber-400">{scriptScore}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">评语（选填）</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="说说你的感受..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800/60 text-slate-300 font-medium hover:bg-slate-700/60 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveRating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
              >
                {currentPlayerIndex < selectedSession.playerIds.length - 1 ? '保存并下一个' : '完成评分'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
