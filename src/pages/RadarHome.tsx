import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssignmentStore, getUrgencyScore } from '@/store/useAssignmentStore';
import RadarChart from '@/components/RadarChart';
import TaskCard from '@/components/TaskCard';

export default function RadarHome() {
  const { assignments, courses } = useAssignmentStore();
  const navigate = useNavigate();

  const activeAssignments = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => getUrgencyScore(b.deadline, b.progress) - getUrgencyScore(a.deadline, a.progress));

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const urgentCount = activeAssignments.filter(
    (a) => getUrgencyScore(a.deadline, a.progress) > 0.6
  ).length;

  return (
    <div className="h-full flex flex-col md:flex-row pb-16 md:pb-0">
      <div className="md:w-1/2 lg:w-3/5 flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="w-full max-w-[520px] aspect-square relative">
          <RadarChart />
          {activeAssignments.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-slate-500 text-sm mb-3">暂无待办作业</p>
              <button
                onClick={() => navigate('/assignments')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-radar-cyan/10 text-radar-cyan text-sm hover:bg-radar-cyan/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加作业
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-6 mt-4 text-center">
          <div>
            <div className="text-2xl font-orbitron font-bold text-radar-cyan text-glow-cyan">
              {activeAssignments.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">待完成</div>
          </div>
          <div>
            <div className="text-2xl font-orbitron font-bold text-radar-red">
              {urgentCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">紧急</div>
          </div>
          <div>
            <div className="text-2xl font-orbitron font-bold text-radar-amber">
              {completedCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">已完成</div>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 lg:w-2/5 border-t md:border-t-0 md:border-l border-radar-border flex flex-col">
        <div className="p-4 border-b border-radar-border flex items-center justify-between">
          <h2 className="font-orbitron text-sm text-slate-300 tracking-wider">
            TASK LIST
          </h2>
          <span className="text-[11px] text-slate-500">
            {activeAssignments.length} 项任务
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeAssignments.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              {courses.length === 0
                ? '先去添加课程吧 →'
                : '所有作业都完成啦 🎉'}
            </div>
          )}
          {activeAssignments.map((a) => (
            <TaskCard key={a.id} assignment={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
