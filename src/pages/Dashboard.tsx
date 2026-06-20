import { Header } from '../components/layout/Header';
import { IceRinkView } from '../components/ice-rink/IceRinkView';
import { ControlPanel } from '../components/ice-rink/ControlPanel';
import { IssueList } from '../components/ice-rink/IssueList';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useMaintenanceStore } from '../stores/useMaintenanceStore';
import { useIssueStore } from '../stores/useIssueStore';
import { getNextWindow } from '../utils/windowCalculator';
import { calculateIceScore } from '../utils/severityCalc';
import { Clock, CalendarClock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { windows } = useScheduleStore();
  const nextWindow = getNextWindow(windows);
  const navigate = useNavigate();
  const { completedSessions, session } = useMaintenanceStore();
  const { issues } = useIssueStore();

  const maintenanceCount = completedSessions.length + (session.status === 'running' || session.status === 'paused' ? 1 : 0);
  const unresolvedIssues = issues.filter((i) => !i.resolved);
  const highPriorityCount = unresolvedIssues.filter((i) => i.severity === 'high').length;
  const iceScore = calculateIceScore(issues);

  const avgDuration = completedSessions.length > 0
    ? Math.round(
        completedSessions.reduce((sum, s) => {
          const dur = s.endTime && s.startTime ? (s.endTime - s.startTime) / 60000 : 0;
          return sum + dur;
        }, 0) / completedSessions.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="冰面维护仪表盘" subtitle="实时监控冰面状态与维护进度" />

      <div className="p-6">
        {nextWindow && (
          <div
            onClick={() => navigate('/schedule')}
            className="mb-6 bg-gradient-to-r from-sky-500/20 to-blue-600/20 border border-sky-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-sky-400/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <p className="text-sm text-sky-300 font-medium">下一个维护窗口</p>
                <p className="text-xl font-bold text-white">
                  {nextWindow.startTime} - {nextWindow.endTime}
                  <span className="ml-3 text-sm font-normal text-sky-300">
                    约 {nextWindow.duration} 分钟
                  </span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="bg-slate-800/30 rounded-2xl p-1 border border-slate-700/50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">冰面俯视图</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400">实时</span>
                  </div>
                </div>
                <IceRinkView />
              </div>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <ControlPanel />
            <div className="h-[400px]">
              <IssueList />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard
            label="今日维护次数"
            value={maintenanceCount.toString()}
            unit="次"
            icon={<Clock className="w-5 h-5" />}
            trend={completedSessions.length > 0 ? `已完成 ${completedSessions.length} 次` : '尚未开始'}
            trendUp={maintenanceCount > 0}
          />
          <StatCard
            label="待处理问题"
            value={unresolvedIssues.length.toString()}
            unit="个"
            icon={<div className="text-lg">⚠️</div>}
            trend={highPriorityCount > 0 ? `${highPriorityCount} 高优先级` : '无高危'}
            trendUp={highPriorityCount === 0}
            accent="text-amber-400"
          />
          <StatCard
            label="平均维护时长"
            value={avgDuration > 0 ? avgDuration.toString() : '--'}
            unit="分钟"
            icon={<div className="text-lg">⏱️</div>}
            trend={avgDuration > 0 ? `标准 30 分钟` : '暂无数据'}
            trendUp={avgDuration > 0 && avgDuration <= 30}
          />
          <StatCard
            label="冰面健康评分"
            value={iceScore.toString()}
            unit="分"
            icon={<div className="text-lg">❄️</div>}
            trend={iceScore >= 80 ? '良好' : iceScore >= 60 ? '一般' : '需关注'}
            trendUp={iceScore >= 80}
            accent="text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  accent?: string;
}

function StatCard({ label, value, unit, icon, trend, trendUp, accent = 'text-sky-400' }: StatCardProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`${accent}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${accent}`}>{value}</span>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
      <div className={`text-xs mt-2 ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
        {trend}
      </div>
    </div>
  );
}
