import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useBoardGameStore } from "@/store/useBoardGameStore";
import { GameCard, SectionTitle, EmptyState } from "@/components/UI";
import { ComponentIcon } from "@/components/ComponentIcon";

export default function LendPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedGameId = searchParams.get("gameId");
  const store = useBoardGameStore();

  const [gameId, setGameId] = useState(preselectedGameId ?? "");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerContact, setBorrowerContact] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deposit, setDeposit] = useState(0);
  const [confirmedComponents, setConfirmedComponents] = useState<
    Record<string, boolean>
  >({});

  const selectedGame = store.games.find((g) => g.id === gameId);
  const gameComponents = selectedGame
    ? store.components.filter((c) => c.gameId === selectedGame.id)
    : [];

  const availableGames = store.games.filter((g) => {
    const activeLending = store.lendingRecords.find(
      (l) => l.gameId === g.id && l.status !== "已归还"
    );
    return !activeLending;
  });

  const allConfirmed =
    gameComponents.length > 0 &&
    gameComponents.every((c) => confirmedComponents[c.id]);

  const handleToggleConfirm = (componentId: string) => {
    setConfirmedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !borrowerName.trim() || !dueDate || !allConfirmed) return;

    const checkData = gameComponents.map((c) => ({
      componentId: c.id,
      lendingRecordId: "",
      lentQuantity: c.quantity,
      returnedQuantity: 0,
    }));

    store.createLending(
      {
        gameId,
        borrowerName: borrowerName.trim(),
        borrowerContact: borrowerContact.trim(),
        dueDate,
        deposit,
      },
      checkData
    );

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
        <h1 className="font-serif text-2xl font-bold text-[#D4A84B]">
          借出登记
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GameCard>
          <SectionTitle icon={<span>🎲</span>}>选择游戏</SectionTitle>
          {availableGames.length === 0 ? (
            <EmptyState
              icon="📦"
              title="没有可借出的游戏"
              description="所有游戏都已借出或未创建档案"
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    setGameId(game.id);
                    setConfirmedComponents({});
                  }}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    gameId === game.id
                      ? "border-[#D4A84B]/50 bg-[#D4A84B]/10"
                      : "border-[#3E2723]/50 bg-[#1e150d] hover:border-[#3E2723]"
                  }`}
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-[#3E2723]/30">
                    {game.coverImage ? (
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">
                        🎲
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">
                      {game.name}
                    </p>
                    <p className="text-xs text-[#FAF3E0]/30">
                      {game.minPlayers}-{game.maxPlayers}人 · {game.duration}分钟
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </GameCard>

        {selectedGame && (
          <>
            <GameCard>
              <SectionTitle icon={<span>👤</span>}>借用人信息</SectionTitle>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                    借用人姓名 *
                  </label>
                  <input
                    type="text"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="谁借走了这款游戏？"
                    className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/20 focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                    联系方式
                  </label>
                  <input
                    type="text"
                    value={borrowerContact}
                    onChange={(e) => setBorrowerContact(e.target.value)}
                    placeholder="手机号或微信"
                    className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] placeholder:text-[#FAF3E0]/20 focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                      归还日期 *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-[#FAF3E0]/60">
                      押金 (元)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#3E2723]/50 bg-[#1e150d] px-3 py-2.5 text-sm text-[#FAF3E0] focus:border-[#D4A84B]/50 focus:outline-none focus:ring-1 focus:ring-[#D4A84B]/30"
                    />
                  </div>
                </div>
              </div>
            </GameCard>

            <GameCard className={allConfirmed ? "" : "border-[#D4A84B]/40"}>
              <SectionTitle icon={<span>✅</span>}>
                借出前配件确认
              </SectionTitle>
              <p className="mb-3 text-xs text-[#FAF3E0]/30">
                请逐项确认所有配件借出前状态完好
              </p>
              {gameComponents.length === 0 ? (
                <EmptyState
                  icon="🧩"
                  title="暂无配件清单"
                  description="请先在游戏档案中添加配件"
                />
              ) : (
                <div className="space-y-2">
                  {gameComponents.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => handleToggleConfirm(comp.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                        confirmedComponents[comp.id]
                          ? "border-[#2E5D4B]/50 bg-[#2E5D4B]/10"
                          : "border-[#3E2723]/50 bg-[#1e150d]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ComponentIcon type={comp.type} />
                        <span className="text-sm">{comp.name}</span>
                        <span className="text-xs text-[#FAF3E0]/30">
                          ×{comp.quantity}
                        </span>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                          confirmedComponents[comp.id]
                            ? "border-[#5aad7e] bg-[#5aad7e]"
                            : "border-[#3E2723]"
                        }`}
                      >
                        {confirmedComponents[comp.id] && (
                          <Check size={12} className="text-[#1a1209]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!allConfirmed && gameComponents.length > 0 && (
                <p className="mt-3 text-xs text-[#D4A84B]/60">
                  ⚠️ 请确认所有配件后才能提交
                </p>
              )}
            </GameCard>
          </>
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
            type="submit"
            disabled={
              !gameId ||
              !borrowerName.trim() ||
              !dueDate ||
              !allConfirmed ||
              gameComponents.length === 0
            }
            className="rounded-lg bg-gradient-to-r from-[#D4A84B] to-[#b8862d] px-6 py-2.5 text-sm font-medium text-[#1a1209] shadow-lg shadow-[#D4A84B]/20 transition-all hover:shadow-xl hover:shadow-[#D4A84B]/30 active:translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:shadow-none"
          >
            确认借出
          </button>
        </div>
      </form>
    </div>
  );
}
