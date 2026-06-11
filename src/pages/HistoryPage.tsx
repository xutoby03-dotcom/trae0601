import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "@/store/useStore";
import ClothingCard from "@/components/ClothingCard";
import ConflictCard from "@/components/ConflictCard";
import { formatDate } from "@/utils/washUtils";
import { Calendar, AlertTriangle, CheckCircle2, Trash2, Pin } from "lucide-react";
import type { Clothing } from "@/types";

export default function HistoryPage() {
  const history = useStore((s) => s.history);
  const allClothes = useStore((s) => s.clothings);
  const members = useStore((s) => s.members);
  const clearHistory = useStore((s) => s.clearHistory);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("id");
  const recordRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightId && recordRefs.current[highlightId]) {
      setTimeout(() => {
        recordRefs.current[highlightId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [highlightId, history]);

  if (history.length === 0) {
    return (
      <div className="container py-6">
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-neutral-800">
            📋 洗衣历史
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            回顾过去的洗衣记录，查看混洗风险
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/60 py-20 shadow-soft animate-fade-in">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <Calendar className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-neutral-700">
            还没有洗衣记录
          </h3>
          <p className="text-sm text-neutral-500">
            去「开始洗衣」页面完成第一桶吧
          </p>
        </div>
      </div>
    );
  }

  const clearHighlight = () => {
    if (highlightId) {
      searchParams.delete("id");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-end justify-between animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-800">
            📋 洗衣历史
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            共完成 {history.length} 桶洗衣
            {highlightId && (
              <button
                onClick={clearHighlight}
                className="ml-3 inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100"
              >
                <Pin className="h-3 w-3" />
                已定位到指定记录，取消高亮
              </button>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("确定清空所有历史记录？")) clearHistory();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-soft transition-all hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          清空历史
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-100" />

        <div className="space-y-6">
          {history.map((record, idx) => {
            const clothes: Clothing[] = record.clothingIds
              .map((id) => allClothes.find((c) => c.id === id))
              .filter(Boolean) as Clothing[];
            const hasConflict = record.conflicts.length > 0;
            const isHighlighted = highlightId === record.id;

            return (
              <div
                key={record.id}
                ref={(el) => {
                  recordRefs.current[record.id] = el;
                }}
                id={`history-${record.id}`}
                className={`relative pl-16 animate-fade-in ${
                  isHighlighted ? "z-10" : ""
                }`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div
                  className={`absolute left-2 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-card transition-all duration-500 ${
                    isHighlighted
                      ? "ring-4 ring-primary-300 ring-offset-4 scale-110"
                      : ""
                  } ${
                    hasConflict
                      ? "bg-accent-danger text-white"
                      : "bg-accent-success text-white"
                  }`}
                >
                  {hasConflict ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>

                <div
                  className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                    isHighlighted
                      ? "bg-white ring-4 ring-primary-400/60 shadow-elevated scale-[1.01]"
                      : "bg-white shadow-card"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-700">
                        第 {history.length - idx} 桶
                      </span>
                      <span className="text-xs text-neutral-400">
                        {formatDate(record.completedAt)}
                      </span>
                      {hasConflict && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {record.conflicts.length} 项风险
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {Object.entries(record.memberStats).map(([mid, cnt]) => {
                        const m = members.find((x) => x.id === mid);
                        return (
                          <span
                            key={mid}
                            className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                          >
                            {m?.avatar} {cnt}件
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                      {clothes.map((c) => (
                        <ClothingCard key={c.id} clothing={c} compact />
                      ))}
                    </div>

                    {hasConflict && (
                      <div className="mt-3 border-t border-dashed border-neutral-200 pt-3">
                        <p className="mb-2 text-xs font-medium text-neutral-500">
                          风险记录：
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {record.conflicts.map((conflict) => {
                            const c1 = allClothes.find(
                              (c) => c.id === conflict.clothingId1
                            );
                            const c2 = allClothes.find(
                              (c) => c.id === conflict.clothingId2
                            );
                            return (
                              <ConflictCard
                                key={conflict.id}
                                conflict={conflict}
                                clothing1={c1}
                                clothing2={c2}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
