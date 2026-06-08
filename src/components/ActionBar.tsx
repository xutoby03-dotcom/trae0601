import { motion } from "framer-motion";
import { Lock, Unlock, RotateCcw, RotateCw, Download, Flag, Home, ChevronLeft, ChevronRight, Skull, Heart } from "lucide-react";
import type { Game, Player } from "@/types";

interface ActionBarProps {
  game: Game;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onLockRound: () => void;
  onUnlockRound: () => void;
  onAdvanceRound: () => void;
  onPrevRound: () => void;
  onFinish: () => void;
  onExport: () => void;
  onHome: () => void;
  onEliminate: (playerId: string) => void;
  onRevive: (playerId: string) => void;
  viewRound: number;
}

export default function ActionBar({
  game,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLockRound,
  onUnlockRound,
  onAdvanceRound,
  onPrevRound,
  onFinish,
  onExport,
  onHome,
  onEliminate,
  onRevive,
  viewRound,
}: ActionBarProps) {
  const currentRound = game.rounds.find((r) => r.roundNumber === viewRound);
  const isCurrentLocked = currentRound?.isLocked ?? false;
  const isFinished = game.isFinished;

  const btnBase = "p-2.5 rounded-lg transition-all flex items-center justify-center";
  const btnActive = "bg-[#2a1a0e] border border-[#5a3a1e] text-[#a08968] hover:border-[#D4A537] hover:text-[#D4A537] hover:shadow-[0_0_10px_rgba(212,165,55,0.15)]";
  const btnDisabled = "bg-[#1a0f07] border border-[#2a1a0e] text-[#3a2415] cursor-not-allowed";

  return (
    <div className="bg-[#2a1a0e]/95 backdrop-blur-sm border-t border-[#5a3a1e] px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={onHome} className={`${btnBase} ${btnActive}`} title="返回首页">
            <Home size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevRound}
            disabled={viewRound <= 1}
            className={`${btnBase} ${viewRound > 1 ? btnActive : btnDisabled}`}
            title="上一回合"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[#D4A537] font-serif font-bold min-w-[80px] text-center text-sm">
            第 {viewRound}/{game.totalRounds} 回合
          </span>
          <button
            onClick={onAdvanceRound}
            disabled={viewRound >= game.totalRounds}
            className={`${btnBase} ${viewRound < game.totalRounds ? btnActive : btnDisabled}`}
            title="下一回合"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`${btnBase} ${canUndo ? btnActive : btnDisabled}`}
            title="撤销"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`${btnBase} ${canRedo ? btnActive : btnDisabled}`}
            title="重做"
          >
            <RotateCw size={16} />
          </button>

          {game.scoringRule === "elimination" && !isFinished && (
            <div className="flex items-center gap-1 ml-1">
              {game.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => (p.isEliminated ? onRevive(p.id) : onEliminate(p.id))}
                  className={`${btnBase} ${p.isEliminated ? "bg-[#8B2500]/20 border border-[#8B2500] text-[#E74C3C]" : btnActive}`}
                  title={p.isEliminated ? `复活 ${p.name}` : `淘汰 ${p.name}`}
                >
                  {p.isEliminated ? <Heart size={14} /> : <Skull size={14} />}
                  <span className="text-xs ml-0.5">{p.avatar}</span>
                </button>
              ))}
            </div>
          )}

          {!isFinished && (
            <button
              onClick={isCurrentLocked ? onUnlockRound : onLockRound}
              className={`${btnBase} ${isCurrentLocked ? "bg-[#1A3C34]/30 border border-[#1A3C34] text-[#2ECC71]" : btnActive}`}
              title={isCurrentLocked ? "解锁本回合" : "锁定本回合"}
            >
              {isCurrentLocked ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
          )}

          <button
            onClick={onExport}
            className={`${btnBase} ${btnActive}`}
            title="导出战绩图片"
          >
            <Download size={16} />
          </button>

          {!isFinished && (
            <button
              onClick={onFinish}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4A537] to-[#b8860b] rounded-lg text-[#1a0f07] font-serif font-bold text-sm hover:from-[#e0b545] hover:to-[#c9961a] transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(212,165,55,0.25)]"
            >
              <Flag size={14} /> 结束游戏
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
