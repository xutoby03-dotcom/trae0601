import { useState, useMemo } from "react";
import {
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Shirt,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import ClothingCard from "@/components/ClothingCard";
import ConflictCard from "@/components/ConflictCard";
import { detectConflicts } from "@/utils/washUtils";
import type { Clothing } from "@/types";

export default function WasherPage() {
  const allClothes = useStore((s) => s.clothings);
  const washer = useStore((s) => s.currentWasher);
  const addToWasher = useStore((s) => s.addToWasher);
  const removeFromWasher = useStore((s) => s.removeFromWasher);
  const clearWasher = useStore((s) => s.clearWasher);
  const completeWash = useStore((s) => s.completeWash);
  const members = useStore((s) => s.members);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [justWashed, setJustWashed] = useState(false);
  const [filterText, setFilterText] = useState("all");

  const washerClothes: Clothing[] = useMemo(
    () =>
      washer.clothingIds
        .map((id) => allClothes.find((c) => c.id === id))
        .filter(Boolean) as Clothing[],
    [washer.clothingIds, allClothes]
  );

  const availableClothes = useMemo(() => {
    let list = allClothes.filter((c) => !washer.clothingIds.includes(c.id));
    if (filterText !== "all") {
      list = list.filter((c) => c.memberId === filterText);
    }
    return list;
  }, [allClothes, washer.clothingIds, filterText]);

  const conflicts = useMemo(
    () => detectConflicts(washerClothes),
    [washerClothes]
  );

  const conflictClothingIds = useMemo(() => {
    const set = new Set<string>();
    conflicts.forEach((c) => {
      set.add(c.clothingId1);
      set.add(c.clothingId2);
    });
    return set;
  }, [conflicts]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) addToWasher(id);
  };

  const handleComplete = () => {
    if (washerClothes.length === 0) return;
    if (conflicts.length > 0) {
      const ok = confirm(`当前存在${conflicts.length}项混洗风险，确定要开始洗吗？`);
      if (!ok) return;
    }
    completeWash(conflicts);
    setJustWashed(true);
    setTimeout(() => setJustWashed(false), 3000);
  };

  return (
    <div className="container py-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-neutral-800">
          🧼 新建洗衣桶
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          拖拽衣物到滚筒中，系统将实时检测混洗风险
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div
          className="animate-fade-in lg:col-span-4"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="sticky top-20">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-700">
                <Shirt className="mr-2 inline h-4 w-4 text-primary-500" />
                可选衣物（{availableClothes.length}）
              </h2>
              <select
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-primary-400 focus:outline-none"
              >
                <option value="all">全部成员</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto rounded-2xl bg-white/70 p-3 shadow-soft scrollbar-thin backdrop-blur">
              {availableClothes.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-400">
                  没有可选衣物
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableClothes.map((c) => (
                    <div
                      key={c.id}
                      className="transition-transform transition-opacity"
                    >
                      <ClothingCard
                        clothing={c}
                        compact
                        draggable
                        onDragStart={handleDragStart}
                        selectable
                        onClick={() => addToWasher(c.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="animate-fade-in lg:col-span-4"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="mb-3 font-semibold text-neutral-700">
            🧺 洗衣桶（{washerClothes.length} 件）
          </h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-4 shadow-elevated transition-all ${
              isDraggingOver ? "ring-4 ring-primary-300 scale-[1.01]" : ""
            }`}
          >
            <div className="drum-pattern absolute inset-0 opacity-40"></div>

            <div className="relative">
              {washerClothes.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-primary-100">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    <Shirt className="h-10 w-10 animate-bounce-slow" />
                  </div>
                  <p className="text-sm">拖拽左侧衣物到这里</p>
                  <p className="mt-1 text-xs text-primary-200/70">
                    或点击衣物快速添加
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {washerClothes.map((c, idx) => (
                    <div
                      key={c.id}
                      className="animate-bounce-soft"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <ClothingCard
                        clothing={c}
                        compact
                        showRemove
                        onRemove={removeFromWasher}
                        highlighted={conflictClothingIds.has(c.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={clearWasher}
              disabled={washerClothes.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600 shadow-soft transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              清空
            </button>
            <button
              onClick={handleComplete}
              disabled={washerClothes.length === 0}
              className={`flex flex-[2] items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-elevated transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                conflicts.length > 0
                  ? "bg-gradient-to-r from-accent-danger to-red-600"
                  : "bg-gradient-to-r from-primary-500 to-primary-600"
              }`}
            >
              <Play className="h-4 w-4" />
              {conflicts.length > 0
                ? `⚠️ 仍有${conflicts.length}项风险，强制开始`
                : "✓ 安全，开始洗衣"}
            </button>
          </div>
        </div>

        <div
          className="animate-fade-in lg:col-span-4"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="mb-3 font-semibold text-neutral-700">⚠️ 风险检测</h2>
          <div className="max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto rounded-2xl bg-white/70 p-4 shadow-soft backdrop-blur scrollbar-thin">
            {washerClothes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
                <AlertTriangle className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">添加衣物后开始检测</p>
              </div>
            ) : conflicts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-7 w-7 text-accent-success" />
                </div>
                <p className="font-medium text-accent-success">太棒了！</p>
                <p className="mt-1 text-xs text-neutral-500">
                  未检测到混洗风险，可以安心洗涤
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-50 to-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  检测到{" "}
                  <span className="text-accent-danger font-bold">
                    {conflicts.length}
                  </span>{" "}
                  项混洗风险
                </div>
                {conflicts.map((conflict) => {
                  const c1 = allClothes.find((c) => c.id === conflict.clothingId1);
                  const c2 = allClothes.find((c) => c.id === conflict.clothingId2);
                  return (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      clothing1={c1}
                      clothing2={c2}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {justWashed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-accent-success px-6 py-3 text-sm font-medium text-white shadow-elevated animate-fade-in">
          ✓ 已完成洗衣，记录已保存到历史
        </div>
      )}
    </div>
  );
}
