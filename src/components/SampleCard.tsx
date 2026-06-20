import { motion } from "framer-motion";
import { Thermometer, Flame, Layers, GitBranch, Sparkles } from "lucide-react";
import type { TestSample } from "@/types";
import { COLOR_FAMILY_MAP } from "@/types";
import { useAppStore } from "@/store/appStore";

interface Props {
  sample: TestSample;
  index: number;
}

export default function SampleCard({ sample, index }: Props) {
  const { openDetail, openEvolution } = useAppStore();

  const familyColor = COLOR_FAMILY_MAP[sample.colorFamily];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{
        y: -4,
        rotate: index % 3 === 0 ? -1.2 : index % 3 === 1 ? 1 : 0,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openDetail(sample)}
      className="clay-card group cursor-pointer relative overflow-hidden rounded-2xl p-4 select-none"
    >
      {/* glaze color swatch with image preview */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-clay-200 tile-edge">
        <img
          src={sample.frontImage}
          alt={sample.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-clay-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* color swatch circle */}
        <div
          className="absolute top-2 left-2 w-8 h-8 rounded-full ring-2 ring-white/60 shadow-md tile-edge"
          style={{ backgroundColor: sample.hexColor }}
          title={`色值 ${sample.hexColor.toUpperCase()}`}
        />

        {/* version badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-clay-900/70 backdrop-blur-sm text-clay-50 text-[10px] font-medium tracking-wide">
          {sample.code}
        </div>

        {/* click hint */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-clay-50 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          点击查看详情 →
        </div>
      </div>

      {/* content */}
      <h3 className="font-serif text-clay-800 font-semibold leading-tight mb-1.5 group-hover:text-glaze-celadon transition-colors">
        {sample.name}
      </h3>

      {/* 釉料配方名 */}
      <div className="flex items-center gap-1 mb-2">
        <Sparkles className="w-3 h-3 text-glaze-amber shrink-0" />
        <span className="text-[11px] text-clay-700 font-medium truncate">
          {sample.glazeName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-2">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-clay-700"
          style={{ backgroundColor: `${familyColor}22` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: familyColor }}
          />
          {sample.colorFamily}
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-clay-600 bg-clay-100">
          {sample.glossiness}
        </span>
      </div>

      {/* 主要成分 */}
      <div className="space-y-0.5 mb-2.5">
        {sample.recipe.ingredients.slice(0, 3).map((ing, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[10px] text-clay-500 w-12 shrink-0 truncate">
              {ing.name}
            </span>
            <div className="flex-1 h-1 bg-clay-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-glaze-celadon/80 to-glaze-amber/80"
                style={{ width: `${Math.min(ing.percentage * 2, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-clay-600 font-medium w-8 text-right">
              {ing.percentage}%
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-clay-600 pt-2 border-t border-clay-200/60">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-glaze-iron" />
          <span>{sample.firingTemperature}℃</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-glaze-amber" />
          <span>{sample.atmosphere}</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-glaze-celadon" />
          <span>{sample.clayType}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-glaze-cobalt text-[10px]">窑</span>
          <span>{sample.kilnPosition}</span>
        </div>
      </div>

      {/* suitable for */}
      {sample.suitableFor?.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-clay-300/50 flex flex-wrap gap-1">
          {sample.suitableFor.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded bg-clay-50 text-[10px] text-clay-600"
            >
              · {s}
            </span>
          ))}
        </div>
      )}

      {/* evolution indicator */}
      {(sample.previousVersionId || sample.nextVersionId) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openEvolution(sample.evolutionChainId);
          }}
          className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-clay-50/90 hover:bg-glaze-celadon hover:text-white text-clay-600 flex items-center justify-center shadow-tile transition-colors"
          title="查看演变链路"
        >
          <GitBranch className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}
