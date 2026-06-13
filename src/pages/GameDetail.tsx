import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Clock,
  Heart,
  Edit3,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, StatusBadge, SectionTitle, EmptyState } from "@/components/UI";
import { ComponentIcon } from "@/components/ComponentIcon";
import { formatDateTime } from "@/lib/utils";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useBoardGameStore();

  const game = store.games.find((g) => g.id === id);
  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-[#FAF3E0]/40">游戏不存在</p>
        <Link
          to="/games"
          className="text-sm text-[#D4A84B] hover:underline"
        >
          返回游戏列表
        </Link>
      </div>
    );
  }

  const components = store.components.filter((c) => c.gameId === game.id);
  const lendingRecords = store.lendingRecords.filter(
    (l) => l.gameId === game.id
  );
  const repairRecords = store.repairRecords.filter(
    (r) => r.gameId === game.id
  );
  const activeLending = lendingRecords.find((l) => l.status !== "已归还");

  const boxConditionMap: Record<string, "success" | "info" | "warning" | "danger" | "muted"> = {
    全新: "success",
    轻微使用: "info",
    正常使用: "warning",
    明显磨损: "danger",
    损坏: "danger",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/games")}
          className="rounded-lg p-2 text-[#FAF3E0]/50 transition-colors hover:bg-[#3E2723]/40 hover:text-[#FAF3E0]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
            {game.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.toggleWantToPlay(game.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
              game.wantToPlay
                ? "border-[#B5544A]/50 bg-[#B5544A]/15 text-[#B5544A]"
                : "border-[#3E2723]/50 text-[#FAF3E0]/30"
            }`}
          >
            <Heart size={14} className="inline" fill={game.wantToPlay ? "currentColor" : "none"} />
            {game.wantToPlay ? " 想玩" : " 标记想玩"}
          </button>
          {game.wantToPlay && game.wantToPlayAt && (
            <span className="text-[11px] text-[#FAF3E0]/30">
              {formatDateTime(game.wantToPlayAt)}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-[#3E2723]/50 bg-[#1e150d] shadow-lg">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">
              🎲
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant={boxConditionMap[game.boxCondition] ?? "muted"}>
              {game.boxCondition}
            </StatusBadge>
            {activeLending && (
              <StatusBadge variant="danger">借出中</StatusBadge>
            )}
            {repairRecords.filter((r) => r.status !== "已补齐").length > 0 && (
              <StatusBadge variant="warning">
                配件不全
              </StatusBadge>
            )}
          </div>
          <div className="flex gap-4 text-sm text-[#FAF3E0]/50">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {game.minPlayers}-{game.maxPlayers}人
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {game.duration}分钟
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/games/${game.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-1.5 text-xs text-[#FAF3E0]/50 transition-colors hover:border-[#D4A84B]/30 hover:text-[#D4A84B]"
            >
              <Edit3 size={12} />
              编辑
            </Link>
            <button
              onClick={() => {
                if (confirm("确定删除这款游戏？")) {
                  store.deleteGame(game.id);
                  navigate("/games");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-1.5 text-xs text-[#FAF3E0]/50 transition-colors hover:border-[#B5544A]/30 hover:text-[#B5544A]"
            >
              <Trash2 size={12} />
              删除
            </button>
          </div>
        </div>
      </div>

      <GameCard>
        <div className="flex items-center justify-between">
          <SectionTitle icon={<span>🧩</span>}>配件清单</SectionTitle>
          <span className="text-xs text-[#FAF3E0]/30">
            共 {components.length} 项
          </span>
        </div>
        {components.length === 0 ? (
          <EmptyState
            icon="📦"
            title="暂无配件"
            description="编辑游戏档案添加配件"
          />
        ) : (
          <div className="space-y-1.5">
            {components.map((comp) => {
              const repairs = repairRecords.filter(
                (r) =>
                  r.componentName === comp.name && r.status !== "已补齐"
              );
              return (
                <div
                  key={comp.id}
                  className="flex items-center justify-between rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <ComponentIcon type={comp.type} />
                    <span className="text-sm">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#FAF3E0]/40">
                      ×{comp.quantity}
                    </span>
                    {repairs.length > 0 && (
                      <StatusBadge variant="danger">
                        缺{repairs.reduce((s, r) => s + r.missingQuantity, 0)}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GameCard>

      <GameCard>
        <div className="flex items-center justify-between">
          <SectionTitle icon={<ArrowRightLeft size={18} className="text-[#5aad7e]" />}>
            借阅记录
          </SectionTitle>
          {!activeLending && (
            <Link
              to={`/lend?gameId=${game.id}`}
              className="flex items-center gap-1 rounded-lg border border-[#2E5D4B]/40 bg-[#152e22] px-3 py-1.5 text-xs text-[#5aad7e] transition-colors hover:border-[#2E5D4B]/60"
            >
              借出
            </Link>
          )}
        </div>
        {lendingRecords.length === 0 ? (
          <EmptyState
            icon="📋"
            title="暂无借阅记录"
            description="这款游戏还没有被借出过"
          />
        ) : (
          <div className="space-y-2">
            {[...lendingRecords].reverse().map((lending) => {
              const isOverdue =
                lending.status !== "已归还" &&
                new Date(lending.dueDate) < new Date();
              return (
                <div
                  key={lending.id}
                  className="flex items-center justify-between rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {lending.borrowerName}
                    </p>
                    <p className="text-xs text-[#FAF3E0]/30">
                      {new Date(lending.lentAt).toLocaleDateString()} →{" "}
                      {new Date(lending.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lending.status === "已归还" ? (
                      <StatusBadge variant="success">已归还</StatusBadge>
                    ) : isOverdue ? (
                      <Link
                        to={`/return/${lending.id}`}
                        className="flex items-center gap-1"
                      >
                        <StatusBadge variant="danger">逾期</StatusBadge>
                        <AlertTriangle
                          size={12}
                          className="animate-pulse text-[#B5544A]"
                        />
                      </Link>
                    ) : (
                      <Link to={`/return/${lending.id}`}>
                        <StatusBadge variant="info">借出中</StatusBadge>
                      </Link>
                    )}
                    {lending.deposit > 0 && (
                      <span className="text-xs text-[#D4A84B]/60">
                        ¥{lending.deposit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GameCard>

      {repairRecords.length > 0 && (
        <GameCard className="border-[#D4A84B]/30">
          <SectionTitle icon={<span>🔧</span>}>补件记录</SectionTitle>
          <div className="space-y-2">
            {repairRecords.map((repair) => (
              <div
                key={repair.id}
                className="flex items-center justify-between rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm">{repair.componentName}</p>
                  <p className="text-xs text-[#FAF3E0]/30">
                    缺 {repair.missingQuantity} 件
                  </p>
                </div>
                <StatusBadge
                  variant={
                    repair.status === "已补齐"
                      ? "success"
                      : repair.status === "已采购"
                      ? "info"
                      : "warning"
                  }
                >
                  {repair.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </GameCard>
      )}
    </div>
  );
}
