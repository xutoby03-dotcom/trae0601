import { Star, Pencil, Trash2, Sparkles, Phone } from "lucide-react";
import type { Player } from "@/types";
import { courageLabels, courageColors } from "@/data/mock";

interface Props {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

export default function PlayerCard({ player, onEdit, onDelete }: Props) {
  return (
    <div className="card card-hover group relative">
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(player)}
          className="p-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300"
          title="编辑"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(player)}
          className="p-1.5 rounded-lg bg-ink-800 hover:bg-glow-rose/30 text-glow-rose"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center text-3xl shrink-0">
          {player.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg text-white">
              {player.nickname}
            </h3>
            {player.isNewbie && (
              <span className="chip bg-glow-amber/20 text-glow-amber">
                <Sparkles className="w-3 h-3" /> 新手
              </span>
            )}
          </div>
          {player.contact && (
            <div className="flex items-center gap-1 text-sm text-ink-400 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {player.contact}
            </div>
          )}
          <div className={`chip mt-2 ${courageColors[player.courageLevel]}`}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  fill={i < player.courageLevel ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span>{courageLabels[player.courageLevel]}</span>
          </div>
        </div>
      </div>

      {player.tabooThemes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-ink-800">
          <div className="text-xs text-ink-400 mb-1.5">忌讳主题</div>
          <div className="flex flex-wrap gap-1.5">
            {player.tabooThemes.map((t) => (
              <span
                key={t}
                className="chip bg-glow-rose/15 text-glow-rose ring-1 ring-glow-rose/20"
              >
                ✗ {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {player.availableSlots.length > 0 && (
        <div className="mt-3 pt-3 border-t border-ink-800">
          <div className="text-xs text-ink-400 mb-1.5">常用空档</div>
          <div className="flex flex-wrap gap-1.5">
            {player.availableSlots.map((s) => (
              <span
                key={s}
                className="chip bg-glow-green/15 text-glow-green ring-1 ring-glow-green/20"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
