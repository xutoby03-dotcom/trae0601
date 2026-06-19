import { AlertTriangle, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { TASK_TYPE_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/constants';
import { cn } from '@/lib/utils';

export default function AnomalyList() {
  const { tasks, devices } = useAppStore();

  const pendingTasks = tasks.filter((t) => t.status !== 'done');

  const grouped = pendingTasks.reduce<Record<string, typeof pendingTasks>>((acc, task) => {
    if (!acc[task.device_id]) acc[task.device_id] = [];
    acc[task.device_id].push(task);
    return acc;
  }, {});

  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  const groupedEntries = Object.entries(grouped).sort((a, b) => {
    const aHigh = a[1].some((t) => t.priority === 'high');
    const bHigh = b[1].some((t) => t.priority === 'high');
    if (aHigh && !bHigh) return -1;
    if (!aHigh && bHigh) return 1;
    return b[1].length - a[1].length;
  });

  return (
    <div className="card p-5 animate-fade-in-up delay-150">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          异常设备列表
        </h3>
        <span className="tag bg-danger-50 text-danger-500">
          {groupedEntries.length} 台异常
        </span>
      </div>

      {groupedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-success-600">一切正常</p>
          <p className="text-sm text-gray-400 mt-1">暂无异常设备，继续保持</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {groupedEntries.map(([deviceId, deviceTasks]) => {
            const device = deviceMap.get(deviceId);
            const hasHigh = deviceTasks.some((t) => t.priority === 'high');

            return (
              <div
                key={deviceId}
                className={cn(
                  'anomaly-card p-4',
                  hasHigh && 'border-pulse',
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-danger-500 shrink-0 mt-0.5" />
                    <p className="font-semibold text-gray-800">{device?.location ?? '未知位置'}</p>
                  </div>
                  {hasHigh && (
                    <span className="tag bg-danger-500 text-white animate-pulse-slow">
                      高优先级
                    </span>
                  )}
                </div>

                {device && (
                  <p className="text-xs text-gray-400 mb-3 ml-6">{device.model}</p>
                )}

                <div className="space-y-2 ml-6">
                  {deviceTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60 border border-danger-100/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'tag text-xs',
                            task.priority === 'high' && 'bg-danger-50 text-danger-500',
                            task.priority === 'medium' && 'bg-warning-50 text-warning-500',
                            task.priority === 'low' && 'bg-gray-100 text-gray-500',
                          )}>
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {TASK_TYPE_LABELS[task.task_type]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{task.description}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>负责人：{task.assignee}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
