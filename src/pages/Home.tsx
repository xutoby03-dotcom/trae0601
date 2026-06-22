import { useEffect, useState } from 'react';
import BasicInfoForm from '@/components/BasicInfoForm';
import LightSceneCard from '@/components/LightSceneCard';
import RiskSummary from '@/components/RiskSummary';
import { useTrialStore } from '@/store/trialStore';
import { LIGHT_SCENE_META, type LightSceneKey } from '@/types';
import {
  Paintbrush,
  RotateCcw,
  Save,
  Printer,
  Lightbulb,
  Check,
  Clock,
} from 'lucide-react';

export default function Home() {
  const { reset, saveToLocal, loadFromLocal, savedAt } = useTrialStore();
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  const handleSave = () => {
    saveToLocal();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
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
                onClick={reset}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene, i) => (
                <LightSceneCard key={scene} scene={scene} index={i} />
              ))}
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
