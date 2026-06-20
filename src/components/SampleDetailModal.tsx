import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Thermometer,
  Flame,
  Layers,
  Calendar,
  MapPin,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Sparkles,
  Droplet,
  CircleDot,
  Grid3X3,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { getSampleById, getChainById } from "@/data/mockData";
import { COLOR_FAMILY_MAP, type Grade } from "@/types";

const GRADE_LABELS = ["无", "轻微", "轻度", "中度", "较重", "严重"];
const GRADE_COLORS = [
  "#5B8A72",
  "#7BA68A",
  "#C4B59C",
  "#D4A853",
  "#A34B3B",
  "#7A2E22",
];

function GradeBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: Grade;
  icon: React.ElementType;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-clay-600 font-medium">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: GRADE_COLORS[value],
            backgroundColor: `${GRADE_COLORS[value]}18`,
          }}
        >
          {GRADE_LABELS[value]}
        </span>
      </div>
      <div className="grade-bar">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ backgroundColor: GRADE_COLORS[value] }}
        />
      </div>
    </div>
  );
}

export default function SampleDetailModal() {
  const {
    showDetail,
    selectedSample,
    closeDetail,
    openDetail,
    openEvolution,
  } = useAppStore();

  const [side, setSide] = useState<"front" | "back">("front");

  const sample = selectedSample;

  if (!sample) return null;

  const prevSample = sample.previousVersionId
    ? getSampleById(sample.previousVersionId)
    : null;
  const nextSample = sample.nextVersionId
    ? getSampleById(sample.nextVersionId)
    : null;
  const chain = getChainById(sample.evolutionChainId);

  const goPrev = () => prevSample && openDetail(prevSample);
  const goNext = () => nextSample && openDetail(nextSample);

  return (
    <AnimatePresence>
      {showDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
            className="absolute inset-0 bg-clay-900/50 backdrop-blur-sm"
          />

          {/* modal */}
          <motion.div
            layoutId={`sample-${sample.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-clay-50 grain-overlay shadow-2xl"
          >
            {/* close */}
            <button
              onClick={closeDetail}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-clay-50/80 hover:bg-clay-100 backdrop-blur text-clay-700 flex items-center justify-center shadow-tile transition"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex flex-col lg:flex-row h-full max-h-[92vh] overflow-y-auto scrollbar-thin">
              {/* Left: images */}
              <div className="lg:w-1/2 p-6 sm:p-8 bg-gradient-to-br from-clay-100 to-clay-50">
                {/* color header */}
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl shadow-tile tile-edge ring-2 ring-white/70 shrink-0"
                    style={{ backgroundColor: sample.hexColor }}
                  />
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium mb-1"
                      style={{
                        color: COLOR_FAMILY_MAP[sample.colorFamily],
                        backgroundColor: `${COLOR_FAMILY_MAP[sample.colorFamily]}18`,
                      }}
                    >
                      {sample.colorFamily}
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-clay-800 leading-tight">
                      {sample.name}
                    </h2>
                    <p className="text-sm text-clay-500 mt-0.5">
                      编号 {sample.code} · v{sample.version}
                    </p>
                  </div>
                </div>

                {/* image viewer */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-clay-200 shadow-inner tile-edge">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={side}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      src={side === "front" ? sample.frontImage : sample.backImage}
                      alt={`${sample.name} ${side === "front" ? "正面" : "背面"}`}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* side toggle */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex rounded-full bg-clay-900/70 backdrop-blur-sm p-1 gap-1">
                    <button
                      onClick={() => setSide("front")}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                        side === "front"
                          ? "bg-clay-50 text-clay-800"
                          : "text-clay-100 hover:text-white"
                      }`}
                    >
                      正面
                    </button>
                    <button
                      onClick={() => setSide("back")}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                        side === "back"
                          ? "bg-clay-50 text-clay-800"
                          : "text-clay-100 hover:text-white"
                      }`}
                    >
                      背面
                    </button>
                  </div>
                </div>

                {/* version nav */}
                {(prevSample || nextSample || chain) && (
                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={goPrev}
                      disabled={!prevSample}
                      className="flex-1 min-w-0 h-10 rounded-xl bg-clay-100 hover:bg-clay-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm text-clay-700 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="truncate">
                        {prevSample ? prevSample.name : "已是第一版"}
                      </span>
                    </button>
                    <button
                      onClick={() => openEvolution(sample.evolutionChainId)}
                      className="h-10 px-4 rounded-xl bg-glaze-celadon/10 hover:bg-glaze-celadon/20 text-glaze-celadon flex items-center gap-1.5 text-sm font-medium transition"
                    >
                      <GitBranch className="w-4 h-4" />
                      演变链
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!nextSample}
                      className="flex-1 min-w-0 h-10 rounded-xl bg-clay-100 hover:bg-clay-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm text-clay-700 transition"
                    >
                      <span className="truncate">
                        {nextSample ? nextSample.name : "已是最新版"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right: info */}
              <div className="lg:w-1/2 p-6 sm:p-8 space-y-6">
                {/* firing info */}
                <section>
                  <h3 className="font-serif text-sm font-semibold text-clay-800 mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-glaze-amber" />
                    烧成信息
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile icon={Thermometer} label="烧成温度" value={`${sample.firingTemperature}℃`} accent="#A34B3B" />
                    <InfoTile icon={RotateCcw} label="烧成气氛" value={sample.atmosphere} accent="#D4A853" />
                    <InfoTile icon={Layers} label="泥料" value={sample.clayType} accent="#5B8A72" />
                    <InfoTile icon={MapPin} label="窑位" value={sample.kilnPosition} accent="#3B5A8A" />
                    <InfoTile icon={Sparkles} label="釉料" value={sample.glazeName} accent="#8B5A8A" />
                    <InfoTile icon={Calendar} label="烧成日期" value={sample.firingDate} accent="#8B7656" />
                  </div>
                </section>

                {/* surface defects */}
                <section>
                  <h3 className="font-serif text-sm font-semibold text-clay-800 mb-3 flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-glaze-iron" />
                    表面效果
                  </h3>
                  <div className="clay-card rounded-2xl p-4 space-y-3.5">
                    <GradeBar label="流釉程度" value={sample.flowGrade} icon={Droplet} />
                    <GradeBar label="针孔情况" value={sample.pinholeGrade} icon={CircleDot} />
                    <GradeBar label="开片情况" value={sample.crazingGrade} icon={Grid3X3} />
                    <div className="pt-2 border-t border-clay-200/60 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-clay-500 mb-0.5">光泽度</div>
                        <div className="text-sm font-medium text-clay-800">
                          {sample.glossiness}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-clay-500 mb-0.5">触感</div>
                        <div className="text-sm font-medium text-clay-800">
                          {sample.touchFeel}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* recipe */}
                <section>
                  <h3 className="font-serif text-sm font-semibold text-clay-800 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-glaze-celadon" />
                    釉料配方 · {sample.recipe.name}
                  </h3>
                  <div className="clay-card rounded-2xl p-4">
                    <div className="space-y-2">
                      {sample.recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-16 text-sm text-clay-700 font-medium">
                            {ing.name}
                          </div>
                          <div className="flex-1 h-1.5 bg-clay-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ing.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                              className="h-full rounded-full bg-gradient-to-r from-glaze-celadon to-glaze-amber"
                            />
                          </div>
                          <div className="w-12 text-right text-sm font-semibold text-clay-800">
                            {ing.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                    {sample.recipe.notes && (
                      <div className="mt-3 pt-3 border-t border-clay-200/60 text-xs text-clay-500 italic">
                        💡 {sample.recipe.notes}
                      </div>
                    )}
                  </div>
                </section>

                {/* suitable & notes */}
                <section>
                  <h3 className="font-serif text-sm font-semibold text-clay-800 mb-3">
                    适合器型
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sample.suitableFor.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-clay-100 text-clay-700 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {sample.notes && (
                    <div className="p-3 rounded-xl bg-glaze-amber/10 border border-glaze-amber/30 text-xs text-clay-700 leading-relaxed">
                      <span className="font-semibold text-glaze-amber">备注：</span>
                      {sample.notes}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="clay-card rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 text-[11px] text-clay-500 mb-0.5">
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        {label}
      </div>
      <div className="text-sm font-semibold text-clay-800">{value}</div>
    </div>
  );
}
