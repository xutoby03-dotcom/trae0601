import { WasteSummary } from '@/components/stats/WasteSummary';
import { ReasonBreakdown } from '@/components/stats/ReasonBreakdown';
import { DiscardHistory } from '@/components/stats/DiscardHistory';
import { BarChart3 } from 'lucide-react';

export function StatsPage() {
  return (
    <div className="animate-fade-in-up">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-violet-200/60">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              📊 浪费统计
            </h1>
            <p className="text-sm text-slate-500 mt-1">追踪丢弃原因，减少不必要的浪费</p>
          </div>
        </div>
      </header>

      <WasteSummary />
      <ReasonBreakdown />
      <DiscardHistory />
    </div>
  );
}
