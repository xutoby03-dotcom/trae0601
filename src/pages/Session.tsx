import { useState, useEffect, useMemo } from 'react';
import { Shuffle, Play, ChevronRight, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useScriptStore } from '@/store/useScriptStore';
import { useSessionStore } from '@/store/useSessionStore';
import ScriptCard from '@/components/ScriptCard';
import PlayerCard from '@/components/PlayerCard';
import CharacterCard from '@/components/CharacterCard';
import ConflictAlert from '@/components/ConflictAlert';
import { getAllConflicts, detectConflicts } from '@/utils/conflictDetector';
import type { Script, Assignment, Conflict } from '@/types';
import { cn } from '@/lib/utils';

type Step = 'select-script' | 'select-players' | 'assign-characters' | 'confirm';

export default function Session() {
  const { players, loadPlayers } = usePlayerStore();
  const { scripts, loadScripts } = useScriptStore();
  const { createSession, updateAssignments, updateSessionStatus, currentSession, setCurrentSession, loadData } = useSessionStore();

  const [step, setStep] = useState<Step>('select-script');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
    loadScripts();
    loadData();
  }, [loadPlayers, loadScripts, loadData]);

  const selectedPlayers = useMemo(() =>
    players.filter(p => selectedPlayerIds.includes(p.id)),
    [players, selectedPlayerIds]
  );

  const allConflicts = useMemo<Conflict[]>(() => {
    if (!selectedScript) return [];
    return getAllConflicts(selectedPlayers, selectedScript.characters, assignments);
  }, [selectedScript, selectedPlayers, assignments]);

  const characterConflictsMap = useMemo(() => {
    const map: Record<string, Conflict[]> = {};
    allConflicts.forEach(conflict => {
      if (!map[conflict.characterId]) {
        map[conflict.characterId] = [];
      }
      map[conflict.characterId].push(conflict);
    });
    return map;
  }, [allConflicts]);

  const getAssignmentForCharacter = (charId: string) => {
    return assignments.find(a => a.characterId === charId);
  };

  const getAssignmentForPlayer = (playerId: string) => {
    return assignments.find(a => a.playerId === playerId);
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setSelectedPlayerIds([]);
    setAssignments([]);
    setStep('select-players');
  };

  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
      setAssignments(assignments.filter(a => a.playerId !== playerId));
    } else {
      if (selectedScript && selectedPlayerIds.length >= selectedScript.playerCount) {
        return;
      }
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleCharacterClick = (charId: string) => {
    setSelectedCharId(charId === selectedCharId ? null : charId);
  };

  const assignPlayerToCharacter = (playerId: string) => {
    if (!selectedCharId) return;

    const existingAssignment = assignments.find(a => a.characterId === selectedCharId);
    const playerExistingAssignment = assignments.find(a => a.playerId === playerId);

    let newAssignments = assignments.filter(a =>
      a.characterId !== selectedCharId && a.playerId !== playerId
    );

    if (!existingAssignment || existingAssignment.playerId !== playerId) {
      newAssignments.push({
        playerId,
        characterId: selectedCharId
      });
    }

    if (playerExistingAssignment && playerExistingAssignment.characterId !== selectedCharId) {
      // 玩家之前分配的角色现在空了，不需要处理
    }

    setAssignments(newAssignments);
    setSelectedCharId(null);
  };

  const randomAssign = () => {
    if (!selectedScript) return;

    const shuffledPlayers = [...selectedPlayerIds].sort(() => Math.random() - 0.5);
    const shuffledChars = [...selectedScript.characters].sort(() => Math.random() - 0.5);

    const newAssignments: Assignment[] = [];
    const count = Math.min(shuffledPlayers.length, shuffledChars.length);

    for (let i = 0; i < count; i++) {
      newAssignments.push({
        playerId: shuffledPlayers[i],
        characterId: shuffledChars[i].id
      });
    }

    setAssignments(newAssignments);
  };

  const canProceed = () => {
    if (!selectedScript) return false;
    if (selectedPlayerIds.length !== selectedScript.playerCount) return false;
    if (assignments.length !== selectedScript.playerCount) return false;
    return true;
  };

  const startGame = () => {
    if (!selectedScript || !canProceed()) return;

    const session = createSession(selectedScript.id, selectedPlayerIds);
    updateAssignments(session.id, assignments);
    updateSessionStatus(session.id, 'playing');
    setCurrentSession(session);
    setStep('confirm');
  };

  const finishGame = () => {
    if (!currentSession) return;
    updateSessionStatus(currentSession.id, 'finished');
    setCurrentSession(null);
    resetAll();
  };

  const resetAll = () => {
    setStep('select-script');
    setSelectedScript(null);
    setSelectedPlayerIds([]);
    setAssignments([]);
    setSelectedCharId(null);
  };

  const dangerCount = allConflicts.filter(c => c.severity === 'danger').length;
  const warningCount = allConflicts.filter(c => c.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">组局分配</h1>
          <p className="text-slate-400 text-sm">智能匹配角色，避免踩雷</p>
        </div>
        {step !== 'select-script' && (
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 transition-colors"
          >
            <RotateCcw size={16} />
            重新开始
          </button>
        )}
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {[
            { key: 'select-script', label: '选择剧本' },
            { key: 'select-players', label: '选择玩家' },
            { key: 'assign-characters', label: '分配角色' },
            { key: 'confirm', label: '确认开局' }
          ].map((s, index) => {
            const isActive = step === s.key;
            const isPast = (
              (step === 'select-players' && s.key === 'select-script') ||
              (step === 'assign-characters' && ['select-script', 'select-players'].includes(s.key)) ||
              (step === 'confirm' && ['select-script', 'select-players', 'assign-characters'].includes(s.key))
            );
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isActive && 'bg-purple-500 text-white scale-110',
                    isPast && 'bg-purple-500/30 text-purple-300',
                    !isActive && !isPast && 'bg-slate-800 text-slate-500'
                  )}>
                    {isPast ? <Check size={14} /> : index + 1}
                  </div>
                  <span className={cn(
                    'text-sm font-medium hidden sm:block',
                    isActive ? 'text-white' : isPast ? 'text-purple-300' : 'text-slate-500'
                  )}>
                    {s.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={cn(
                    'w-8 sm:w-16 h-0.5 mx-2 rounded',
                    isPast ? 'bg-purple-500/50' : 'bg-slate-700'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 'select-script' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">选择剧本</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scripts.map(script => (
              <ScriptCard
                key={script.id}
                script={script}
                onClick={() => handleSelectScript(script)}
              />
            ))}
          </div>
          {scripts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400">请先在剧本管理中添加剧本</p>
            </div>
          )}
        </div>
      )}

      {step === 'select-players' && selectedScript && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">选择玩家</h2>
            <span className="text-sm text-slate-400">
              已选 <span className={cn(
                'font-medium',
                selectedPlayerIds.length === selectedScript.playerCount ? 'text-emerald-400' : 'text-amber-400'
              )}>{selectedPlayerIds.length}</span> / {selectedScript.playerCount} 人
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                selected={selectedPlayerIds.includes(player.id)}
                onClick={() => togglePlayer(player.id)}
              />
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep('assign-characters')}
              disabled={selectedPlayerIds.length !== selectedScript.playerCount}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 'assign-characters' && selectedScript && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">分配角色</h2>
              <button
                onClick={randomAssign}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Shuffle size={16} />
                随机分配
              </button>
            </div>

            {allConflicts.length > 0 && (
              <ConflictAlert conflicts={allConflicts} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedScript.characters.map(char => {
                const assignment = getAssignmentForCharacter(char.id);
                const assignedPlayer = assignment
                  ? players.find(p => p.id === assignment.playerId)
                  : null;
                const charConflicts = characterConflictsMap[char.id] || [];

                return (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    conflicts={charConflicts}
                    assignedPlayerName={assignedPlayer?.name}
                    assignedPlayerAvatar={assignedPlayer?.avatar}
                    selected={selectedCharId === char.id}
                    onClick={() => handleCharacterClick(char.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-white mb-3">
                {selectedCharId ? '选择玩家分配' : '点击角色后选择玩家'}
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {selectedPlayers.map(player => {
                  const existingAssignment = getAssignmentForPlayer(player.id);
                  const isAssigned = !!existingAssignment;
                  const hasConflict = selectedCharId && (() => {
                    const char = selectedScript.characters.find(c => c.id === selectedCharId);
                    if (!char) return false;
                    const conflicts = detectConflicts(player, char);
                    return conflicts.some(c => c.severity === 'danger');
                  })();

                  return (
                    <button
                      key={player.id}
                      onClick={() => selectedCharId && assignPlayerToCharacter(player.id)}
                      disabled={!selectedCharId}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                        selectedCharId
                          ? hasConflict
                            ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                          : 'bg-slate-800/30 border border-slate-700/30 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                        {player.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{player.name}</p>
                        <p className="text-xs text-slate-500">
                          {isAssigned ? '已分配其他角色' : '待分配'}
                        </p>
                      </div>
                      {hasConflict && (
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-white mb-3">分配进度</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>已分配</span>
                    <span>{assignments.length} / {selectedScript.playerCount}</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${(assignments.length / selectedScript.playerCount) * 100}%` }}
                    />
                  </div>
                </div>

                {dangerCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle size={14} />
                    <span>{dangerCount} 个严重冲突</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle size={14} />
                    <span>{warningCount} 个提醒</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={!canProceed()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
            >
              <Play size={18} />
              确认开局
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && selectedScript && (
        <div className="max-w-lg mx-auto text-center space-y-6 py-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
            <Check size={40} className="text-emerald-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">局次已创建！</h2>
            <p className="text-slate-400">剧本《{selectedScript.title}》</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-left">
            <h3 className="text-sm font-medium text-slate-400 mb-4">角色分配结果</h3>
            <div className="space-y-3">
              {assignments.map(assignment => {
                const player = players.find(p => p.id === assignment.playerId);
                const character = selectedScript.characters.find(c => c.id === assignment.characterId);
                const conflicts = characterConflictsMap[assignment.characterId] || [];
                const hasDanger = conflicts.some(c => c.severity === 'danger');

                return (
                  <div key={assignment.characterId} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      {player?.avatar || '👤'}
                    </div>
                    <span className="text-white font-medium">{player?.name}</span>
                    <span className="text-slate-500">→</span>
                    <span className={cn(
                      'font-medium',
                      hasDanger ? 'text-red-400' : 'text-purple-300'
                    )}>
                      {character?.name}
                    </span>
                    {hasDanger && (
                      <AlertCircle size={14} className="text-red-400 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {allConflicts.length > 0 && (
            <div className="text-left">
              <p className="text-sm text-amber-400 mb-2">
                温馨提示：仍有 {dangerCount} 个严重冲突，{warningCount} 个提醒
              </p>
              <p className="text-xs text-slate-500">
                可以返回调整分配，或者继续开局
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('assign-characters')}
              className="flex-1 py-3 rounded-xl bg-slate-800/60 text-slate-300 font-medium hover:bg-slate-700/60 transition-colors"
            >
              返回调整
            </button>
            <button
              onClick={finishGame}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              结束局次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
