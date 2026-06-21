import { RooftopCanvas } from '../components/RooftopCanvas';
import { DataPanel } from '../components/DataPanel';
import { TimelineControl } from '../components/TimelineControl';
import { RiskMarker } from '../components/RiskMarker';
import { ExportPanel } from '../components/ExportPanel';
import { useWindSimulation } from '../hooks/useWindSimulation';
import { Wind, AlertTriangle, Flag } from 'lucide-react';

export default function Home() {
  const { riskSummary, hasHighRisk } = useWindSimulation();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 bg-grid overflow-hidden">
      <header className="flex-shrink-0 h-16 px-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Flag size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-cyan">
              风速采样旗阵分析平台
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              屋顶旗阵风场模拟与风险评估系统
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Wind size={14} className="text-cyan-400" />
              <span className="text-slate-400">旗杆总数:</span>
              <span className="text-cyan-400 font-bold">{riskSummary.totalPoles}</span>
            </div>
            {hasHighRisk && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 animate-pulse">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-red-400">检测到高风险旗杆</span>
              </div>
            )}
          </div>
          <ExportPanel />
        </div>
      </header>

      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 min-w-0">
          <RooftopCanvas />
        </div>
        <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-thin">
          <DataPanel />
        </div>
      </main>

      <footer className="flex-shrink-0 px-4 pb-4 pt-0">
        <TimelineControl />
      </footer>

      <RiskMarker />
    </div>
  );
}
