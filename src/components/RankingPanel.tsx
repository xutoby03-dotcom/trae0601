import { motion } from "framer-motion";
import { Medal } from "lucide-react";
import type { Player } from "@/types";

interface RankingPanelProps {
  players: Player[];
  ranking: { playerId: string; rank: number; total: number; gap: number }[];
  prevRanking: Map<string, number>;
}

const MEDAL_COLORS = ["#D4A537", "#A8A8A8", "#CD7F32"];

export default function RankingPanel({ players, ranking, prevRanking }: RankingPanelProps) {
  return (
    <div className="bg-[#2a1a0e] border border-[#5a3a1e] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <h3 className="text-sm font-serif font-bold text-[#D4A537] mb-3 flex items-center gap-1.5">
        <Medal size={14} /> 实时排名
      </h3>
      <div className="space-y-2">
        {ranking.map((r) => {
          const player = players.find((p) => p.id === r.playerId);
          if (!player) return null;
          const prevRank = prevRanking.get(r.playerId) ?? r.rank;
          const rankChange = prevRank - r.rank;

          return (
            <motion.div
              key={r.playerId}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                r.rank === 1 ? "bg-[#D4A537]/10 border border-[#D4A537]/30" : "bg-[#1a0f07]/60"
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: r.rank <= 3 ? MEDAL_COLORS[r.rank - 1] + "33" : "#3a241566",
                  color: r.rank <= 3 ? MEDAL_COLORS[r.rank - 1] : "#8a6e4a",
                  border: r.rank <= 3 ? `1.5px solid ${MEDAL_COLORS[r.rank - 1]}` : "1.5px solid #3a2415",
                }}
              >
                {r.rank}
              </div>
              <span className="text-lg flex-shrink-0">{player.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[#e8d5b5] text-sm font-medium truncate" style={{ color: player.color }}>
                  {player.name}
                </div>
                <div className="text-[#8a6e4a] text-xs">
                  {r.total}分
                  {r.gap !== 0 && <span className="ml-1 text-[#8B2500]">({r.gap > 0 ? "+" : ""}{r.gap})</span>}
                </div>
              </div>
              {player.isEliminated && (
                <span className="text-xs text-[#8B2500] bg-[#8B2500]/20 px-1.5 py-0.5 rounded">淘汰</span>
              )}
              <motion.div
                key={`change-${r.playerId}-${rankChange}`}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: rankChange > 0 ? -10 : rankChange < 0 ? 10 : 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-xs font-bold flex-shrink-0"
              >
                {rankChange > 0 && <span className="text-[#2ECC71]">▲{rankChange}</span>}
                {rankChange < 0 && <span className="text-[#E74C3C]">▼{Math.abs(rankChange)}</span>}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
