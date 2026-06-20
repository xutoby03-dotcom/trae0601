import FilterBar from "@/components/FilterBar";
import SampleGrid from "@/components/SampleGrid";
import SampleDetailModal from "@/components/SampleDetailModal";
import EvolutionTimeline from "@/components/EvolutionTimeline";
import { EVOLUTION_CHAINS } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import { GitBranch } from "lucide-react";

export default function Home() {
  const { openEvolution } = useAppStore();

  return (
    <div className="min-h-screen">
      <FilterBar />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-clay-200/50 via-clay-100 to-clay-50 border-b border-clay-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-serif text-glaze-celadon font-medium tracking-widest mb-3">
                CERAMIC GLAZE ARCHIVE
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-clay-800 leading-tight mb-4">
                每一块试片，
                <br />
                都是泥土与火的诗篇。
              </h1>
              <p className="text-clay-600 leading-relaxed mb-6">
                系统化记录釉色配方、烧成参数与表面效果，
                <br className="hidden sm:block" />
                追溯每一次微调，
                从配方演变，为下一次杯子或花瓶找到最合适的釉色。
              </p>
              <div className="flex flex-wrap gap-2">
                {EVOLUTION_CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openEvolution(c.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-clay-50 hover:bg-white border border-clay-300/60 text-sm text-clay-700 shadow-tile hover:shadow-tile-hover transition"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Decorative tiles */}
            <div className="relative h-56 sm:h-64 hidden md:block">
              <div className="absolute inset-0">
                <div className="absolute top-4 left-8 w-32 h-32 rounded-2xl tile-edge shadow-tile-hover rotate-[-6deg] tile-edge opacity-90"
                     style={{backgroundColor: "#5B8A72" }} />
                <div className="absolute top-0 right-4 w-28 h-28 rounded-2xl tile-edge shadow-tile-hover rotate-[5deg]"
                     style={{ backgroundColor: "#A34B3B" }} />
                <div className="absolute bottom-2 left-20 w-36 h-24 rounded-2xl tile-edge shadow-tile-hover rotate-[-2deg]"
                     style={{ backgroundColor: "#3B5A8A" }} />
                <div className="absolute bottom-8 right-16 w-24 h-24 rounded-2xl tile-edge shadow-tile-hover rotate-[8deg]"
                     style={{ backgroundColor: "#D4A853" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SampleGrid />

      {/* footer */}
      <footer className="mt-16 border-t border-clay-300/60 bg-clay-100/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-serif text-clay-700 mb-2">釉色试片墙 · 火与土的档案</p>
          <p className="text-xs text-clay-500">
            窑火既过，万色皆成诗
          </p>
        </div>
      </footer>

      <SampleDetailModal />
      <EvolutionTimeline />
    </div>
  );
}
