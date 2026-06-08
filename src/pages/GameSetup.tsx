import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Users, Trophy, ArrowRight, History } from "lucide-react";
import { useGameStore } from "@/store";
import { SCORING_RULES, AVATARS, PLAYER_COLORS } from "@/types";
import type { Player, ScoringRule, Avatar } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function GameSetup() {
  const navigate = useNavigate();
  const createGame = useGameStore((s) => s.createGame);

  const [gameName, setGameName] = useState("");
  const [scoringRule, setScoringRule] = useState<ScoringRule>("highest_wins");
  const [teamMode, setTeamMode] = useState(false);
  const [totalRounds, setTotalRounds] = useState(5);
  const [players, setPlayers] = useState<Player[]>([
    { id: generateId(), name: "玩家1", color: PLAYER_COLORS[0], avatar: AVATARS[0], teamId: "", isEliminated: false },
    { id: generateId(), name: "玩家2", color: PLAYER_COLORS[1], avatar: AVATARS[1], teamId: "", isEliminated: false },
  ]);
  const [eliminationThreshold, setEliminationThreshold] = useState(100);
  const [bonusPointsAmount, setBonusPointsAmount] = useState(3);
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null);

  const addPlayer = () => {
    const idx = players.length;
    setPlayers([
      ...players,
      {
        id: generateId(),
        name: `玩家${idx + 1}`,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        avatar: AVATARS[idx % AVATARS.length],
        teamId: "",
        isEliminated: false,
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleStart = () => {
    if (!gameName.trim()) return;
    createGame(gameName, scoringRule, teamMode, totalRounds, players, eliminationThreshold, bonusPointsAmount);
    const gameId = useGameStore.getState().game?.id;
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-[#1a0f07] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A537' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-[#D4A537] mb-2" style={{ textShadow: "0 2px 8px rgba(212,165,55,0.3)" }}>
              🎲 桌游计分裁判台
            </h1>
            <p className="text-[#a08968] text-sm">创建一局新游戏，开始你的聚会之旅</p>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-serif font-bold text-[#D4A537] mb-4 flex items-center gap-2">
                <Trophy size={18} /> 游戏信息
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[#a08968] text-xs mb-1 block">游戏名称</label>
                  <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="如：卡坦岛、UNO、狼人杀..."
                    className="w-full bg-[#1a0f07] border border-[#5a3a1e] rounded-lg px-4 py-3 text-[#e8d5b5] placeholder-[#5a3a1e] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#a08968] text-xs mb-1 block">回合数</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={totalRounds}
                      onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#1a0f07] border border-[#5a3a1e] rounded-lg px-4 py-3 text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#a08968] text-xs mb-1 block">计分规则</label>
                    <select
                      value={scoringRule}
                      onChange={(e) => setScoringRule(e.target.value as ScoringRule)}
                      className="w-full bg-[#1a0f07] border border-[#5a3a1e] rounded-lg px-4 py-3 text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors appearance-none"
                    >
                      {SCORING_RULES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {scoringRule === "elimination" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-[#a08968] text-xs mb-1 block">淘汰阈值</label>
                    <input
                      type="number"
                      min={1}
                      value={eliminationThreshold}
                      onChange={(e) => setEliminationThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#1a0f07] border border-[#5a3a1e] rounded-lg px-4 py-3 text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors"
                    />
                  </motion.div>
                )}
                {scoringRule === "bonus_per_round" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-[#a08968] text-xs mb-1 block">每回合奖励分数</label>
                    <input
                      type="number"
                      min={1}
                      value={bonusPointsAmount}
                      onChange={(e) => setBonusPointsAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#1a0f07] border border-[#5a3a1e] rounded-lg px-4 py-3 text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors"
                    />
                  </motion.div>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setTeamMode(!teamMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${teamMode ? "bg-[#D4A537]" : "bg-[#5a3a1e]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${teamMode ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-[#a08968] text-sm flex items-center gap-1.5">
                    <Users size={14} /> 队伍模式
                  </span>
                </div>
                {scoringRule && (
                  <p className="text-xs text-[#8a6e4a] bg-[#1a0f07] rounded-lg px-3 py-2">
                    {SCORING_RULES.find((r) => r.value === scoringRule)?.desc}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-serif font-bold text-[#D4A537] mb-4 flex items-center gap-2">
                <Users size={18} /> 玩家管理
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {players.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 bg-[#1a0f07] rounded-lg p-3 border border-[#3a2415]"
                    >
                      <div className="relative">
                        <button
                          onClick={() => setShowAvatarPicker(showAvatarPicker === player.id ? null : player.id)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-transform hover:scale-110"
                          style={{ borderColor: player.color, backgroundColor: player.color + "22" }}
                        >
                          {player.avatar}
                        </button>
                        <AnimatePresence>
                          {showAvatarPicker === player.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -8 }}
                              className="absolute top-12 left-0 bg-[#2a1a0e] border border-[#5a3a1e] rounded-lg p-2 grid grid-cols-6 gap-1 z-50 shadow-xl"
                            >
                              {AVATARS.map((av) => (
                                <button
                                  key={av}
                                  onClick={() => {
                                    updatePlayer(player.id, { avatar: av as Avatar });
                                    setShowAvatarPicker(null);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#3a2415] transition-colors text-base"
                                >
                                  {av}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                        className="flex-1 bg-transparent border-b border-[#3a2415] px-2 py-1 text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] transition-colors"
                      />

                      <div className="flex gap-1 flex-shrink-0">
                        {PLAYER_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updatePlayer(player.id, { color })}
                            className={`w-5 h-5 rounded-full transition-transform ${player.color === color ? "scale-125 ring-2 ring-white ring-offset-1 ring-offset-[#1a0f07]" : "hover:scale-110"}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {players.length > 2 && (
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-[#8B2500] hover:text-[#E74C3C] transition-colors ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  onClick={addPlayer}
                  disabled={players.length >= 8}
                  className="w-full py-3 border-2 border-dashed border-[#3a2415] rounded-lg text-[#8a6e4a] hover:border-[#D4A537] hover:text-[#D4A537] transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> 添加玩家
                </button>
              </div>
            </motion.div>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => navigate("/history")}
                className="flex-1 py-4 bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl text-[#a08968] font-serif font-bold flex items-center justify-center gap-2 hover:border-[#D4A537] hover:text-[#D4A537] transition-all"
              >
                <History size={18} /> 历史战绩
              </button>
              <button
                onClick={handleStart}
                disabled={!gameName.trim()}
                className="flex-[2] py-4 bg-gradient-to-r from-[#D4A537] to-[#b8860b] rounded-xl text-[#1a0f07] font-serif font-bold flex items-center justify-center gap-2 hover:from-[#e0b545] hover:to-[#c9961a] transition-all shadow-[0_4px_15px_rgba(212,165,55,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                开始游戏 <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
