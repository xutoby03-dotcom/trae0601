import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, GitBranch, ArrowRight, CheckCircle } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { getChainById, getSamplesByChain } from "@/data/mockData";
import type { TestSample, RecipeIngredient } from "@/types";

export default function EvolutionTimeline() {
  const { showEvolution, evolutionChainId, closeEvolution, openDetail } =
    useAppStore();

  const [focusedA, setFocusedA] = useState<string | null>(null);
  const [focusedB, setFocusedB] = useState<string | null>(null);

  if (!evolutionChainId) return null;

  const chain = getChainById(evolutionChainId);
  if (!chain) return null;

  const samples = getSamplesByChain(evolutionChainId);

  const sampleA = focusedA ? samples.find((s) => s.id === focusedA) : null;
  const sampleB = focusedB ? samples.find((s) => s.id === focusedB) : null;

  return (
    <AnimatePresence>
      {showEvolution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEvolution}
            className="absolute inset-0 bg-clay-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="relative flex-1 mt-16 max-h-[calc(100vh-4rem)] rounded-t-3xl bg-clay-50 grain-overlay overflow-hidden flex flex-col"
          >
            {/* close */}
            <button
              onClick={closeEvolution}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-clay-100 hover:bg-clay-200 text-clay-700 flex items-center justify-center shadow-tile transition"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Header */}
            <div className="px-6 sm:px-10 py-6 border-b border-clay-200/60 bg-gradient-to-br from-clay-100 to-clay-50">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glaze-celadon/10 text-glaze-celadon text-xs font-medium mb-2">
                <GitBranch className="w-3.5 h-3.5" />
                颜色演变链路
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-clay-800 mb-1">
                {chain.name}
              </h2>
              <p className="text-sm text-clay-500 max-w-2xl">{chain.description}</p>
              <p className="text-xs text-clay-400 mt-2">
                共 {samples.length} 个版本 · 点击节点试片查看详情，选中两个版本进行配方对比
              </p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Timeline */}
              <div className="px-6 sm:px-10 py-8">
                <div className="relative">
                  {/* connecting line */}
                  <div className="absolute left-6 sm:left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-glaze-celadon/40 via-glaze-amber/60 to-glaze-iron/40" />

                  <div className="space-y-6">
                    {samples.map((s, idx) => (
                      <TimelineNode
                        key={s.id}
                        sample={s}
                        index={idx}
                        total={samples.length}
                        selected={
                          focusedA === s.id || focusedB === s.id
                        }
                        selectedSide={
                          focusedA === s.id
                            ? "A"
                            : focusedB === s.id
                            ? "B"
                            : null
                        }
                        onClickDetail={() => {
                          openDetail(s);
                        }}
                        onSelectCompare={() => {
                          if (focusedA === s.id) {
                            setFocusedA(null);
                          } else if (focusedB === s.id) {
                            setFocusedB(null);
                          } else if (!focusedA) {
                            setFocusedA(s.id);
                          } else if (!focusedB) {
                            setFocusedB(s.id);
                          } else {
                            setFocusedA(s.id);
                            setFocusedB(null);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Compare panel */}
              {sampleA && sampleB && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-clay-200/60 px-6 sm:px-10 py-8 bg-gradient-to-br from-clay-100/60 to-clay-50"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif text-lg font-semibold text-clay-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-glaze-celadon" />
                      配方对比 · v{sampleA.version} vs v{sampleB.version}
                    </h3>
                    <button
                      onClick={() => {
                        setFocusedA(null);
                        setFocusedB(null);
                      }}
                      className="text-xs text-clay-500 hover:text-clay-800 underline underline-offset-2"
                    >
                      清除对比
                    </button>
                  </div>
                  <CompareView a={sampleA} b={sampleB} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TimelineNode({
  sample,
  index,
  total,
  selected,
  selectedSide,
  onClickDetail,
  onSelectCompare,
}: {
  sample: TestSample;
  index: number;
  total: number;
  selected: boolean;
  selectedSide: "A" | "B" | null;
  onClickDetail: () => void;
  onSelectCompare: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative pl-14 sm:pl-20"
    >
      {/* node circle */}
      <div
        className={`absolute left-0 sm:left-4 top-6 w-12 h-12 rounded-full tile-edge flex items-center justify-center text-clay-50 text-sm font-bold shadow-tile transition-transform ${
          selected ? "ring-4 ring-glaze-celadon/40 scale-110" : ""
        }`}
        style={{ backgroundColor: sample.hexColor }}
      >
        {selectedSide && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-clay-900 text-white text-[10px] flex items-center justify-center">
            {selectedSide}
          </span>
        )}
        v{sample.version}
      </div>

      <div
        className={`clay-card rounded-2xl p-4 sm:p-5 cursor-pointer transition-all ${
          selected ? "ring-2 ring-glaze-celadon/50 shadow-tile-hover" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="font-serif text-lg font-semibold text-clay-800">
              {sample.name}
            </h4>
            <p className="text-xs text-clay-500 mt-0.5">
              {sample.code} · {sample.firingDate} · {sample.firingTemperature}℃ ·{" "}
              {sample.atmosphere}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl tile-edge shrink-0 shadow-sm"
            style={{ backgroundColor: sample.hexColor }}
          />
        </div>

        {sample.recipe.notes && (
          <p className="text-xs text-clay-600 italic mb-3">
            💡 {sample.recipe.notes}
          </p>
        )}

        {/* mini recipe bars */}
        <div className="space-y-1 mb-4">
          {sample.recipe.ingredients.slice(0, 4).map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-clay-600 truncate">
                {ing.name}
              </span>
              <div className="flex-1 h-1 bg-clay-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-glaze-celadon to-glaze-amber"
                  style={{ width: `${ing.percentage * 2}%` }}
                />
              </div>
              <span className="w-8 text-right text-[11px] text-clay-700 font-medium">
                {ing.percentage}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClickDetail}
            className="flex-1 h-9 rounded-xl bg-clay-800 hover:bg-clay-900 text-clay-50 text-xs font-medium transition"
          >
            查看详情
          </button>
          <button
            onClick={onSelectCompare}
            className={`h-9 px-4 rounded-xl text-xs font-medium transition ${
              selected
                ? "bg-glaze-celadon text-white"
                : "bg-clay-100 hover:bg-clay-200 text-clay-700"
            }`}
          >
            {selected ? `已选为${selectedSide}` : "对比"}
          </button>
        </div>
      </div>

      {/* connector arrow for all but last */}
      {index < total - 1 && (
        <div className="absolute left-[46px] sm:left-[62px] bottom-[-20px] text-glaze-amber/60">
          <ArrowRight className="w-4 h-4 rotate-90" />
        </div>
      )}
    </motion.div>
  );
}

function CompareView({ a, b }: { a: TestSample; b: TestSample }) {
  const diffMap = useMemo(() => {
    const allIngredients = new Set<string>();
    a.recipe.ingredients.forEach((i) => allIngredients.add(i.name));
    b.recipe.ingredients.forEach((i) => allIngredients.add(i.name));
    const m = new Map<string, { a?: number; b?: number; diff: number }>();
    allIngredients.forEach((name) => {
      const ai = a.recipe.ingredients.find((i) => i.name === name);
      const bi = b.recipe.ingredients.find((i) => i.name === name);
      const av = ai?.percentage ?? 0;
      const bv = bi?.percentage ?? 0;
      m.set(name, { a: ai?.percentage, b: bi?.percentage, diff: bv - av });
    });
    return m;
  }, [a, b]);

  const ingList = Array.from(diffMap.entries());

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Glaze A */}
      <div className="clay-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl tile-edge shadow-sm"
            style={{ backgroundColor: a.hexColor }}
          />
          <div>
            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-clay-900 text-white text-[10px] font-bold mr-1">
              A
            </div>
            <span className="font-serif font-semibold text-clay-800">
              {a.name}
            </span>
            <p className="text-xs text-clay-500">v{a.version}</p>
          </div>
        </div>
        <IngredientList ingredients={a.recipe.ingredients} diffMap={diffMap} side="a" />
      </div>

      {/* Delta */}
      <div className="clay-card rounded-2xl p-5 bg-gradient-to-br from-glaze-amber/5 to-clay-50">
        <div className="text-center mb-4">
          <span className="font-serif text-sm font-semibold text-clay-700">
            配方差异
          </span>
          <p className="text-[11px] text-clay-500 mt-0.5">A → B 的变化</p>
        </div>
        <div className="space-y-2">
          {ingList.map(([name, v]) => {
            const changed = Math.abs(v.diff) > 0.01;
            if (!changed) {
              return (
                <div
                  key={name}
                  className="flex items-center justify-between text-xs text-clay-400 py-1"
                >
                  <span>{name}</span>
                  <span>—</span>
                </div>
              );
            }
            const sign = v.diff > 0 ? "+" : "";
            const color = v.diff > 0 ? "text-glaze-iron" : "text-glaze-celadon";
            return (
              <div
                key={name}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-glaze-iron/8"
              >
                <span className="text-clay-700 font-medium">{name}</span>
                <span className={`font-bold ${color}`}>
                  {sign}
                  {v.diff.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Glaze B */}
      <div className="clay-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl tile-edge shadow-sm"
            style={{ backgroundColor: b.hexColor }}
          />
          <div>
            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-glaze-celadon text-white text-[10px] font-bold mr-1">
              B
            </div>
            <span className="font-serif font-semibold text-clay-800">
              {b.name}
            </span>
            <p className="text-xs text-clay-500">v{b.version}</p>
          </div>
        </div>
        <IngredientList ingredients={b.recipe.ingredients} diffMap={diffMap} side="b" />
      </div>
    </div>
  );
}

function IngredientList({
  ingredients,
  diffMap,
  side,
}: {
  ingredients: RecipeIngredient[];
  diffMap: Map<string, { a?: number; b?: number; diff: number }>;
  side: "a" | "b";
}) {
  return (
    <div className="space-y-2">
      {ingredients.map((ing, i) => {
        const d = diffMap.get(ing.name);
        const changed = d && Math.abs(d.diff) > 0.01;
        return (
          <div
            key={i}
            className={`rounded-lg px-2 py-1.5 ${
              changed ? "bg-glaze-iron/8" : "bg-clay-100/60"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-clay-700">{ing.name}</span>
              <span
                className={`text-xs font-bold ${
                  changed ? "text-glaze-iron" : "text-clay-800"
                }`}
              >
                {ing.percentage}%
              </span>
            </div>
            <div className="h-1.5 bg-clay-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  changed
                    ? side === "a"
                      ? "bg-clay-600"
                      : "bg-glaze-iron"
                    : "bg-gradient-to-r from-glaze-celadon to-glaze-amber"
                }`}
                style={{ width: `${Math.min(ing.percentage * 2.2, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
