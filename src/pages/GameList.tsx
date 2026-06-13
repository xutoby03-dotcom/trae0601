import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Clock, Heart } from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, StatusBadge, EmptyState } from "@/components/UI";

const boxConditionColors: Record<string, "success" | "info" | "warning" | "danger" | "muted"> = {
  全新: "success",
  轻微使用: "info",
  正常使用: "warning",
  明显磨损: "danger",
  损坏: "danger",
};

export default function GameList() {
  const store = useBoardGameStore();
  const [search, setSearch] = useState("");

  const filtered = store.games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
            游戏档案
          </h1>
          <p className="text-sm text-[#FAF3E0]/40">共 {store.games.length} 款游戏</p>
        </div>
        <Link
          to="/games/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#D4A84B] to-[#b8862d] px-4 py-2.5 text-sm font-medium text-[#1a1209] shadow-lg shadow-[#D4A84B]/20 transition-all hover:shadow-xl hover:shadow-[#D4A84B]/30 active:translate-y-0.5"
        >
          <Plus size={16} />
          新建档案
        </Link>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF3E0]/30"
        />
        <input
          type="text"
          placeholder="搜索游戏名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#3E2723]/50 bg-[#2a1f14] py-2.5 pl-10 pr-4 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/30 focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🎲"
          title={search ? "没有找到匹配的游戏" : "还没有游戏档案"}
          description={search ? "换个关键词试试" : "点击右上角创建第一个游戏档案"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => {
            const compCount = store.components.filter(
              (c) => c.gameId === game.id
            ).length;
            const repairs = store.repairRecords.filter(
              (r) => r.gameId === game.id && r.status !== "已补齐"
            );
            const activeLending = store.lendingRecords.find(
              (l) => l.gameId === game.id && l.status !== "已归还"
            );

            return (
              <Link key={game.id} to={`/games/${game.id}`}>
                <GameCard hover glow="gold" className="h-full cursor-pointer">
                  <div className="mb-3 flex gap-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#3E2723]/30">
                      {game.coverImage ? (
                        <img
                          src={game.coverImage}
                          alt={game.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          🎲
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-serif text-base font-bold text-[#FAF3E0]">
                        {game.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <StatusBadge
                          variant={boxConditionColors[game.boxCondition] ?? "muted"}
                        >
                          {game.boxCondition}
                        </StatusBadge>
                        {activeLending && (
                          <StatusBadge variant="danger">借出中</StatusBadge>
                        )}
                      </div>
                    </div>
                    {game.wantToPlay && (
                      <Heart
                        size={14}
                        className="flex-shrink-0 text-[#B5544A]"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#FAF3E0]/40">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {game.minPlayers}-{game.maxPlayers}人
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {game.duration}分钟
                    </span>
                    <span>配件 {compCount}项</span>
                    {repairs.length > 0 && (
                      <span className="text-[#B5544A]">
                        缺件 {repairs.length}
                      </span>
                    )}
                  </div>
                </GameCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
