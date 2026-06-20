import { Search, X, Filter } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import {
  COLOR_FAMILIES,
  COLOR_FAMILY_MAP,
  CLAY_TYPES,
  KILN_POSITIONS,
  type ColorFamily,
  type Atmosphere,
} from "@/types";
import { TEST_SAMPLES } from "@/data/mockData";

const TEMP_PRESETS: Array<{ label: string; range: [number, number] }> = [
  { label: "低温 <1200℃", range: [1000, 1200] },
  { label: "中温 1200-1280℃", range: [1200, 1280] },
  { label: "高温 1280-1320℃", range: [1280, 1320] },
];

type QuickTag = {
  key: string;
  value: string;
  type?: "atmosphere";
};

const QUICK_TAGS: QuickTag[] = [
  { key: "适合茶杯", value: "茶杯" },
  { key: "适合茶盏", value: "茶盏" },
  { key: "适合花瓶", value: "花瓶" },
  { key: "还原气氛", value: "还原", type: "atmosphere" },
  { key: "氧化气氛", value: "氧化", type: "atmosphere" },
];

export default function FilterBar() {
  const { filters, setFilters, resetFilters } = useAppStore();

  const hasActiveFilter =
    filters.colorFamily !== "全部" ||
    filters.temperatureRange !== null ||
    filters.clayType !== "全部" ||
    filters.atmosphere !== "全部" ||
    filters.kilnPosition !== "全部" ||
    filters.glazeName !== "全部" ||
    filters.searchKeyword !== "";

  return (
    <div className="w-full bg-clay-100/70 backdrop-blur-sm border-b border-clay-300/50 sticky top-0 z-30 grain-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glaze-celadon to-glaze-amber shadow-tile flex items-center justify-center">
              <span className="text-clay-50 font-serif text-lg font-bold">釉</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-clay-800 tracking-wide">
                釉色试片墙
              </h1>
              <p className="text-xs text-clay-500">Glaze Test Tile Archive</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clay-500"
              strokeWidth={2}
            />
            <input
              type="text"
              value={filters.searchKeyword}
              onChange={(e) => setFilters({ searchKeyword: e.target.value })}
              placeholder="搜索试片名称、釉料、编号..."
              className="w-full h-10 pl-10 pr-8 rounded-xl border border-clay-300 bg-clay-50/80 text-clay-800 text-sm placeholder:text-clay-400 focus:outline-none focus:border-glaze-celadon focus:ring-2 focus:ring-glaze-celadon/20 transition"
            />
            {filters.searchKeyword && (
              <button
                onClick={() => setFilters({ searchKeyword: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-clay-200 flex items-center justify-center text-clay-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <Filter className="w-4 h-4 text-clay-600" />
            <span className="text-xs text-clay-600 font-medium">筛选</span>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="text-xs text-glaze-celadon hover:text-glaze-celadon/80 underline-offset-2 hover:underline"
              >
                重置
              </button>
            )}
          </div>
        </div>

        {/* Color Family selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-clay-500 mr-1">色系：</span>
          <button
            onClick={() => setFilters({ colorFamily: "全部" })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filters.colorFamily === "全部"
                ? "bg-clay-800 text-clay-50"
                : "bg-clay-50 text-clay-700 hover:bg-clay-200"
            }`}
          >
            全部
          </button>
          {COLOR_FAMILIES.map((cf: ColorFamily) => (
            <button
              key={cf}
              onClick={() => setFilters({ colorFamily: cf })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                filters.colorFamily === cf
                  ? "bg-clay-800 text-clay-50"
                  : "bg-clay-50 text-clay-700 hover:bg-clay-200"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full ring-1 ring-clay-400/30"
                style={{ backgroundColor: COLOR_FAMILY_MAP[cf] }}
              />
              {cf}
            </button>
          ))}
        </div>

        {/* Other selectors */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-clay-500 mr-1 self-center">温度：</span>
          {TEMP_PRESETS.map((tp) => {
            const active =
              filters.temperatureRange?.[0] === tp.range[0] &&
              filters.temperatureRange?.[1] === tp.range[1];
            return (
              <button
                key={tp.label}
                onClick={() =>
                  setFilters({
                    temperatureRange: active ? null : tp.range,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  active
                    ? "bg-glaze-amber text-clay-900"
                    : "bg-clay-50 text-clay-700 hover:bg-clay-200"
                }`}
              >
                {tp.label}
              </button>
            );
          })}

          <span className="text-xs text-clay-500 mx-1 self-center">泥料：</span>
          <select
            value={filters.clayType}
            onChange={(e) => setFilters({ clayType: e.target.value })}
            className="h-7 px-2 rounded-lg bg-clay-50 text-xs text-clay-700 border border-clay-300 focus:outline-none focus:border-glaze-celadon"
          >
            <option value="全部">全部</option>
            {CLAY_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span className="text-xs text-clay-500 mx-1 self-center">气氛：</span>
          <select
            value={filters.atmosphere}
            onChange={(e) =>
              setFilters({ atmosphere: e.target.value as Atmosphere | "全部" })
            }
            className="h-7 px-2 rounded-lg bg-clay-50 text-xs text-clay-700 border border-clay-300 focus:outline-none focus:border-glaze-celadon"
          >
            <option value="全部">全部</option>
            <option value="氧化">氧化</option>
            <option value="还原">还原</option>
          </select>

          <span className="text-xs text-clay-500 mx-1 self-center">窑位：</span>
          <select
            value={filters.kilnPosition}
            onChange={(e) => setFilters({ kilnPosition: e.target.value })}
            className="h-7 px-2 rounded-lg bg-clay-50 text-xs text-clay-700 border border-clay-300 focus:outline-none focus:border-glaze-celadon"
          >
            <option value="全部">全部</option>
            {KILN_POSITIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <span className="text-xs text-clay-500 mx-1 self-center">釉料：</span>
          <select
            value={filters.glazeName}
            onChange={(e) => setFilters({ glazeName: e.target.value })}
            className="h-7 px-2 rounded-lg bg-clay-50 text-xs text-clay-700 border border-clay-300 focus:outline-none focus:border-glaze-celadon max-w-[140px] truncate"
          >
            <option value="全部">全部釉料</option>
            {Array.from(
              new Set(
                TEST_SAMPLES.flatMap((s) => [s.glazeName, s.recipe.name])
              )
            ).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Quick tags */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-clay-500 mr-1">快捷：</span>
          {QUICK_TAGS.map((tag) => {
            const isAtm = tag.type === "atmosphere";
            const active = isAtm
              ? filters.atmosphere === tag.value
              : filters.searchKeyword === tag.value;
            return (
              <button
                key={tag.key}
                onClick={() => {
                  if (isAtm) {
                    setFilters({
                      atmosphere: active ? "全部" : (tag.value as Atmosphere),
                    });
                  } else {
                    setFilters({ searchKeyword: active ? "" : tag.value });
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-xs transition border ${
                  active
                    ? "border-glaze-celadon bg-glaze-celadon/10 text-glaze-celadon"
                    : "border-clay-300/60 bg-clay-50 text-clay-600 hover:border-clay-400"
                }`}
              >
                #{tag.value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
