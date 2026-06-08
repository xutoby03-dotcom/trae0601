import { useMemo } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { Trophy, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Stats() {
  const { assignments, courses } = useAssignmentStore();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyAssignments = assignments.filter((a) => {
      const d = new Date(a.deadline);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const completedThisMonth = monthlyAssignments.filter(
      (a) => a.status === 'completed'
    ).length;
    const totalThisMonth = monthlyAssignments.length;
    const completionRate = totalThisMonth > 0 ? Math.round((completedThisMonth / totalThisMonth) * 100) : 0;

    const courseStats = courses.map((course) => {
      const courseAssignments = assignments.filter((a) => a.courseId === course.id);
      if (courseAssignments.length === 0) {
        return {
          id: course.id,
          name: course.name,
          color: course.color,
          procrastinationIndex: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          avgProgress: 0,
          totalHours: 0,
        };
      }

      let totalProcrastination = 0;
      let count = 0;
      let totalProgress = 0;
      let totalHours = 0;
      let completedCount = 0;

      courseAssignments.forEach((a) => {
        totalProgress += a.progress;
        totalHours += a.estimatedHours;
        if (a.status === 'completed') completedCount++;

        const dl = new Date(a.deadline);
        const created = new Date(dl.getTime() - a.estimatedHours * 3600000 * 5);
        const totalDuration = dl.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        if (totalDuration > 0 && a.status !== 'completed') {
          const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);
          totalProcrastination += Math.max(0, 1 - a.progress / expectedProgress);
          count++;
        }
      });

      const procrastinationIndex = count > 0 ? totalProcrastination / count : 0;

      return {
        id: course.id,
        name: course.name,
        color: course.color,
        procrastinationIndex,
        totalAssignments: courseAssignments.length,
        completedAssignments: completedCount,
        avgProgress: Math.round(totalProgress / courseAssignments.length),
        totalHours,
      };
    });

    courseStats.sort((a, b) => b.procrastinationIndex - a.procrastinationIndex);

    const totalHours = assignments.reduce((sum, a) => sum + a.estimatedHours, 0);

    const overdueCount = assignments.filter((a) => a.status === 'overdue').length;
    const activeCount = assignments.filter(
      (a) => a.status === 'in_progress' || a.status === 'pending'
    ).length;

    return {
      completedThisMonth,
      totalThisMonth,
      completionRate,
      courseStats,
      totalHours,
      overdueCount,
      activeCount,
      totalCompleted: assignments.filter((a) => a.status === 'completed').length,
    };
  }, [assignments, courses]);

  const maxProcrastination = Math.max(
    ...stats.courseStats.map((c) => c.procrastinationIndex),
    0.1
  );

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-orbitron text-xl text-slate-100 tracking-wider">STATISTICS</h1>
        <p className="text-xs text-slate-500 mt-1">学习数据分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-radar-cyan" />
            <span className="text-[11px] text-slate-400">本月完成</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-radar-cyan text-glow-cyan">
            {stats.completedThisMonth}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            共 {stats.totalThisMonth} 项
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-radar-amber" />
            <span className="text-[11px] text-slate-400">完成率</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-radar-amber">
            {stats.completionRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">本月</div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-radar-red" />
            <span className="text-[11px] text-slate-400">已过期</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-radar-red">
            {stats.overdueCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">需要关注</div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] text-slate-400">总耗时</span>
          </div>
          <div className="text-2xl font-orbitron font-bold text-slate-200">
            {stats.totalHours}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">小时</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-radar-pink" />
            <h2 className="font-orbitron text-sm text-slate-200">拖延指数排名</h2>
          </div>

          {stats.courseStats.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {stats.courseStats
                .filter((c) => c.totalAssignments > 0)
                .map((course, i) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold w-5 text-center"
                          style={{ color: i === 0 ? '#f72585' : '#64748b' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-200">{course.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {course.completedAssignments}/{course.totalAssignments} 完成
                        </span>
                      </div>
                      <span className="text-xs font-medium" style={{ color: course.color }}>
                        {Math.round(course.procrastinationIndex * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(course.procrastinationIndex / maxProcrastination) * 100}%`,
                          backgroundColor:
                            course.procrastinationIndex > 0.6
                              ? '#f72585'
                              : course.procrastinationIndex > 0.3
                              ? '#fca311'
                              : '#00f5d4',
                        }}
                      />
                    </div>
                  </div>
                ))}
              {stats.courseStats.filter((c) => c.totalAssignments > 0).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">所有课程暂无作业</p>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-radar-amber" />
            <h2 className="font-orbitron text-sm text-slate-200">时间分布</h2>
          </div>

          {stats.courseStats.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.courseStats
                .filter((c) => c.totalHours > 0)
                .sort((a, b) => b.totalHours - a.totalHours)
                .map((course) => {
                  const maxHours = Math.max(
                    ...stats.courseStats.map((c) => c.totalHours),
                    1
                  );
                  return (
                    <div key={course.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-200">{course.name}</span>
                        <span className="text-xs text-slate-400">
                          {course.totalHours}h
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(course.totalHours / maxHours) * 100}%`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {stats.courseStats.filter((c) => c.totalHours > 0).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">暂无耗时数据</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5 mt-6">
        <h2 className="font-orbitron text-sm text-slate-200 mb-4">月度完成进度</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(30,41,59,0.5)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#00f5d4"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${stats.completionRate * 2.64} ${264 - stats.completionRate * 2.64}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-orbitron font-bold text-radar-cyan text-glow-cyan">
                {stats.completionRate}%
              </span>
              <span className="text-[10px] text-slate-500">完成率</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">已完成</span>
              <span className="text-sm font-medium text-radar-cyan">
                {stats.completedThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">进行中</span>
              <span className="text-sm font-medium text-radar-amber">
                {stats.activeCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">已过期</span>
              <span className="text-sm font-medium text-radar-red">
                {stats.overdueCount}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-radar-border/50">
              <span className="text-sm text-slate-400">历史总计完成</span>
              <span className="text-sm font-medium text-slate-200">
                {stats.totalCompleted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
