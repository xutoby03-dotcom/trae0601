import { ZoneTabs } from '@/components/fridge/ZoneTabs';
import { Refrigerator } from 'lucide-react';

export function FridgePage() {
  return (
    <div className="animate-fade-in-up">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-200/60">
            <Refrigerator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              ❄️ 冰箱食材分区
            </h1>
            <p className="text-sm text-slate-500 mt-1">按冷藏层、冷冻抽屉、门架分类管理</p>
          </div>
        </div>
      </header>

      <ZoneTabs />
    </div>
  );
}
