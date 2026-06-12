import { CheckCircle, Clock, AlertTriangle, TrendingUp, Star } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useMemo } from 'react';

export function ReviewStats() {
  const { tasks, people, reviewRecords } = useTaskStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const missed = reviewRecords.filter((r) => r.type === 'missed').length;
    const overtime = reviewRecords.filter((r) => r.type === 'overtime').length;

    const highPriorityTotal = tasks.filter((t) => t.priority === 'high').length;
    const highPriorityCompleted = tasks.filter((t) => t.priority === 'high' && t.isCompleted).length;
    const highPriorityRate = highPriorityTotal > 0 ? Math.round((highPriorityCompleted / highPriorityTotal) * 100) : 0;

    return {
      total,
      completed,
      completionRate,
      missed,
      overtime,
      highPriorityTotal,
      highPriorityCompleted,
      highPriorityRate,
    };
  }, [tasks, reviewRecords]);

  const personStats = useMemo(() => {
    return people
      .map((person) => {
        const personTasks = tasks.filter((t) => t.assigneeId === person.id);
        const total = personTasks.length;
        const completed = personTasks.filter((t) => t.isCompleted).length;
        const onTime = personTasks.filter((t) => {
          if (!t.isCompleted || !t.completedAt || !t.endTime) return false;
          return new Date(t.completedAt) <= new Date(t.endTime);
        }).length;

        let rating = 0;
        if (total > 0) {
          const completionScore = (completed / total) * 60;
          const onTimeScore = total > 0 ? (onTime / total) * 40 : 0;
          rating = Math.round(completionScore + onTimeScore);
        }

        return {
          person,
          total,
          completed,
          onTime,
          rating,
        };
      })
      .filter((p) => p.total > 0)
      .sort((a, b) => b.rating - a.rating);
  }, [tasks, people]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-rose-gold/5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {stats.completionRate}%
            </span>
          </div>
          <p className="text-sm text-warm-500">完成率</p>
          <p className="text-xs text-warm-400 mt-1">
            {stats.completed} / {stats.total} 项任务
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-rose-gold/5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-wine/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-wine" />
            </div>
            <span className="text-2xl font-bold text-wine">
              {stats.highPriorityRate}%
            </span>
          </div>
          <p className="text-sm text-warm-500">高优完成率</p>
          <p className="text-xs text-warm-400 mt-1">
            {stats.highPriorityCompleted} / {stats.highPriorityTotal} 项
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-rose-gold/5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {stats.missed}
            </span>
          </div>
          <p className="text-sm text-warm-500">遗漏事项</p>
          <p className="text-xs text-warm-400 mt-1">需要改进</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-rose-gold/5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.overtime}
            </span>
          </div>
          <p className="text-sm text-warm-500">超时环节</p>
          <p className="text-xs text-warm-400 mt-1">延误记录</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-rose-gold/5 overflow-hidden">
        <div className="p-5 border-b border-rose-gold/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-gold" />
            <h3 className="font-semibold text-warm-900">人员完成情况</h3>
          </div>
        </div>
        <div className="p-5">
          {personStats.length === 0 ? (
            <p className="text-center text-warm-400 py-8">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {personStats.map((stat, index) => (
                <div key={stat.person.id} className="flex items-center gap-4">
                  <div className="w-6 text-center text-sm font-bold text-warm-400">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-goldLight to-rose-gold flex items-center justify-center text-white text-lg flex-shrink-0">
                    {stat.person.avatar || stat.person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-warm-800">
                        {stat.person.name}
                      </span>
                      <span className="text-sm font-semibold text-rose-gold">
                        {stat.rating}分
                      </span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-goldLight to-rose-gold rounded-full transition-all duration-500"
                        style={{ width: `${stat.rating}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-warm-500">
                      <span>完成 {stat.completed}/{stat.total}</span>
                      <span>准时 {stat.onTime} 项</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
