import { Crosshair, Printer, Sparkles } from 'lucide-react';
import { TaskInfoCard } from '../components/TaskInfoCard';
import { PlateList } from '../components/PlateList';
import { OffsetVisualizer } from '../components/OffsetVisualizer';
import { IssueMarker } from '../components/IssueMarker';
import { FinalParamsPanel } from '../components/FinalParamsPanel';
import { useCalibrationStore } from '../store/useCalibrationStore';
import { useEffect } from 'react';
import { storage } from '../utils/storage';

export default function Home() {
  const saveToStorage = useCalibrationStore(s => s.saveToStorage);
  const task = useCalibrationStore(s => s.task);
  const setTask = useCalibrationStore(s => s.setTask);

  useEffect(() => {
    const saved = storage.getTasks();
    if (saved.length > 0) {
      setTask(saved[0]);
    }
  }, [setTask]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToStorage();
    }, 500);
    return () => clearTimeout(timer);
  }, [task, saveToStorage]);

  return (
    <div className="min-h-screen bg-parchment-50 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(30, 58, 95, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, #f8f4ec 0%, #f0e8d9 100%)
          `,
        }}
      />

      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #1e3a5f 0, #1e3a5f 1px, transparent 1px, transparent 20px)`,
        }}
      />

      <header className="relative z-10 border-b border-copper-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Crosshair className="w-5 h-5 text-copper-300" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-indigo-900 tracking-wide flex items-center gap-2">
                套色对位校准系统
                <Sparkles className="w-4 h-4 text-copper-400" />
              </h1>
              <p className="text-xs text-indigo-700/60 flex items-center gap-1.5">
                <Printer className="w-3 h-3" />
                版画工作坊 · 多色套印精确校准
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-indigo-700/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-celadon-500 animate-pulse" />
              自动保存已启用
            </div>
            <div className="px-2 py-1 rounded bg-copper-50 border border-copper-200 text-copper-500 font-medium">
              v1.0
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-3 space-y-5">
            <TaskInfoCard />
            <FinalParamsPanel />
          </div>

          <div className="xl:col-span-6 space-y-5">
            <OffsetVisualizer />
            <IssueMarker />
          </div>

          <div className="xl:col-span-3">
            <PlateList />
          </div>
        </div>

        <footer className="mt-8 pt-4 border-t border-copper-200/50 text-center text-xs text-indigo-700/40">
          <p>本系统帮助版画师傅标准化套色对位流程，降低因偏差导致的废品率 · 数据自动保存至本地</p>
        </footer>
      </main>
    </div>
  );
}
