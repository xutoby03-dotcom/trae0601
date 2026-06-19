import { Link } from 'react-router-dom';
import { Plus, Wrench, AlertTriangle, MapPin, User, Calendar, ChevronRight, DollarSign } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAreaStore } from '../../store/useAreaStore';
import { formatDate, formatCurrency } from '../../utils/date';
import StatusBadge from '../../components/StatusBadge';
import type { TaskStatus } from '../../types';

const columns: { status: TaskStatus; title: string; color: string; bgColor: string }[] = [
  { status: 'pending', title: '待处理', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { status: 'in_progress', title: '进行中', color: 'text-primary-600', bgColor: 'bg-primary-100' },
  { status: 'review', title: '待复查', color: 'text-warning-600', bgColor: 'bg-warning-100' },
  { status: 'completed', title: '已完成', color: 'text-success-600', bgColor: 'bg-success-100' },
];

export default function TaskList() {
  const { tasks } = useTaskStore();
  const { areas } = useAreaStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">维修任务</h2>
          <p className="text-gray-500 text-sm">管理渗水维修任务，跟踪进度和复查</p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新增任务
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm animate-slide-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-warning-50 flex items-center justify-center mb-4">
            <Wrench className="w-10 h-10 text-warning-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">还没有维修任务</h3>
          <p className="text-gray-500 text-sm mb-6">发现渗水问题时创建维修任务进行跟踪</p>
          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-warning-500 text-white rounded-lg font-medium hover:bg-warning-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            创建第一个任务
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {columns.map((col, colIndex) => {
            const columnTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="animate-slide-up" style={{ animationDelay: `${colIndex * 100}ms` }}>
                <div className={`${col.bgColor} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${col.color}`}>{col.title}</h3>
                    <span className="px-2 py-0.5 bg-white/60 rounded-full text-xs font-medium text-gray-600">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                <div className="bg-white/50 rounded-b-xl p-3 space-y-3 min-h-[200px] border border-t-0 border-gray-100">
                  {columnTasks.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">暂无任务</p>
                  ) : (
                    columnTasks.map((task) => {
                      const area = areas.find((a) => a.id === task.areaId);
                      return (
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          className={`block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
                            task.isRepeatedAnomaly
                              ? 'ring-2 ring-danger-400 animate-glow-red'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight pr-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {task.title}
                            </h4>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 flex-shrink-0 transition-colors mt-0.5" />
                          </div>

                          {task.isRepeatedAnomaly && (
                            <div className="flex items-center gap-1 mb-2 px-2 py-0.5 bg-danger-100 rounded w-fit">
                              <AlertTriangle className="w-3 h-3 text-danger-600" />
                              <span className="text-xs font-medium text-danger-600">连续异常</span>
                            </div>
                          )}

                          <div className="space-y-1.5 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{area?.name || '未知区域'}</span>
                            </div>
                            {task.responsiblePerson && (
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-gray-400" />
                                <span>{task.responsiblePerson}</span>
                              </div>
                            )}
                            {task.estimatedCost !== undefined && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <span>
                                  预估 {formatCurrency(task.estimatedCost)}
                                  {task.actualCost !== undefined &&
                                    ` · 实付 ${formatCurrency(task.actualCost)}`}
                                </span>
                              </div>
                            )}
                            {task.reviewDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>复查：{formatDate(task.reviewDate)}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3">
                            <StatusBadge type="task" value={task.status} />
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
