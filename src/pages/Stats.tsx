import { useMemo } from "react";
import { useFridgeStore } from "@/store/useFridgeStore";
import { CATEGORY_LABELS, type FoodCategory } from "@/types";
import { CATEGORY_ICONS, FOOD_ICONS } from "@/data/foodIcons";
import { TrendingDown, TrendingUp, AlertCircle, Award } from "lucide-react";
import { getIconForName } from "@/utils/recipeMatcher";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as FoodCategory[];

export default function Stats() {
  const wasteRecords = useFridgeStore((s) => s.wasteRecords);
  const foodItems = useFridgeStore((s) => s.foodItems);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthWaste = useMemo(
    () =>
      wasteRecords.filter((r) => {
        const d = new Date(r.wasteDate);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }),
    [wasteRecords, currentYear, currentMonth]
  );

  const wasteByCategory = useMemo(() => {
    const map: Partial<Record<FoodCategory, number>> = {};
    for (const r of currentMonthWaste) {
      map[r.category] = (map[r.category] || 0) + r.quantity;
    }
    return map;
  }, [currentMonthWaste]);

  const wasteItemsByName = useMemo(() => {
    const map: Record<string, { name: string; category: FoodCategory; quantity: number; unit: string; reason: string }> = {};
    for (const r of currentMonthWaste) {
      if (map[r.name]) {
        map[r.name].quantity += r.quantity;
      } else {
        map[r.name] = {
          name: r.name,
          category: r.category as FoodCategory,
          quantity: r.quantity,
          unit: r.unit,
          reason: r.reason,
        };
      }
    }
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [currentMonthWaste]);

  const totalWasteCount = useMemo(
    () => currentMonthWaste.reduce((sum, r) => sum + r.quantity, 0),
    [currentMonthWaste]
  );

  const maxWasteCount = useMemo(
    () => Math.max(...Object.values(wasteByCategory), 1),
    [wasteByCategory]
  );

  const consumedThisMonth = useMemo(
    () =>
      foodItems.filter((f) => {
        if (!f.consumed || !f.consumedDate) return false;
        const d = new Date(f.consumedDate);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }),
    [foodItems, currentYear, currentMonth]
  );

  const consumedByCategory = useMemo(() => {
    const map: Partial<Record<FoodCategory, number>> = {};
    for (const f of consumedThisMonth) {
      map[f.category] = (map[f.category] || 0) + f.quantity;
    }
    return map;
  }, [consumedThisMonth]);

  const totalConsumedCount = useMemo(
    () => consumedThisMonth.reduce((sum, f) => sum + f.quantity, 0),
    [consumedThisMonth]
  );

  const activeItemsCount = useMemo(
    () => foodItems.filter((f) => !f.consumed && f.quantity > 0).length,
    [foodItems]
  );

  const wasteRate = useMemo(() => {
    const total = totalWasteCount + totalConsumedCount;
    if (total === 0 || totalConsumedCount === 0) return 0;
    return Math.round((totalWasteCount / total) * 100);
  }, [totalWasteCount, totalConsumedCount]);

  const buyLessCategories = useMemo(
    () =>
      ALL_CATEGORIES.filter((cat) => (wasteByCategory[cat] || 0) > 0),
    [wasteByCategory]
  );

  const keepStockedCategories = useMemo(
    () =>
      ALL_CATEGORIES.filter(
        (cat) =>
          (consumedByCategory[cat] || 0) > 0 &&
          (wasteByCategory[cat] || 0) === 0
      ),
    [consumedByCategory, wasteByCategory]
  );

  const hasSuggestions = buyLessCategories.length > 0 || keepStockedCategories.length > 0;

  const sortedWasteCategories = useMemo(
    () =>
      ALL_CATEGORIES.filter((cat) => (wasteByCategory[cat] || 0) > 0).sort(
        (a, b) => (wasteByCategory[b] || 0) - (wasteByCategory[a] || 0)
      ),
    [wasteByCategory]
  );

  const wasteNamesByCategory = useMemo(() => {
    const map: Partial<Record<FoodCategory, string[]>> = {};
    for (const item of wasteItemsByName) {
      if (!map[item.category]) map[item.category] = [];
      if (!map[item.category]!.includes(item.name)) {
        map[item.category]!.push(item.name);
      }
    }
    return map;
  }, [wasteItemsByName]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 本月统计</h1>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-800">浪费统计</h2>
          {totalWasteCount > 0 && (
            <span className="ml-auto rounded-full bg-red-50 px-3 py-0.5 text-sm font-medium text-red-600">
              共 {totalWasteCount} 份
            </span>
          )}
        </div>

        {totalWasteCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Award className="mb-2 h-10 w-10 text-green-500" />
            <p className="text-lg font-semibold text-green-600">本月零浪费！太棒了 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWasteCategories.map((cat) => {
              const count = wasteByCategory[cat] || 0;
              const widthPercent = (count / maxWasteCount) * 100;
              const names = wasteNamesByCategory[cat] || [];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3">
                    <div className="flex w-20 shrink-0 items-center gap-1.5">
                      <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-sm text-gray-600">{CATEGORY_LABELS[cat]}</span>
                    </div>
                    <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-red-50">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-semibold text-red-600">
                      {count}份
                    </span>
                  </div>
                  <div className="mt-1.5 ml-20 flex flex-wrap gap-1.5">
                    {names.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600"
                      >
                        <span>{getIconForName(name)}</span>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-medium text-gray-400">浪费明细</p>
              <div className="space-y-2">
                {wasteItemsByName.map((w) => (
                  <div
                    key={w.name}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <span className="text-base">{getIconForName(w.name)}</span>
                    <span className="flex-1 text-sm text-gray-700">{w.name}</span>
                    <span className="text-xs text-gray-400">
                      {w.quantity}{w.unit}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        w.reason === "expired"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {w.reason === "expired" ? "过期" : "变质"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">购买建议</h2>
        </div>

        {!hasSuggestions ? (
          <p className="py-6 text-center text-sm text-gray-400">暂无建议，继续保持~</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {buyLessCategories.map((cat) => {
              const wasteCount = wasteByCategory[cat] || 0;
              const names = wasteNamesByCategory[cat] || [];
              return (
                <div
                  key={`less-${cat}`}
                  className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-3.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-sm font-semibold text-red-700">
                      少买{CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs text-red-500">浪费了{wasteCount}份</span>
                  </div>
                  {names.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {names.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-0.5 rounded bg-white/60 px-1.5 py-0.5 text-[10px] text-red-500"
                        >
                          {getIconForName(name)} {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {keepStockedCategories.map((cat) => {
              const consumedCount = consumedByCategory[cat] || 0;
              return (
                <div
                  key={`stock-${cat}`}
                  className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-3.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-sm font-semibold text-green-700">
                      常备{CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs text-green-600">消耗{consumedCount}份，零浪费</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">消费概览</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{activeItemsCount}</p>
            <p className="mt-1 text-xs text-blue-500">在库食材</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalConsumedCount}</p>
            <p className="mt-1 text-xs text-green-500">本月消耗</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{wasteRate}%</p>
            <p className="mt-1 text-xs text-amber-500">浪费率</p>
          </div>
        </div>
      </div>
    </div>
  );
}
