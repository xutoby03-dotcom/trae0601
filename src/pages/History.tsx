import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Flame, Trash2, Calendar, Users } from "lucide-react";
import { useHistoryStore } from "@/store";
import { SCORING_RULES } from "@/types";

export default function History() {
  const navigate = useNavigate();
  const histories = useHistoryStore((s) => s.histories);
  const deleteHistory = useHistoryStore((s) => s.deleteHistory);
  const getStats = useHistoryStore((s) => s.getStats);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#1a0f07] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A537' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 bg-[#2a1a0e] border border-[#5a3a1e] rounded-lg text-[#a08968] hover:border-[#D4A537] hover:text-[#D4A537] transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#D4A537]">历史战绩</h1>
                <p className="text-xs text-[#8a6e4a]">共 {histories.length} 局游戏</p>
              </div>
            </div>
          </div>

          {stats.length > 0 && (
            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={16} className="text-[#D4A537]" />
                  <span className="text-xs font-serif font-bold text-[#D4A537]">最多胜利</span>
                </div>
                {stats
                  .filter((s) => s.wins > 0)
                  .slice(0, 3)
                  .map((s, i) => (
                    <div key={s.playerName} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-[#e8d5b5]">
                        {i === 0 ? "👑" : i === 1 ? "🥈" : "🥉"} {s.playerName}
                      </span>
                      <span className="text-sm font-bold text-[#D4A537]">{s.wins}胜</span>
                    </div>
                  ))}
                {stats.filter((s) => s.wins > 0).length === 0 && (
                  <p className="text-[#5a3a1e] text-xs">暂无胜利记录</p>
                )}
              </div>

              <div className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-[#E74C3C]" />
                  <span className="text-xs font-serif font-bold text-[#E74C3C]">逆转王</span>
                </div>
                {stats
                  .filter((s) => s.comebacks > 0)
                  .sort((a, b) => b.comebacks - a.comebacks)
                  .slice(0, 3)
                  .map((s, i) => (
                    <div key={s.playerName} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-[#e8d5b5]">
                        {i === 0 ? "🔥" : i === 1 ? "💫" : "⚡"} {s.playerName}
                      </span>
                      <span className="text-sm font-bold text-[#E74C3C]">{s.comebacks}次</span>
                    </div>
                  ))}
                {stats.filter((s) => s.comebacks > 0).length === 0 && (
                  <p className="text-[#5a3a1e] text-xs">暂无逆转记录</p>
                )}
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {histories.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-[#8a6e4a] text-sm">还没有历史战绩</p>
                <p className="text-[#5a3a1e] text-xs mt-1">开始一局新游戏吧！</p>
              </motion.div>
            )}
            {histories.map((history, idx) => {
              const ruleLabel = SCORING_RULES.find((r) => r.value === history.scoringRule)?.label || "";
              const date = new Date(history.createdAt);
              const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

              return (
                <motion.div
                  key={history.id}
                  className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <button
                    onClick={() => deleteHistory(history.id)}
                    className="absolute top-3 right-3 text-[#3a2415] hover:text-[#8B2500] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-serif font-bold text-[#e8d5b5]">{history.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#3a2415] text-[#a08968] rounded">{ruleLabel}</span>
                        <span className="text-xs text-[#5a3a1e] flex items-center gap-1">
                          <Calendar size={10} /> {dateStr}
                        </span>
                        <span className="text-xs text-[#5a3a1e] flex items-center gap-1">
                          <Users size={10} /> {history.players.length}人
                        </span>
                      </div>
                    </div>
                    {history.winner && (
                      <div className="text-right">
                        <span className="text-lg">🏆</span>
                        <p className="text-xs text-[#D4A537] font-bold">{history.winner}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {history.players.map((player) => {
                      const total = history.rounds.reduce((sum, round) => {
                        const entry = round.scores.find((s) => s.playerId === player.id);
                        return sum + (entry ? entry.score + entry.bonusPoints : 0);
                      }, 0);
                      return (
                        <div
                          key={player.id}
                          className={`px-3 py-2 rounded-lg border ${
                            history.winner === player.name
                              ? "bg-[#D4A537]/10 border-[#D4A537]/30"
                              : "bg-[#1a0f07] border-[#3a2415]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{player.avatar}</span>
                            <span className="text-xs truncate" style={{ color: player.color }}>
                              {player.name}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#e8d5b5] mt-0.5">{total}分</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
