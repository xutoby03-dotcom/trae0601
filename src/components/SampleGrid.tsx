import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SampleCard from "./SampleCard";
import { useAppStore } from "@/store/appStore";
import { TEST_SAMPLES } from "@/data/mockData";
import { COLOR_FAMILIES, COLOR_FAMILY_MAP, type ColorFamily } from "@/types";

export default function SampleGrid() {
  const { filters } = useAppStore();

  const filteredSamples = useMemo(() => {
    return TEST_SAMPLES.filter((s) => {
      if (filters.colorFamily !== "全部" && s.colorFamily !== filters.colorFamily)
        return false;
      if (filters.temperatureRange) {
        const [min, max] = filters.temperatureRange;
        if (s.firingTemperature < min || s.firingTemperature > max) return false;
      }
      if (filters.clayType !== "全部" && s.clayType !== filters.clayType)
        return false;
      if (filters.atmosphere !== "全部" && s.atmosphere !== filters.atmosphere)
        return false;
      if (filters.kilnPosition !== "全部" && s.kilnPosition !== filters.kilnPosition)
        return false;
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const text = `${s.name} ${s.code} ${s.glazeName} ${s.notes ?? ""} ${s.suitableFor.join(" ")}`.toLowerCase();
        if (!text.includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  const grouped = useMemo(() => {
    const g: Partial<Record<ColorFamily, typeof TEST_SAMPLES>> = {};
    filteredSamples.forEach((s) => {
      if (!g[s.colorFamily]) g[s.colorFamily] = [];
      g[s.colorFamily]!.push(s);
    });
    return g;
  }, [filteredSamples]);

  const familiesWithData = COLOR_FAMILIES.filter((cf) => grouped[cf]?.length);

  if (filteredSamples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-clay-500">
        <div className="w-20 h-20 rounded-full bg-clay-200/50 flex items-center justify-center mb-4">
          <span className="text-3xl">🍵</span>
        </div>
        <p className="font-serif text-lg">暂无匹配的试片</p>
        <p className="text-sm text-clay-400 mt-1">请调整筛选条件再试</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* total count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-clay-600">
          共找到 <span className="font-semibold text-clay-800">{filteredSamples.length}</span>{" "}
          块试片
        </p>
        <p className="text-xs text-clay-400">悬停查看预览，点击查看详情</p>
      </div>

      <AnimatePresence mode="popLayout">
        {filters.colorFamily !== "全部" ? (
          <motion.div
            key="single-group"
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          >
            {filteredSamples.map((s, i) => (
              <SampleCard key={s.id} sample={s} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="space-y-12">
            {familiesWithData.map((cf) => (
              <motion.section
                key={cf}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* section header */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-3 h-8 rounded-sm"
                    style={{ backgroundColor: COLOR_FAMILY_MAP[cf] }}
                  />
                  <h2 className="font-serif text-xl font-semibold text-clay-800">
                    {cf}
                  </h2>
                  <span className="text-xs text-clay-400">
                    {grouped[cf]!.length} 块
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-clay-300/60 to-transparent" />
                </div>

                <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {grouped[cf]!.map((s, i) => (
                    <SampleCard key={s.id} sample={s} index={i} />
                  ))}
                </motion.div>
              </motion.section>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
