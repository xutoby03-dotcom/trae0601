import { useState, useMemo } from 'react';
import { AlertTriangle, Clock, MapPin, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import MemberAvatar from '@/components/MemberAvatar';
import StatusBadge from '@/components/StatusBadge';
import type { MemberWorkload, Task, TimelineNode, Member, TimeConflict } from '@/types';

export default function WorkloadPage() {
  const timelineNodes = useWeddingStore(state => state.timelineNodes);
  const tasks = useWeddingStore(state => state.tasks);
  const members = useWeddingStore(state => state.members);

  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const getTaskTimeRange = (task: Task): { start: number; end: number } | null => {
    const node = timelineNodes.find(n => n.id === task.timelineNodeId);
    if (!node) return null;
    const timeMatch = node.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!timeMatch) return null;
    return { start: parseTimeToMinutes(timeMatch[1]), end: parseTimeToMinutes(timeMatch[2]) };
  };

  const checkTimeOverlap = (task1: Task, task2: Task): number => {
    const range1 = getTaskTimeRange(task1);
    const range2 = getTaskTimeRange(task2);
    if (!range1 || !range2) return 0;
    const overlapStart = Math.max(range1.start, range2.start);
    const overlapEnd = Math.min(range1.end, range2.end);
    return overlapStart < overlapEnd ? overlapEnd - overlapStart : 0;
  };

  const workloads = useMemo((): MemberWorkload[] => {
    return members.map(member => {
      const memberTasks = tasks.filter(
        t => t.responsibleId === member.id || t.backupId === member.id
      );
      const confirmedTasks = memberTasks.filter(t => t.status === 'confirmed' || t.status === 'completed').length;
      const pendingTasks = memberTasks.filter(t => t.status === 'pending' || t.status === 'late').length;

      const conflicts: TimeConflict[] = [];
      for (let i = 0; i < memberTasks.length; i++) {
        for (let j = i + 1; j < memberTasks.length; j++) {
          const overlap = checkTimeOverlap(memberTasks[i], memberTasks[j]);
          if (overlap > 0) {
            const existingConflict = conflicts.find(c =>
              c.tasks.some(t => t.id === memberTasks[i].id) &&
              c.tasks.some(t => t.id === memberTasks[j].id)
            );
            if (!existingConflict) {
              conflicts.push({
                memberId: member.id,
                memberName: member.name,
                tasks: [memberTasks[i], memberTasks[j]],
                overlapMinutes: overlap,
              });
            }
          }
        }
      }

      return {
        memberId: member.id,
        memberName: member.name,
        memberRole: member.role,
        totalTasks: memberTasks.length,
        confirmedTasks,
        pendingTasks,
        conflicts,
        tasks: memberTasks,
      };
    }).sort((a, b) => b.totalTasks - a.totalTasks);
  }, [members, tasks, timelineNodes]);

  const getMemberById = (id: string) => members.find(m => m.id === id);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hasConflict' | 'highLoad'>('all');

  const filteredWorkloads = workloads.filter(w => {
    if (filter === 'hasConflict') return w.conflicts.length > 0;
    if (filter === 'highLoad') return w.totalTasks >= 3;
    return true;
  });

  const maxTasks = Math.max(...workloads.map(w => w.totalTasks), 1);

  const getTaskNode = (task: Task) => {
    return timelineNodes.find(n => n.id === task.timelineNodeId);
  };

  const getLoadColor = (total: number) => {
    if (total >= 4) return 'from-wine to-rose-gold';
    if (total >= 3) return 'from-champagne-gold to-rose-gold';
    if (total >= 2) return 'from-sage to-champagne-gold';
    return 'from-sage to-forest';
  };

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">
          负载统计
        </h2>
        <p className="text-gray-600">
          查看每位成员的任务负载和时间冲突情况
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-rose-gold text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            全部 ({workloads.length})
          </button>
          <button
            onClick={() => setFilter('hasConflict')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'hasConflict'
                ? 'bg-wine text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            有冲突 ({workloads.filter(w => w.conflicts.length > 0).length})
          </button>
          <button
            onClick={() => setFilter('highLoad')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'highLoad'
                ? 'bg-champagne-gold text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            高负载 ({workloads.filter(w => w.totalTasks >= 3).length})
          </button>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-forest" />
            <span>低负载 (1-2项)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-champagne-gold" />
            <span>中负载 (3项)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-wine" />
            <span>高负载 (4+项)</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredWorkloads.map((workload, index) => (
          <WorkloadCard
            key={workload.memberId}
            workload={workload}
            index={index}
            isExpanded={expandedMember === workload.memberId}
            onToggle={() => setExpandedMember(
              expandedMember === workload.memberId ? null : workload.memberId
            )}
            maxTasks={maxTasks}
            getLoadColor={getLoadColor}
            getTaskNode={getTaskNode}
            getMemberById={getMemberById}
          />
        ))}
      </div>

      <div className="mt-12">
        <h3 className="font-display text-2xl font-bold text-gray-800 mb-6">
          ⚠️ 时间冲突详情
        </h3>
        {workloads.flatMap(w => w.conflicts).length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {workloads.flatMap(w => w.conflicts).map((conflict, index) => {
              const member = getMemberById(conflict.memberId);
              const node1 = getTaskNode(conflict.tasks[0]);
              const node2 = getTaskNode(conflict.tasks[1]);

              return (
                <div
                  key={index}
                  className="card p-5 border-wine/30 bg-wine/5 animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-wine" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {member?.name} 存在时间冲突
                      </h4>
                      <p className="text-sm text-wine">
                        重叠时间约 {conflict.overlapMinutes} 分钟
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {conflict.tasks.map((task, taskIndex) => {
                      const node = getTaskNode(task);
                      return (
                        <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <div className={`w-8 h-8 rounded-lg ${
                            taskIndex === 0 ? 'bg-rose-gold/10' : 'bg-champagne-gold/10'
                          } flex items-center justify-center flex-shrink-0`}>
                            <User className={`w-4 h-4 ${
                              taskIndex === 0 ? 'text-rose-gold' : 'text-champagne-gold'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-800">{task.name}</h5>
                              <StatusBadge status={task.status} size="sm" />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {node?.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {task.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 bg-wine/10 rounded-lg">
                    <p className="text-sm text-wine font-medium">
                      💡 建议：将其中一项任务分配给其他成员，或调整任务时间
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-forest" />
            </div>
            <h4 className="font-display text-xl font-semibold text-gray-800 mb-2">
              暂无时间冲突
            </h4>
            <p className="text-gray-500">
              所有成员的任务安排合理，没有时间重叠
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface WorkloadCardProps {
  workload: MemberWorkload;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  maxTasks: number;
  getLoadColor: (total: number) => string;
  getTaskNode: (task: Task) => TimelineNode | undefined;
  getMemberById: (id: string) => Member | undefined;
}

function WorkloadCard({
  workload,
  index,
  isExpanded,
  onToggle,
  maxTasks,
  getLoadColor,
  getTaskNode,
  getMemberById,
}: WorkloadCardProps) {
  const member = getMemberById(workload.memberId);
  if (!member) return null;

  const loadPercentage = (workload.totalTasks / maxTasks) * 100;
  const responsibleTasks = workload.tasks.filter(t => t.responsibleId === workload.memberId);
  const backupTasks = workload.tasks.filter(t => t.backupId === workload.memberId);

  return (
    <div
      className={`card overflow-hidden animate-fade-in-up transition-all duration-300 ${
        workload.conflicts.length > 0 ? 'border-wine/30' : ''
      }`}
      style={{ opacity: 0, animationDelay: `${index * 0.05}s` }}
    >
      <div
        onClick={onToggle}
        className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-6">
          <MemberAvatar member={member} size="lg" showRole />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-display text-xl font-semibold text-gray-800">
                {member.name}
              </h4>
              {workload.conflicts.length > 0 && (
                <span className="badge badge-late">
                  {workload.conflicts.length} 处冲突
                </span>
              )}
              {workload.totalTasks >= 4 && (
                <span className="badge bg-champagne-gold/10 text-champagne-gold">
                  高负载
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>总任务：{workload.totalTasks} 项</span>
              <span className="text-forest">已确认：{workload.confirmedTasks} 项</span>
              <span className="text-champagne-gold">待处理：{workload.pendingTasks} 项</span>
            </div>
          </div>

          <div className="w-64 mr-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>负载度</span>
              <span className="font-medium">{workload.totalTasks} 项</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getLoadColor(workload.totalTasks)} transition-all duration-500`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-6 pb-6 animate-fade-in" style={{ opacity: 0 }}>
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-gold" />
                负责的任务 ({responsibleTasks.length})
              </h5>
              <div className="space-y-3">
                {responsibleTasks.map((task, i) => {
                  const node = getTaskNode(task);
                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-rose-pale/30 rounded-lg animate-fade-in-up"
                      style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-medium text-gray-800">{task.name}</h6>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {node?.name} · {node?.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {task.location}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {responsibleTasks.length === 0 && (
                  <p className="text-center text-gray-400 py-4">暂无负责任务</p>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                作为备用 ({backupTasks.length})
              </h5>
              <div className="space-y-3">
                {backupTasks.map((task, i) => {
                  const node = getTaskNode(task);
                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-gray-50 rounded-lg animate-fade-in-up"
                      style={{ opacity: 0, animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-medium text-gray-800">{task.name}</h6>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {node?.name} · {node?.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {task.location}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {backupTasks.length === 0 && (
                  <p className="text-center text-gray-400 py-4">暂无备用任务</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
