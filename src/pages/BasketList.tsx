import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  X,
  Tag,
  MapPin,
  Scale,
  Box,
  Star,
  ImageOff,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  basketStatusLabel,
  basketStatusClass,
  sizeLabel,
  formatDate,
} from "@/utils/format";
import type { BasketStatus, BasketSize } from "@/types";
import { LOCATIONS } from "@/types";

export default function BasketList() {
  const { baskets, deleteBasket } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BasketStatus | "all">("all");
  const [sizeFilter, setSizeFilter] = useState<BasketSize | "all">("all");
  const [locFilter, setLocFilter] = useState<string>("all");
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const colors = useMemo(() => {
    const s = new Set(baskets.map((b) => b.color));
    return Array.from(s);
  }, [baskets]);

  const filtered = useMemo(() => {
    return baskets.filter((b) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !b.code.toLowerCase().includes(q) &&
          !b.color.toLowerCase().includes(q) &&
          !b.defaultLocation.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (sizeFilter !== "all" && b.size !== sizeFilter) return false;
      if (locFilter !== "all" && b.defaultLocation !== locFilter) return false;
      return true;
    });
  }, [baskets, search, statusFilter, sizeFilter, locFilter]);

  const hasFilter =
    search ||
    statusFilter !== "all" ||
    sizeFilter !== "all" ||
    locFilter !== "all";

  const statuses: BasketStatus[] = ["available", "lent", "repair", "scrapped"];
  const sizes: BasketSize[] = ["S", "M", "L", "XL"];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="card">
        <div className="p-4 border-b border-slate2-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索编号、颜色、存放点..."
                className="input-base pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate2-500">
                <Filter className="w-3.5 h-3.5" />
                筛选：
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-base w-auto py-1.5 text-xs"
              >
                <option value="all">全部状态</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {basketStatusLabel[s]}
                  </option>
                ))}
              </select>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value as any)}
                className="input-base w-auto py-1.5 text-xs"
              >
                <option value="all">全部尺寸</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {sizeLabel[s]}
                  </option>
                ))}
              </select>
              <select
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                className="input-base w-auto py-1.5 text-xs"
              >
                <option value="all">全部存放点</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {hasFilter && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setSizeFilter("all");
                    setLocFilter("all");
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-slate2-500 hover:bg-slate2-100"
                >
                  <X className="w-3 h-3" />
                  清除
                </button>
              )}
            </div>
            <Link to="/baskets/new" className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" />
              新增篮子
            </Link>
          </div>
        </div>

        <div className="px-4 py-3 bg-slate2-50 border-b border-slate2-200 text-xs text-slate2-500 flex items-center justify-between">
          <span>
            共 <b className="text-slate2-700 font-mono">{filtered.length}</b> /{" "}
            {baskets.length} 只篮子
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {colors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-slate2-200"
                  style={{
                    background:
                      baskets.find((b) => b.color === c)?.colorHex || "#ccc",
                  }}
                />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Box className="w-16 h-16 text-slate2-300 mx-auto mb-4" />
              <p className="text-slate2-500 mb-2">没有找到匹配的篮子</p>
              {hasFilter ? (
                <p className="text-xs text-slate2-400">请调整筛选条件或清除筛选</p>
              ) : (
                <Link to="/baskets/new" className="btn-primary mt-3 inline-flex">
                  <Plus className="w-4 h-4" />
                  录入第一只篮子
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="card card-hover group flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-slate2-100 overflow-hidden border-b border-slate2-100">
                    <img
                      src={b.photoUrl}
                      alt={b.code}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-grid-texture bg-grid-20 opacity-50 pointer-events-none" />
                    <div
                      className="absolute inset-0 flex items-center justify-center image-off-wrap"
                      style={{ display: "none" }}
                    >
                      <ImageOff className="w-12 h-12 text-slate2-300" />
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                      <span
                        className={`status-badge ${basketStatusClass[b.status]}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.status === "available"
                              ? "bg-forest-500"
                              : b.status === "lent"
                              ? "bg-steel-500"
                              : b.status === "repair"
                              ? "bg-amber-500"
                              : "bg-slate2-400"
                          }`}
                        />
                        {basketStatusLabel[b.status]}
                      </span>
                      {b.hasValuableTag && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 shadow-lg">
                          <Star className="w-3.5 h-3.5 text-steel-800 fill-steel-800" />
                        </span>
                      )}
                    </div>
                    <div
                      className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white shadow-md"
                      style={{ background: b.colorHex }}
                      title={b.color}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-slate2-800 tracking-tight">
                          {b.code}
                        </p>
                        <p className="text-xs text-slate2-400 mt-0.5">
                          入库 {formatDate(b.createdAt)}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-steel-50 text-steel-600 text-[10px] font-bold font-mono flex-shrink-0">
                        {b.size}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs mb-4 flex-1">
                      <div className="flex items-center gap-2 text-slate2-600">
                        <Tag className="w-3 h-3 text-slate2-400" />
                        <span className="truncate">{b.color}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate2-600">
                        <MapPin className="w-3 h-3 text-slate2-400" />
                        <span className="truncate">{b.defaultLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate2-600">
                        <Scale className="w-3 h-3 text-slate2-400" />
                        <span>承重 ≤ {b.maxLoadKg} kg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate2-100">
                      <Link
                        to={`/baskets/${b.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-steel-700 bg-steel-50 hover:bg-steel-100 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        编辑
                      </Link>
                      {delConfirm === b.id ? (
                        <>
                          <button
                            onClick={() => {
                              deleteBasket(b.id);
                              setDelConfirm(null);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-signal-500 hover:bg-signal-600"
                          >
                            确认删除
                          </button>
                          <button
                            onClick={() => setDelConfirm(null)}
                            className="px-2.5 py-1.5 rounded-md text-xs text-slate2-500 hover:bg-slate2-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDelConfirm(b.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-signal-600 bg-signal-50 hover:bg-signal-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
