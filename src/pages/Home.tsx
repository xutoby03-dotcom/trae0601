import { useEffect, useState } from 'react';
import BasicInfoForm from '@/components/BasicInfoForm';
import LightSceneCard from '@/components/LightSceneCard';
import RiskSummary from '@/components/RiskSummary';
import { useTrialStore } from '@/store/trialStore';
import { LIGHT_SCENE_META, RISK_META, type LightSceneKey, type RiskType } from '@/types';
import {
  Paintbrush,
  RotateCcw,
  Save,
  Printer,
  Lightbulb,
  Check,
  Clock,
  Filter,
  X,
} from 'lucide-react';

export default function Home() {
  const { reset, saveToLocal, loadFromLocal, savedAt, record } = useTrialStore();
  const [justSaved, setJustSaved] = useState(false);
  const [riskFilter, setRiskFilter] = useState<RiskType | null>(null);

  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  const handleSave = () => {
    saveToLocal();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  };

  const handleReset = () => {
    reset();
    setRiskFilter(null);
  };

  const handlePrint = () => {
    saveToLocal();
    window.print();
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const scenes = Object.keys(LIGHT_SCENE_META) as LightSceneKey[];

  const filteredScenes = riskFilter
    ? scenes.filter((s) => record[s].risks.some((r) => r.type === riskFilter))
    : scenes;

  const riskTypeKeys = Object.keys(RISK_META) as RiskType[];

  const handleRiskFilter = (type: RiskType) => {
    setRiskFilter((prev) => (prev === type ? null : type));
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b border-cream-200 bg-white/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-gold to-rose-goldDark flex items-center justify-center shadow-lg">
              <Paintbrush className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-espresso leading-tight">
                试妆灯色对比
              </h1>
              <p className="text-xs text-espresso/55 -mt-0.5">
                Makeup Lighting Assessment Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {(savedAt || justSaved) && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${
                  justSaved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 scale-100'
                    : 'bg-cream-50 text-espresso/55 border border-cream-200'
                }`}
              >
                {justSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已保存</span>
                    <span className="opacity-70">{formatTime(savedAt)}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>上次保存 {formatTime(savedAt)}</span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <Printer className="w-4 h-4" />
                导出报告
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
          {/* Left column: Basic info */}
          <aside className="space-y-6">
            <div className="card p-6">
              <BasicInfoForm />
            </div>
            <RiskSummary />
          </aside>

          {/* Right column: Light scenes */}
          <section className="space-y-6">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-rose-gold" />
                四灯色对比记录
              </h2>
              <p className="section-subtitle mb-0">
                请在自然光、暖光、冷光、混合光四种场景下分别拍摄并记录底妆表现
              </p>
            </div>

            {/* Risk filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-semibold text-espresso/60 mr-1">
                <Filter className="w-3.5 h-3.5" />
                风险筛选
              </span>
              {riskTypeKeys.map((type) => {
                const meta = RISK_META[type];
                const active = riskFilter === type;
                const hitCount = scenes.filter((s) =>
                  record[s].risks.some((r) => r.type === type)
                ).length;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleRiskFilter(type)}
                    className={`chip transition-all duration-200 ${
                      active
                        ? 'text-white shadow-md ring-0'
                        : 'text-espresso/70 border border-cream-200 hover:border-opacity-60'
                    }`}
                    style={
                      active
                        ? { backgroundColor: meta.color }
                        : { backgroundColor: meta.bgColor }
                    }
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    {meta.name}
                    {hitCount > 0 && (
                      <span className={`text-[10px] ${active ? 'text-white/80' : 'opacity-60'}`}>
                        {hitCount}/4
                      </span>
                    )}
                  </button>
                );
              })}
              {riskFilter && (
                <button
                  type="button"
                  onClick={() => setRiskFilter(null)}
                  className="chip bg-cream-50 border border-cream-200 text-espresso/50 hover:text-espresso hover:bg-cream-100"
                >
                  <X className="w-3 h-3" />
                  清除筛选
                </button>
              )}
            </div>

            {/* Scene cards grid */}
            <div className={`grid gap-6 ${
              filteredScenes.length === 1
                ? 'grid-cols-1 max-w-lg'
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {filteredScenes.map((scene, i) => (
                <LightSceneCard key={scene} scene={scene} index={i} />
              ))}
              {filteredScenes.length === 0 && (
                <div className="md:col-span-2 py-16 text-center text-espresso/40">
                  <Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">当前筛选条件下没有命中的灯色场景</p>
                  <p className="text-xs mt-1 opacity-70">请尝试其他风险类型或清除筛选</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          header { position: static !important; }
          .btn-primary, .btn-secondary { display: none !important; }
          body { background: white !important; }
          .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </div>
  );
}
