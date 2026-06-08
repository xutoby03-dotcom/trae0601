import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useHistoryStore } from "@/store";
import RankingPanel from "@/components/RankingPanel";
import ActionBar from "@/components/ActionBar";
import { SCORING_RULES } from "@/types";
import { Lock } from "lucide-react";

export default function ScoreTable() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const undoStack = useGameStore((s) => s.undoStack);
  const redoStack = useGameStore((s) => s.redoStack);
  const setScore = useGameStore((s) => s.setScore);
  const lockRound = useGameStore((s) => s.lockRound);
  const unlockRound = useGameStore((s) => s.unlockRound);
  const advanceRound = useGameStore((s) => s.advanceRound);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const revivePlayer = useGameStore((s) => s.revivePlayer);
  const finishGame = useGameStore((s) => s.finishGame);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const resetGame = useGameStore((s) => s.resetGame);
  const getPlayerTotal = useGameStore((s) => s.getPlayerTotal);
  const getPlayerRanking = useGameStore((s) => s.getPlayerRanking);
  const addHistory = useHistoryStore((s) => s.addHistory);

  const [viewRound, setViewRound] = useState(1);
  const [prevRanking, setPrevRanking] = useState<Map<string, number>>(new Map());
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const ranking = getPlayerRanking();
  const currentPrevRanking = prevRanking;

  const handleSetScore = useCallback(
    (roundNumber: number, playerId: string, score: number) => {
      const oldRanking = getPlayerRanking();
      const oldMap = new Map(oldRanking.map((r) => [r.playerId, r.rank]));
      setPrevRanking(oldMap);
      setScore(roundNumber, playerId, score);
    },
    [setScore, getPlayerRanking]
  );

  const handleFinish = () => {
    if (!game) return;
    finishGame();
    addHistory(game);
    setShowFinishConfirm(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = document.getElementById("score-table-export");
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: "#1a0f07",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${game?.name || "game"}-score.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    }
    setExporting(false);
  };

  if (!game || game.id !== id) {
    return (
      <div className="min-h-screen bg-[#1a0f07] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8a6e4a] text-lg mb-4">游戏不存在</p>
          <button onClick={() => navigate("/")} className="px-6 py-2 bg-[#D4A537] rounded-lg text-[#1a0f07] font-bold">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const currentRoundData = game.rounds.find((r) => r.roundNumber === viewRound);
  const isCurrentLocked = currentRoundData?.isLocked ?? false;

  return (
    <div className="min-h-screen bg-[#1a0f07] flex flex-col">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A537' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif font-bold text-[#D4A537]">{game.name}</h1>
              <p className="text-xs text-[#8a6e4a]">
                {SCORING_RULES.find((r) => r.value === game.scoringRule)?.label}
                {game.scoringRule === "bonus_per_round" && game.bonusPointsAmount > 0 && (
                  <span className="text-[#2ECC71] ml-1">· 每回合领先者+{game.bonusPointsAmount}分</span>
                )}
                {game.isFinished && <span className="text-[#2ECC71] ml-2">已结束</span>}
              </p>
            </div>
            {game.isFinished && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-3xl"
              >
                🏆
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 pb-4 overflow-hidden">
          <div className="max-w-5xl mx-auto flex gap-4 h-full">
            <div className="hidden lg:block w-56 flex-shrink-0">
              <RankingPanel players={game.players} ranking={ranking} prevRanking={currentPrevRanking} />
            </div>

            <div className="flex-1 overflow-auto" id="score-table-export">
              <div className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#3a2415]">
                      <th className="px-4 py-3 text-left text-xs font-serif font-bold text-[#D4A537] border-r border-[#5a3a1e] w-20">
                        回合
                      </th>
                      {game.players.map((player) => (
                        <th
                          key={player.id}
                          className="px-3 py-3 text-center border-r border-[#5a3a1e] last:border-r-0 min-w-[120px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg">{player.avatar}</span>
                            <span className="text-xs font-bold truncate max-w-[80px]" style={{ color: player.color }}>
                              {player.name}
                            </span>
                            {player.isEliminated && (
                              <span className="text-[8px] text-[#8B2500] bg-[#8B2500]/20 px-1 rounded">淘汰</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {game.rounds.map((round) => {
                      const isViewing = round.roundNumber === viewRound;
                      const isLocked = round.isLocked;
                      const isEliminationRound = game.scoringRule === "elimination";

                      return (
                        <motion.tr
                          key={round.roundNumber}
                          layout
                          className={`border-t border-[#3a2415] ${
                            isViewing ? "bg-[#D4A537]/5" : isLocked ? "bg-[#1a0f07]/40" : "hover:bg-[#3a2415]/30"
                          } transition-colors`}
                          onClick={() => setViewRound(round.roundNumber)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="px-4 py-2 border-r border-[#5a3a1e]">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-serif font-bold ${isViewing ? "text-[#D4A537]" : "text-[#8a6e4a]"}`}>
                                R{round.roundNumber}
                              </span>
                              {isLocked && <Lock size={10} className="text-[#2ECC71]" />}
                            </div>
                          </td>
                          {round.scores.map((entry) => {
                            const player = game.players.find((p) => p.id === entry.playerId);
                            const isEliminated = player?.isEliminated && isEliminationRound;
                            return (
                              <td
                                key={entry.playerId}
                                className="px-2 py-2 text-center border-r border-[#3a2415] last:border-r-0"
                              >
                                {isEliminated ? (
                                  <span className="text-[#8B2500] text-xs">💀</span>
                                ) : isLocked || game.isFinished ? (
                                  <motion.span
                                    key={entry.score}
                                    initial={{ scale: 1.3, color: "#D4A537" }}
                                    animate={{ scale: 1, color: "#e8d5b5" }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm font-bold"
                                  >
                                    {entry.score}
                                    {entry.bonusPoints > 0 && (
                                      <span className="text-[#2ECC71] text-xs ml-0.5">+{entry.bonusPoints}</span>
                                    )}
                                  </motion.span>
                                ) : (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <input
                                      type="number"
                                      value={entry.score || ""}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) handleSetScore(round.roundNumber, entry.playerId, val);
                                      }}
                                      onFocus={() => setViewRound(round.roundNumber)}
                                      className="w-16 text-center bg-[#1a0f07] border border-[#3a2415] rounded px-2 py-1.5 text-sm text-[#e8d5b5] focus:outline-none focus:border-[#D4A537] focus:ring-1 focus:ring-[#D4A537] transition-colors"
                                      placeholder="0"
                                    />
                                    {game.scoringRule === "bonus_per_round" && game.bonusPointsAmount > 0 && entry.score > 0 && (
                                      <span className="text-[8px] text-[#5a3a1e]">
                                        锁定后领先者+{game.bonusPointsAmount}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    <tr className="border-t-2 border-[#D4A537] bg-[#3a2415]/50">
                      <td className="px-4 py-3 border-r border-[#5a3a1e]">
                        <span className="text-xs font-serif font-bold text-[#D4A537]">总分</span>
                      </td>
                      {game.players.map((player) => {
                        const total = getPlayerTotal(player.id);
                        const playerRank = ranking.find((r) => r.playerId === player.id);
                        return (
                          <td key={player.id} className="px-3 py-3 text-center border-r border-[#3a2415] last:border-r-0">
                            <motion.div
                              key={total}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                              <div className="text-lg font-bold" style={{ color: playerRank?.rank === 1 ? "#D4A537" : player.color }}>
                                {total}
                              </div>
                              {playerRank && playerRank.rank > 1 && (
                                <div className="text-[8px] text-[#8a6e4a]">
                                  差{Math.abs(playerRank.gap)}分
                                </div>
                              )}
                            </motion.div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <ActionBar
          game={game}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={undo}
          onRedo={redo}
          onLockRound={() => lockRound(viewRound)}
          onUnlockRound={() => unlockRound(viewRound)}
          onAdvanceRound={() => setViewRound(Math.min(viewRound + 1, game.totalRounds))}
          onPrevRound={() => setViewRound(Math.max(viewRound - 1, 1))}
          onFinish={() => setShowFinishConfirm(true)}
          onExport={handleExport}
          onHome={() => { resetGame(); navigate("/"); }}
          onEliminate={eliminatePlayer}
          onRevive={revivePlayer}
          viewRound={viewRound}
        />
      </div>

      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-serif font-bold text-[#D4A537] mb-2">结束游戏？</h3>
              <p className="text-[#a08968] text-sm mb-5">游戏结束后将保存至历史战绩，无法再修改分数。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="flex-1 py-2.5 bg-[#1a0f07] border border-[#5a3a1e] rounded-lg text-[#a08968] hover:border-[#D4A537] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4A537] to-[#b8860b] rounded-lg text-[#1a0f07] font-bold"
                >
                  确认结束
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {exporting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl px-6 py-4 text-[#D4A537] font-serif">
            正在生成图片...
          </div>
        </div>
      )}
    </div>
  );
}
