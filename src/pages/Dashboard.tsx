import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Puzzle,
  Heart,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, StatusBadge, SectionTitle, EmptyState } from "@/components/UI";

export default function Dashboard() {
  const store = useBoardGameStore();
  const overdueLendings = store.getOverdueLendings();
  const incompleteGames = store.getIncompleteGames();
  const wantToPlayGames = store.games.filter((g) => g.wantToPlay);
  const topBorrowers = store.getTopBorrowers();
  const mostMissingGames = store.getMostMissingGames();
  const activeLendings = store.lendingRecords.filter(
    (l) => l.status !== "已归还"
  );

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="font-serif text-3xl font-bold text-[#D4A84B]">
          桌游借阅清单
        </h1>
        <p className="mt-1 text-sm text-[#FAF3E0]/40">
          管理你的桌游档案，追踪借还，守护每一件配件
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GameCard className="border-[#B5544A]/30 bg-gradient-to-br from-[#3a1a16] to-[#2a1210]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#FAF3E0]/40">逾期未还</p>
              <p className="mt-1 text-3xl font-bold text-[#B5544A]">
                {overdueLendings.length}
              </p>
            </div>
            <div
              className={
                overdueLendings.length > 0
                  ? "animate-pulse-slow rounded-full bg-[#B5544A]/20 p-2"
                  : "rounded-full bg-[#B5544A]/10 p-2"
              }
            >
              <AlertTriangle size={18} className="text-[#B5544A]" />
            </div>
          </div>
        </GameCard>

        <GameCard className="border-[#D4A84B]/30 bg-gradient-to-br from-[#332810] to-[#2a1f0d]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#FAF3E0]/40">配件不全</p>
              <p className="mt-1 text-3xl font-bold text-[#D4A84B]">
                {incompleteGames.length}
              </p>
            </div>
            <div className="rounded-full bg-[#D4A84B]/10 p-2">
              <Puzzle size={18} className="text-[#D4A84B]" />
            </div>
          </div>
        </GameCard>

        <GameCard className="border-[#2E5D4B]/40 bg-gradient-to-br from-[#152e22] to-[#0f1f17]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#FAF3E0]/40">借出中</p>
              <p className="mt-1 text-3xl font-bold text-[#5aad7e]">
                {activeLendings.length}
              </p>
            </div>
            <div className="rounded-full bg-[#2E5D4B]/20 p-2">
              <Clock size={18} className="text-[#5aad7e]" />
            </div>
          </div>
        </GameCard>

        <GameCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#FAF3E0]/40">游戏总数</p>
              <p className="mt-1 text-3xl font-bold text-[#FAF3E0]">
                {store.games.length}
              </p>
            </div>
            <div className="rounded-full bg-[#FAF3E0]/5 p-2">
              <Users size={18} className="text-[#FAF3E0]/50" />
            </div>
          </div>
        </GameCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <GameCard className={overdueLendings.length > 0 ? "border-[#B5544A]/40" : ""}>
            <SectionTitle icon={<AlertTriangle size={18} className="text-[#B5544A]" />}>
              逾期未还
            </SectionTitle>
            {overdueLendings.length === 0 ? (
              <EmptyState
                icon="✅"
                title="暂无逾期"
                description="所有借出都在按时归还"
              />
            ) : (
              <div className="space-y-2">
                {overdueLendings.map((lending) => {
                  const game = store.games.find(
                    (g) => g.id === lending.gameId
                  );
                  const daysOverdue = Math.floor(
                    (Date.now() - new Date(lending.dueDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={lending.id}
                      to={`/return/${lending.id}`}
                      className="flex items-center justify-between rounded-lg border border-[#B5544A]/20 bg-[#B5544A]/5 px-4 py-3 transition-colors hover:bg-[#B5544A]/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📦</span>
                        <div>
                          <p className="font-medium">{game?.name ?? "未知"}</p>
                          <p className="text-xs text-[#FAF3E0]/40">
                            借用人: {lending.borrowerName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="danger">
                          逾期 {daysOverdue} 天
                        </StatusBadge>
                        <ChevronRight size={14} className="text-[#FAF3E0]/30" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </GameCard>

          <GameCard
            className={
              incompleteGames.length > 0 ? "border-[#D4A84B]/40" : ""
            }
          >
            <SectionTitle icon={<Puzzle size={18} className="text-[#D4A84B]" />}>
              配件不全警告
            </SectionTitle>
            {incompleteGames.length === 0 ? (
              <EmptyState
                icon="🧩"
                title="配件齐全"
                description="所有游戏配件完好无损"
              />
            ) : (
              <div className="space-y-2">
                {incompleteGames.map(({ game, missingCount }) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.id}`}
                    className="flex items-center justify-between rounded-lg border border-[#D4A84B]/20 bg-[#D4A84B]/5 px-4 py-3 transition-colors hover:bg-[#D4A84B]/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🃏</span>
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-xs text-[#FAF3E0]/40">
                          盒况: {game.boxCondition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant="warning">
                        缺 {missingCount} 件
                      </StatusBadge>
                      <ChevronRight size={14} className="text-[#FAF3E0]/30" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GameCard>
        </div>

        <div className="space-y-6">
          <GameCard>
            <SectionTitle icon={<Heart size={18} className="text-[#B5544A]" />}>
              最近想玩
            </SectionTitle>
            {wantToPlayGames.length === 0 ? (
              <EmptyState
                icon="🎲"
                title="还没有想玩的游戏"
                description="在游戏档案中标记想玩"
              />
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {wantToPlayGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.id}`}
                    className="flex-shrink-0 rounded-lg border border-[#3E2723]/50 bg-[#1e150d] p-2 transition-all hover:border-[#D4A84B]/30 hover:shadow-md"
                  >
                    <div className="mb-2 h-24 w-24 overflow-hidden rounded-md bg-[#3E2723]/30">
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
                    <p className="w-24 truncate text-xs font-medium">
                      {game.name}
                    </p>
                    <p className="text-[10px] text-[#FAF3E0]/30">
                      {game.duration}分钟
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </GameCard>

          <GameCard>
            <SectionTitle icon={<TrendingUp size={18} className="text-[#5aad7e]" />}>
              借阅统计
            </SectionTitle>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-[#FAF3E0]/40">谁借得最多</p>
                {topBorrowers.length === 0 ? (
                  <p className="text-xs text-[#FAF3E0]/20">暂无数据</p>
                ) : (
                  <div className="space-y-1.5">
                    {topBorrowers.map((b, i) => (
                      <div
                        key={b.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              i === 0
                                ? "bg-[#D4A84B] text-[#1a1209]"
                                : "bg-[#3E2723] text-[#FAF3E0]/60"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm">{b.name}</span>
                        </div>
                        <span className="text-xs text-[#D4A84B]">
                          {b.count}次
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#3E2723]/40 pt-3">
                <p className="mb-2 text-xs text-[#FAF3E0]/40">
                  最容易少件的游戏
                </p>
                {mostMissingGames.length === 0 ? (
                  <p className="text-xs text-[#FAF3E0]/20">暂无数据</p>
                ) : (
                  <div className="space-y-1.5">
                    {mostMissingGames.map(({ game, missingCount }, i) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="flex items-center justify-between rounded px-1 py-0.5 transition-colors hover:bg-[#3E2723]/30"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              i === 0
                                ? "bg-[#B5544A] text-[#FAF3E0]"
                                : "bg-[#3E2723] text-[#FAF3E0]/60"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm">{game.name}</span>
                        </div>
                        <span className="text-xs text-[#B5544A]">
                          缺{missingCount}件
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
}
