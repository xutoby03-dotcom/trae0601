import { Link, useSearchParams } from 'react-router-dom';
import { ListTodo, CheckCircle, Clock, ArrowLeft, AlertCircle, ChevronRight, X } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { formatDate, getRelativeTimeString } from '@/utils/date';
import { useState } from 'react';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export default function TaskList() {
  const { tasks, completeTask, updateTask, getPendingTasks } = useTaskStore();
  const { inspections } = useInspectionStore();
  const { installations } = useInstallationStore();
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterType>('all');

  const inspectionIdParam = searchParams.get('inspectionId');

  const filteredTasks = tasks.filter(task => {
    if (inspectionIdParam && task.inspectionId !== inspectionIdParam) return false;
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getTaskInfo = (task: typeof tasks[0]) => {
    const inspection = inspections.find(i => i.id === task.inspectionId);
    const installation = inspection 
      ? installations.find(inst => inst.id === inspection.installationId)
      : undefined;
    const vehicle = installation 
      ? vehicles.find(v => v.id === installation.vehicleId)
      : undefined;
    const seat = installation 
      ? seats.find(s => s.id === installation.seatId)
      : undefined;

    return { inspection, installation, vehicle, seat };
  };

  const statusConfig = {
    pending: { label: '待处理', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    in_progress: { label: '进行中', bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
    completed: { label: '已完成', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  };

  const pendingCount = getPendingTasks().length;

  const inspectionForFilter = inspectionIdParam ? inspections.find(i => i.id === inspectionIdParam) : null;
  const installationForFilter = inspectionForFilter 
    ? installations.find(inst => inst.id === inspectionForFilter.installationId)
    : null;
  const vehicleForFilter = installationForFilter 
    ? vehicles.find(v => v.id === installationForFilter.vehicleId)
    : null;
  const seatForFilter = installationForFilter 
    ? seats.find(s => s.id === installationForFilter.seatId)
    : null;

  const backToCardUrl = inspectionIdParam ? `/quick-check/${inspectionIdParam}` : null;

  const clearInspectionFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {backToCardUrl ? (
            <Link to={backToCardUrl} className="p-2 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-secondary-500">
              {inspectionIdParam ? '关联任务' : '任务管理'}
            </h1>
            <p className="text-gray-500 mt-1">
              {inspectionIdParam && vehicleForFilter && seatForFilter
                ? `${vehicleForFilter.brand} ${vehicleForFilter.model} - ${seatForFilter.brand} ${seatForFilter.model} · `
                : ''
              }
              共 {tasks.length} 个任务，{pendingCount} 个待处理
            </p>
          </div>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(['all', 'pending', 'in_progress', 'completed'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' ? '全部' : statusConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {inspectionIdParam && (
        <div className="card p-4 bg-primary-50 border border-primary-100 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-primary-700">
                  当前筛选：关联检查记录的任务
                </p>
                {vehicleForFilter && seatForFilter && (
                  <p className="text-sm text-primary-600">
                    {vehicleForFilter.brand} {vehicleForFilter.model} ({vehicleForFilter.plateNumber})
                    {' · '}
                    {seatForFilter.brand} {seatForFilter.model}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {backToCardUrl && (
                <Link to={backToCardUrl} className="btn-primary text-sm py-1.5 px-3 whitespace-nowrap">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  返回检查卡
                </Link>
              )}
              <button
                onClick={clearInspectionFilter}
                className="btn-outline text-sm py-1.5 px-3 whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-1" />
                清除筛选
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' 
              ? (inspectionIdParam ? '该检查记录暂无任务' : '暂无任务') 
              : `暂无${statusConfig[filter].label}任务`
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all'
              ? '完成安装检查后，未通过的项目会自动生成任务'
              : '切换筛选条件查看其他任务'
            }
          </p>
          <div className="flex gap-2 justify-center">
            {inspectionIdParam && (
              <>
                {backToCardUrl && (
                  <Link to={backToCardUrl} className="btn-outline">
                    返回检查卡
                  </Link>
                )}
                <button onClick={clearInspectionFilter} className="btn-secondary">
                  查看全部任务
                </button>
              </>
            )}
            {!inspectionIdParam && (
              <Link to="/inspection" className="btn-primary">
                开始检查
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task, index) => {
            const { vehicle, seat, inspection } = getTaskInfo(task);
            const StatusIcon = statusConfig[task.status].icon;
            const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
            const taskInspectionId = task.inspectionId;
            const isCurrentFilter = inspectionIdParam === taskInspectionId;

            return (
              <div 
                key={task.id}
                className={`card p-4 animate-fade-in-up ${
                  task.status === 'completed' ? 'opacity-60' : ''
                } ${isOverdue ? 'border-red-200' : ''} ${
                  isCurrentFilter ? 'border-primary-300 ring-2 ring-primary-100' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    statusConfig[task.status].bg
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig[task.status].text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`font-semibold ${
                            task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`badge ${statusConfig[task.status].bg} ${statusConfig[task.status].text}`}>
                            {statusConfig[task.status].label}
                          </span>
                          {isOverdue && (
                            <span className="badge bg-red-100 text-red-700">已逾期</span>
                          )}
                          {!inspectionIdParam && inspection && (
                            <Link
                              to={`/tasks?inspectionId=${task.inspectionId}`}
                              className="badge bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              查看关联
                            </Link>
                          )}
                        </div>
                        {vehicle && seat && (
                          <p className="text-sm text-gray-500 mb-2">
                            {vehicle.brand} {vehicle.model} - {seat.brand} {seat.model}
                          </p>
                        )}
                        {!vehicle || !seat ? (
                          <p className="text-sm text-gray-400 mb-2 italic">
                            （关联的车辆或座椅信息不存在）
                          </p>
                        ) : null}
                        <p className={`text-sm ${
                          task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          截止: {formatDate(task.dueDate)}
                          {isOverdue && ` (${getRelativeTimeString(task.dueDate)})`}
                        </span>
                        {task.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            完成: {formatDate(task.completedAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status !== 'completed' && (
                          <>
                            <select
                              value={task.status}
                              onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                            >
                              <option value="pending">待处理</option>
                              <option value="in_progress">进行中</option>
                              <option value="completed">已完成</option>
                            </select>
                            <button
                              onClick={() => completeTask(task.id)}
                              className="btn-success text-sm py-1.5 px-3"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              完成
                            </button>
                          </>
                        )}
                        {task.status === 'completed' && (
                          <button
                            onClick={() => updateTask(task.id, { status: 'pending', completedAt: undefined })}
                            className="btn-outline text-sm py-1.5 px-3"
                          >
                            重新打开
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingCount > 0 && !inspectionIdParam && (
        <Link to="/inspection" className="btn-primary w-full">
          <ChevronRight className="w-4 h-4 mr-2" />
          完成任务后重新检查
        </Link>
      )}

      {inspectionIdParam && backToCardUrl && (
        <Link to={backToCardUrl} className="btn-secondary w-full">
          <ChevronRight className="w-4 h-4 mr-2" />
          返回快速检查卡查看状态
        </Link>
      )}
    </div>
  );
}
