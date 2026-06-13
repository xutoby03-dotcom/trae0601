import { Link } from "react-router-dom";
import { Wrench, Package } from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, StatusBadge, SectionTitle, EmptyState } from "@/components/UI";
import type { RepairStatus } from "@/types";

const repairStatusActions: Record<
  RepairStatus,
  { next: RepairStatus; label: string }
> = {
  待采购: { next: "已采购", label: "标记已采购" },
  已采购: { next: "已补齐", label: "标记已补齐" },
  已补齐: { next: "已补齐", label: "已完成" },
};

export default function RepairList() {
  const store = useBoardGameStore();

  const pendingRepairs = store.repairRecords.filter(
    (r) => r.status !== "已补齐"
  );
  const completedRepairs = store.repairRecords.filter(
    (r) => r.status === "已补齐"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
          补件记录
        </h1>
        <p className="text-sm text-[#FAF3E0]/40">
          追踪所有缺失配件的补件状态
        </p>
      </div>

      {store.repairRecords.length === 0 ? (
        <EmptyState
          icon="🔧"
          title="暂无补件记录"
          description="配件齐全时不会产生补件记录"
        />
      ) : (
        <>
          {pendingRepairs.length > 0 && (
            <GameCard className="border-[#D4A84B]/30">
              <SectionTitle
                icon={<Wrench size={18} className="text-[#D4A84B]" />}
              >
                待处理 ({pendingRepairs.length})
              </SectionTitle>
              <div className="space-y-3">
                {pendingRepairs.map((repair) => {
                  const game = store.games.find(
                    (g) => g.id === repair.gameId
                  );
                  const lending = store.lendingRecords.find(
                    (l) => l.id === repair.lendingRecordId
                  );
                  const action = repairStatusActions[repair.status];

                  return (
                    <div
                      key={repair.id}
                      className="rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/games/${repair.gameId}`}
                              className="text-sm font-medium text-[#D4A84B] hover:underline"
                            >
                              {game?.name ?? "未知游戏"}
                            </Link>
                            <StatusBadge
                              variant={
                                repair.status === "待采购"
                                  ? "warning"
                                  : "info"
                              }
                            >
                              {repair.status}
                            </StatusBadge>
                          </div>
                          <p className="text-sm">
                            {repair.componentName}
                            <span className="ml-2 text-xs text-[#FAF3E0]/30">
                              缺 {repair.missingQuantity} 件
                            </span>
                          </p>
                          {lending && (
                            <p className="text-xs text-[#FAF3E0]/30">
                              借用人: {lending.borrowerName} ·{" "}
                              {new Date(repair.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {repair.status !== "已补齐" && (
                          <button
                            onClick={() =>
                              store.updateRepairStatus(
                                repair.id,
                                action.next
                              )
                            }
                            className="flex-shrink-0 rounded-lg border border-[#2E5D4B]/40 bg-[#152e22] px-3 py-1.5 text-xs text-[#5aad7e] transition-colors hover:border-[#2E5D4B]/60"
                          >
                            {action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GameCard>
          )}

          {completedRepairs.length > 0 && (
            <GameCard>
              <SectionTitle
                icon={
                  <Package size={18} className="text-[#5aad7e]" />
                }
              >
                已完成 ({completedRepairs.length})
              </SectionTitle>
              <div className="space-y-2">
                {completedRepairs.map((repair) => {
                  const game = store.games.find(
                    (g) => g.id === repair.gameId
                  );
                  const lending = store.lendingRecords.find(
                    (l) => l.id === repair.lendingRecordId
                  );
                  return (
                    <div
                      key={repair.id}
                      className="flex items-center justify-between rounded-lg border border-[#3E2723]/20 bg-[#1e150d]/30 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-[#FAF3E0]/50">
                          <Link
                            to={`/games/${repair.gameId}`}
                            className="text-[#FAF3E0]/70 hover:text-[#D4A84B]"
                          >
                            {game?.name ?? "未知游戏"}
                          </Link>
                          {" · "}
                          {repair.componentName}
                          <span className="text-[#FAF3E0]/30">
                            {" "}
                            (缺{repair.missingQuantity}件)
                          </span>
                        </p>
                        {lending && (
                          <p className="text-xs text-[#FAF3E0]/20">
                            借用人: {lending.borrowerName}
                          </p>
                        )}
                      </div>
                      <StatusBadge variant="success">已补齐</StatusBadge>
                    </div>
                  );
                })}
              </div>
            </GameCard>
          )}
        </>
      )}
    </div>
  );
}
