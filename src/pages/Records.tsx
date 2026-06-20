import { useState, useMemo } from "react";
import { useDryingStore } from "@/store/dryingStore";
import DryingCard from "@/components/DryingCard";
import DryingForm from "@/components/DryingForm";
import { getStatusChipClass, getStatusText } from "@/utils/stats";
import { ListFilter, Plus, Search, Trash2 } from "lucide-react";
import type { DryingStatus } from "@/types";

type FilterType = "all" | DryingStatus;

const filters: Array<{ key: FilterType; label: string }> = [
  { key: "all", label: "全部" },
  { key: "drying", label: "晾晒中" },
  { key: "collected", label: "已收衣" },
  { key: "rewash", label: "需重洗" },
];

export default function Records() {
  const { records, deleteRecord, resetToMock } = useDryingStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    let list = [...records];
    if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.clothingType.toLowerCase().includes(s) ||
          r.location.toLowerCase().includes(s) ||
          r.owner.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [records, filter, search]);

  const counts = useMemo(() => {
    return {
      all: records.length,
      drying: records.filter((r) => r.status === "drying").length,
      collected: records.filter((r) => r.status === "collected").length,
      rewash: records.filter((r) => r.status === "rewash").length,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-sky-800">晾晒记录</h1>
            <p className="text-sm text-sky-500 mt-1">管理所有晾晒记录</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 inline mr-1" />
              新增晾晒
            </button>
            {!showConfirm ? (
              <button
                className="btn-secondary ml-2"
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                重置示例
              </button>
              ) : (
              <>
                <button
                  className="btn-warning ml-2"
                  onClick={() => {
                    resetToMock();
                    setShowConfirm(false);
                  }}
                >
                  确认重置
                </button>
                <button
                  className="btn-secondary ml-2"
                  onClick={() => setShowConfirm(false)}
                >
                  取消
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" />
            <input
              type="text"
              placeholder="搜索衣物类型、位置、负责人..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-sky-50/80 rounded-2xl p-1.5 rounded-xl overflow-x-auto">
            <ListFilter className="w-4 h-4 text-sky-500 flex-shrink-0 ml-2" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.key
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-sky-600 hover:bg-white/60"
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs opacity-60">({counts[f.key]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-sky-700 font-medium">没有找到匹配的记录</p>
          <p className="text-sm text-sky-500 mt-1">换个关键词或筛选条件试试</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div key={r.id} className="group relative">
              <DryingCard record={r} />
              {r.status !== "drying" && (
                <button
                  onClick={() => {
                    if (confirm(`确定删除「${r.clothingType} × ${r.quantity}」的记录？`)) {
                      deleteRecord(r.id);
                    }
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 border border-red-100 text-red-400 hover:bg-warn-red hover:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center justify-center"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 className="font-display text-lg text-sky-800 mb-4">统计概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filters.map((f) => (
            <div
              key={f.key}
              className={`rounded-2xl p-4 ${getStatusChipClass(f.key === "all" ? "drying" : f.key)}`}
              style={{ opacity: filter === f.key ? 1 : 0.8 }}
            >
              <div className="text-3xl font-display">{counts[f.key]}</div>
              <div className="text-xs mt-1 opacity-80">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <DryingForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
      )}
    </div>
  );
}
