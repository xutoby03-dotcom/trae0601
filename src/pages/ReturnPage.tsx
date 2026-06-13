import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, StatusBadge, SectionTitle } from "@/components/UI";
import { ComponentIcon } from "@/components/ComponentIcon";

export default function ReturnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useBoardGameStore();

  const lending = store.lendingRecords.find((l) => l.id === id);
  const game = lending
    ? store.games.find((g) => g.id === lending.gameId)
    : null;
  const gameComponents = game
    ? store.components.filter((c) => c.gameId === game.id)
    : [];

  const [returnedQuantities, setReturnedQuantities] = useState<
    Record<string, number>
  >(() => {
    const initial: Record<string, number> = {};
    gameComponents.forEach((c) => {
      initial[c.id] = c.quantity;
    });
    return initial;
  });

  if (!lending || !game) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-[#FAF3E0]/40">借出记录不存在</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-[#D4A84B] hover:underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  const isOverdue =
    lending.status !== "已归还" && new Date(lending.dueDate) < new Date();

  const handleQuantityChange = (componentId: string, value: number) => {
    const comp = gameComponents.find((c) => c.id === componentId);
    if (!comp) return;
    const clampedValue = Math.max(0, Math.min(value, comp.quantity));
    setReturnedQuantities((prev) => ({
      ...prev,
      [componentId]: clampedValue,
    }));
  };

  const missingItems = gameComponents.filter(
    (c) => (returnedQuantities[c.id] ?? 0) < c.quantity
  );

  const handleSubmit = () => {
    const checks = gameComponents.map((c) => ({
      componentId: c.id,
      returnedQuantity: returnedQuantities[c.id] ?? 0,
    }));

    store.returnLending(lending.id, checks);
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-[#FAF3E0]/50 transition-colors hover:bg-[#3E2723]/40 hover:text-[#FAF3E0]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
            归还检查
          </h1>
          <p className="text-sm text-[#FAF3E0]/40">{game.name}</p>
        </div>
      </div>

      <GameCard
        className={isOverdue ? "border-[#B5544A]/40" : "border-[#2E5D4B]/40"}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#FAF3E0]/60">借用人</p>
            <p className="font-medium">{lending.borrowerName}</p>
          </div>
          <div className="text-right">
            {isOverdue && (
              <StatusBadge variant="danger">
                逾期{" "}
                {Math.floor(
                  (Date.now() - new Date(lending.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                天
              </StatusBadge>
            )}
            <p className="mt-1 text-xs text-[#FAF3E0]/30">
              应还: {new Date(lending.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        {lending.deposit > 0 && (
          <div className="mt-2 rounded-lg border border-[#3E2723]/30 bg-[#1e150d]/50 px-3 py-2">
            <span className="text-xs text-[#FAF3E0]/40">押金: </span>
            <span className="text-sm font-medium text-[#D4A84B]">
              ¥{lending.deposit}
            </span>
          </div>
        )}
      </GameCard>

      <GameCard>
        <SectionTitle icon={<span>🔍</span>}>逐项检查配件</SectionTitle>
        <p className="mb-3 text-xs text-[#FAF3E0]/30">
          请对照借出时配件清单，逐项确认归还数量
        </p>
        <div className="space-y-3">
          {gameComponents.map((comp) => {
            const returned = returnedQuantities[comp.id] ?? 0;
            const isMissing = returned < comp.quantity;
            return (
              <div
                key={comp.id}
                className={`rounded-lg border p-3 transition-all ${
                  isMissing
                    ? "border-[#B5544A]/40 bg-[#B5544A]/5"
                    : "border-[#2E5D4B]/40 bg-[#2E5D4B]/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ComponentIcon type={comp.type} />
                    <span className="text-sm font-medium">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(comp.id, returned - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3E2723]/50 bg-[#1e150d] text-[#FAF3E0]/50 transition-colors hover:border-[#3E2723]"
                    >
                      -
                    </button>
                    <span
                      className={`w-8 text-center text-sm font-medium ${
                        isMissing ? "text-[#B5544A]" : "text-[#5aad7e]"
                      }`}
                    >
                      {returned}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(comp.id, returned + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3E2723]/50 bg-[#1e150d] text-[#FAF3E0]/50 transition-colors hover:border-[#3E2723]"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#FAF3E0]/30">/ {comp.quantity}</span>
                  </div>
                </div>
                {isMissing && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-[#B5544A]">
                    <AlertTriangle size={12} />
                    缺少 {comp.quantity - returned} 件
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GameCard>

      {missingItems.length > 0 && (
        <GameCard className="border-[#B5544A]/40 bg-gradient-to-br from-[#3a1a16] to-[#2a1210]">
          <SectionTitle icon={<AlertTriangle size={18} className="text-[#B5544A]" />}>
            缺件预警
          </SectionTitle>
          <p className="mb-3 text-xs text-[#FAF3E0]/30">
            以下配件未如数归还，归还后将自动生成补件记录
          </p>
          <div className="space-y-2">
            {missingItems.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between rounded-lg border border-[#B5544A]/20 bg-[#B5544A]/5 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <ComponentIcon type={comp.type} />
                  <span className="text-sm">{comp.name}</span>
                </div>
                <StatusBadge variant="danger">
                  缺 {comp.quantity - (returnedQuantities[comp.id] ?? 0)} 件
                </StatusBadge>
              </div>
            ))}
          </div>
        </GameCard>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border border-[#3E2723]/50 px-6 py-2.5 text-sm text-[#FAF3E0]/50 transition-colors hover:border-[#3E2723] hover:text-[#FAF3E0]"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#5aad7e] to-[#3d8a62] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#2E5D4B]/20 transition-all hover:shadow-xl hover:shadow-[#2E5D4B]/30 active:translate-y-0.5"
        >
          <Check size={16} />
          确认归还
        </button>
      </div>
    </div>
  );
}
