import { useMemo, useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { formatTime, getHourFromTime, getMinuteFromTime } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { TaskDetail } from '../tasks/TaskDetail';
import type { Task } from '@/types';

export function TimelineView() {
  const { tasks, people, setSelectedTaskId, selectedTaskId } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = useMemo(() => {
    const allHours: number[] = [];
    tasks.forEach((task) => {
      const startHour = getHourFromTime(task.startTime);
      if (!allHours.includes(startHour)) {
        allHours.push(startHour);
      }
      if (task.endTime) {
        const endHour = getHourFromTime(task.endTime);
        for (let h = startHour; h <= endHour; h++) {
          if (!allHours.includes(h)) {
            allHours.push(h);
          }
        }
      }
    });
    const minHour = Math.min(...allHours, 6);
    const maxHour = Math.max(...allHours, 18);
    const result: number[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      result.push(h);
    }
    return result;
  }, [tasks]);

  const getTasksByHour = (hour: number): Task[] => {
    return tasks.filter((task) => {
      const startHour = getHourFromTime(task.startTime);
      const endHour = task.endTime ? getHourFromTime(task.endTime) : startHour;
      return hour >= startHour && hour <= endHour;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTaskId(null), 300);
  };

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const getTaskTopPosition = (task: Task, hourHeight: number): number => {
    const startHour = getHourFromTime(task.startTime);
    const startMinute = getMinuteFromTime(task.startTime);
    const offsetHour = startHour - hours[0];
    return offsetHour * hourHeight + (startMinute / 60) * hourHeight;
  };

  const getTaskHeight = (task: Task, hourHeight: number): number => {
    if (!task.endTime) return hourHeight * 0.8;
    const startMs = new Date(task.startTime).getTime();
    const endMs = new Date(task.endTime).getTime();
    const durationMs = endMs - startMs;
    const durationHours = durationMs / (1000 * 60 * 60);
    return Math.max(durationHours * hourHeight, hourHeight * 0.6);
  };

  const hourHeight = 120;

  const currentTimeTop = useMemo(() => {
    const startHour = hours[0];
    if (currentHour < startHour || currentHour > hours[hours.length - 1]) return null;
    const offsetHour = currentHour - startHour;
    return offsetHour * hourHeight + (currentMinute / 60) * hourHeight;
  }, [currentHour, currentMinute, hours, hourHeight]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'border-l-warm-300 bg-warm-50',
      claimed: 'border-l-blue-400 bg-blue-50',
      confirmed: 'border-l-emerald-400 bg-emerald-50',
      in_progress: 'border-l-amber-400 bg-amber-50',
      completed: 'border-l-wine bg-wine/5',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 border border-rose-gold/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-gold" />
            <h2 className="font-semibold text-warm-900">婚礼当天时间轴</h2>
          </div>
          <div className="text-sm text-warm-500">
            当前时间：
            <span className="font-mono text-wine font-medium">
              {currentHour.toString().padStart(2, '0')}:{currentMinute.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-card border border-rose-gold/5 overflow-hidden">
        <div className="flex">
          <div className="w-16 sm:w-20 flex-shrink-0 bg-ivory/50 border-r border-rose-gold/10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-center pt-2 text-sm font-mono text-warm-400"
                style={{ height: hourHeight }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            {hours.map((hour, index) => (
              <div
                key={hour}
                className={cn(
                  'border-b border-rose-gold/5',
                  index === hours.length - 1 && 'border-b-0'
                )}
                style={{ height: hourHeight }}
              />
            ))}

            {currentTimeTop !== null && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center"
                style={{ top: currentTimeTop }}
              >
                <div className="w-3 h-3 rounded-full bg-wine -ml-1.5 shadow-md" />
                <div className="flex-1 h-0.5 bg-wine bg-gradient-to-r from-wine to-transparent" />
                <div className="px-2 py-0.5 bg-wine text-white text-xs rounded-full mr-2">
                  现在
                </div>
              </div>
            )}

            <div className="absolute inset-0 p-3">
              {tasks
                .filter((task) => {
                  const startHour = getHourFromTime(task.startTime);
                  return startHour >= hours[0] && startHour <= hours[hours.length - 1];
                })
                .map((task) => {
                  const assignee = people.find((p) => p.id === task.assigneeId);
                  const top = getTaskTopPosition(task, hourHeight);
                  const height = getTaskHeight(task, hourHeight);

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className={cn(
                        'absolute left-3 right-3 rounded-xl border-l-4 p-2.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
                        getStatusColor(task.status),
                        task.priority === 'high' && 'ring-2 ring-wine/30'
                      )}
                      style={{
                        top: top + 6,
                        height: height - 12,
                        minHeight: 50,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 h-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {task.priority === 'high' && (
                              <AlertCircle className="w-3.5 h-3.5 text-wine flex-shrink-0" />
                            )}
                            <h4 className="text-sm font-medium text-warm-900 truncate">
                              {task.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-warm-500">
                            <span className="font-mono">{formatTime(task.startTime)}</span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{task.location}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Badge variant="status" value={task.status} />
                          </div>
                        </div>
                        {assignee && (
                          <Avatar person={assignee} size="sm" className="flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskDetail taskId={selectedTaskId} isOpen={isDetailOpen} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
