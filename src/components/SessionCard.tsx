import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Users,
  Skull,
  ArrowRight,
  Gauge,
  Coins,
  Trash2,
  Pencil,
} from "lucide-react";
import type { GameSession } from "@/types";
import { useSessionStore } from "@/store/sessionStore";
import { getRelativeDate } from "@/utils";

interface Props {
  session: GameSession;
  onDelete?: (session: GameSession) => void;
  onEdit?: (session: GameSession) => void;
}

const statusMap: Record<
  GameSession["status"],
  { label: string; className: string }
> = {
  pending: { label: "待成团", className: "bg-glow-amber/20 text-glow-amber" },
  confirmed: { label: "已成团", className: "bg-glow-green/20 text-glow-green" },
  completed: { label: "已完成", className: "bg-ink-600/40 text-ink-200" },
  cancelled: { label: "已取消", className: "bg-ink-700/50 text-ink-400" },
};

export default function SessionCard({ session, onDelete, onEdit }: Props) {
  const getCapacityInfo = useSessionStore((s) => s.getCapacityInfo);
  const capacity = getCapacityInfo(session.id);

  const percent = Math.min(
    100,
    (capacity.currentCount / session.maxPlayers) * 100
  );

  const progressColor = capacity.overflow
    ? "bg-glow-rose"
    : capacity.enough
    ? "bg-glow-green"
    : "bg-glow-amber";

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-xl text-white truncate">
              {session.theme}
            </h3>
            {session.isHorror && (
              <span className="chip bg-glow-rose/25 text-glow-rose shrink-0">
                <Skull className="w-3 h-3" />
                恐怖
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-ink-400">
            <MapPin className="w-3.5 h-3.5" />
            {session.storeName}
            <span className="mx-1 text-ink-600">·</span>
            <span className={`chip ${statusMap[session.status].className}`}>
              {statusMap[session.status].label}
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className="p-2 rounded-lg hover:bg-ink-800 text-ink-400 hover:text-white transition-all"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(session)}
              className="p-2 rounded-lg hover:bg-glow-rose/20 text-ink-400 hover:text-glow-rose transition-all"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-3 text-sm">
        <div className="flex items-center gap-1.5 text-ink-300">
          <Clock className="w-4 h-4 text-ink-500" />
          {getRelativeDate(session.scheduledAt)}
          <span className="text-ink-500">·</span>
          {session.durationMinutes}分钟
        </div>
        <div className="flex items-center gap-1.5 text-ink-300">
          <Coins className="w-4 h-4 text-ink-500" />
          ¥{session.price}/人
        </div>
        <div className="flex items-center gap-1.5 text-ink-300">
          <Gauge className="w-4 h-4 text-ink-500" />
          难度 {session.difficulty} 级
        </div>
        <div className="flex items-center gap-1.5 text-ink-300">
          <span className="chip bg-ink-800 text-ink-300">{session.type}</span>
        </div>
      </div>

      {session.notes && (
        <div className="text-sm text-ink-400 mb-3 italic">
          💬 {session.notes}
        </div>
      )}

      <div className="space-y-2 pt-3 border-t border-ink-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-ink-200">
            <Users className="w-4 h-4 text-ink-400" />
            <span>
              已报 {capacity.currentCount}
              <span className="text-ink-500"> / </span>
              {session.minPlayers}-{session.maxPlayers}
            </span>
          </div>
          <div>
            {capacity.overflow > 0 ? (
              <span className="text-glow-rose font-medium text-sm">
                超员 +{capacity.overflow}
              </span>
            ) : !capacity.enough ? (
              <span className="text-glow-amber font-medium text-sm">
                还差 {capacity.gap} 人
              </span>
            ) : (
              <span className="text-glow-green font-medium text-sm">
                ✓ 人够了
              </span>
            )}
          </div>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${progressColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link
        to={`/sessions/${session.id}`}
        className="btn-ghost w-full mt-4 justify-center"
      >
        查看详情
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
