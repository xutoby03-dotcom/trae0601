import { useMemo } from 'react';
import { AlertTriangle, Clock, User, MapPin, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import MemberAvatar from '@/components/MemberAvatar';
import StatusBadge from '@/components/StatusBadge';

export default function MonitorPage() {
  const currentTime = useWeddingStore(state => state.currentTime);
  const timelineNodes = useWeddingStore(state => state.timelineNodes);
  const tasks = useWeddingStore(state => state.tasks);
  const handovers = useWeddingStore(state => state.handovers);
  const members = useWeddingStore(state => state.members);
  const resetAllData = useWeddingStore(state => state.resetAllData);
  const updateTaskStatus = useWeddingStore(state => state.updateTaskStatus);

  const { lateTasks, pendingTasks, unconfirmedHandovers, workloads } = useMemo(() => {
    const late = tasks.filter(t => t.status === 'late');
    const pending = tasks.filter(t => t.status === 'pending');
    const unconfirmed = handovers.filter(h => !h.fromConfirmed || !h.toConfirmed);

    const workloadList = members.map(member => {
      const memberTasks = tasks.filter(
        t => t.responsibleId === member.id || t.backupId === member.id
      );
      const confirmedTasks = memberTasks.filter(t => t.status === 'confirmed' || t.status === 'completed').length;
      const pendingTasks = memberTasks.filter(t => t.status === 'pending' || t.status === 'late').length;

      return {
        memberId: member.id,
        memberName: member.name,
        memberRole: member.role,
        totalTasks: memberTasks.length,
        confirmedTasks,
        pendingTasks,
        conflicts: [] as any[],
        tasks: memberTasks,
      };
    }).sort((a, b) => b.totalTasks - a.totalTasks);

    return {
      lateTasks: late,
      pendingTasks: pending,
      unconfirmedHandovers: unconfirmed,
      workloads: workloadList,
    };
  }, [tasks, handovers, members]);

  const getTasksByNodeId = (nodeId: string) => tasks.filter(t => t.timelineNodeId === nodeId);
  const getMemberById = (id: string) => members.find(m => m.id === id);

  const sortedNodes = [...timelineNodes].sort((a, b) => a.sortOrder - b.sortOrder);

  const getCurrentNode = () => {
    const currentMinutes = parseInt(currentTime.replace(':', ''));
    for (const node of sortedNodes) {
      const timeMatch = node.time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      if (timeMatch) {
        const start = parseInt(timeMatch[1].replace(':', ''));
        const end = parseInt(timeMatch[2].replace(':', ''));
        if (currentMinutes >= start && currentMinutes <= end) {
          return node;
        }
      }
    }
    return sortedNodes[0];
  };

  const currentNode = getCurrentNode();
  const currentNodeTasks = getTasksByNodeId(currentNode.id);

  const lateMembers = lateTasks.map(t => getMemberById(t.responsibleId)).filter(Boolean);

  const getNodeStats = (nodeId: string) => {
    const tasks = getTasksByNodeId(nodeId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const confirmed = tasks.filter(t => t.status === 'confirmed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const late = tasks.filter(t => t.status === 'late').length;
    return { total, completed, confirmed, pending, late };
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      resetAllData();
    }
  };

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">
            协调监控
          </h2>
          <p className="text-gray-600">
            总协调人专用监控面板，实时掌握全场动态
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-wine hover:bg-wine/5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重置数据
        </button>
      </div>

      {(lateTasks.length > 0 || unconfirmedHandovers.length > 0) && (
        <div className="mb-8 animate-fade-in-up" style={{ opacity: 0 }}>
          <div className="bg-wine/5 border border-wine/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-wine animate-pulse-slow" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-wine">
                  需要立即关注
                </h3>
                <p className="text-sm text-wine/70">
                  共 {lateTasks.length} 项任务迟到，{unconfirmedHandovers.length} 项交接待确认
                </p>
              </div>
            </div>

            {lateTasks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-wine mb-3">🚨 迟到任务</h4>
                <div className="grid grid-cols-2 gap-3">
                  {lateTasks.map((task, index) => {
                    const responsible = getMemberById(task.responsibleId);
                    const node = timelineNodes.find(n => n.id === task.timelineNodeId);

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl p-4 border border-wine/20 animate-fade-in-up"
                        style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{task.name}</h5>
                          <StatusBadge status="late" size="sm" />
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{node?.name} · {task.remindTime}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MemberAvatar member={responsible} size="sm" showName />
                            {responsible && (
                              <a
                                href={`tel:${responsible.phone}`}
                                className="p-1.5 bg-rose-gold/10 text-rose-gold rounded-lg hover:bg-rose-gold/20 transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'confirmed')}
                            className="text-xs px-3 py-1.5 bg-forest/10 text-forest rounded-lg hover:bg-forest/20 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                            标记处理
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {unconfirmedHandovers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-wine mb-3">📦 待确认交接</h4>
                <div className="grid grid-cols-2 gap-3">
                  {unconfirmedHandovers.map((handover, index) => {
                    const item = useWeddingStore.getState().items.find(i => i.id === handover.itemId);
                    const fromMember = getMemberById(handover.fromMemberId);
                    const toMember = getMemberById(handover.toMemberId);

                    return (
                      <div
                        key={handover.id}
                        className="bg-white rounded-xl p-4 border border-champagne-gold/30 animate-fade-in-up"
                        style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{item?.name}</h5>
                          <span className="text-xs text-champagne-gold">待确认</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{fromMember?.name}</span>
                          <span>→</span>
                          <span>{toMember?.name}</span>
                        </div>
                        {!handover.fromConfirmed && (
                          <p className="text-xs text-wine mt-2">⚠️ 交出人未确认</p>
                        )}
                        {!handover.toConfirmed && (
                          <p className="text-xs text-wine mt-2">⚠️ 接收人未确认</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-gold/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-rose-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-500">当前环节</p>
              <p className="font-display text-2xl font-bold text-gray-800">{currentNode.name}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-champagne-gold" />
              {currentNode.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-gold" />
              {currentNode.location}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-champagne-gold/10 flex items-center justify-center">
              <User className="w-6 h-6 text-champagne-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-500">当前任务</p>
              <p className="font-display text-2xl font-bold text-gray-800">{currentNodeTasks.length} 项</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">已完成</span>
              <span className="text-forest font-medium">
                {currentNodeTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">进行中</span>
              <span className="text-champagne-gold font-medium">
                {currentNodeTasks.filter(t => t.status === 'confirmed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">待确认</span>
              <span className="text-gray-600 font-medium">
                {currentNodeTasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">已迟到</span>
              <span className="text-wine font-medium">
                {currentNodeTasks.filter(t => t.status === 'late').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-wine/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-wine" />
            </div>
            <div>
              <p className="text-sm text-gray-500">异常情况</p>
              <p className="font-display text-2xl font-bold text-gray-800">
                {lateTasks.length + unconfirmedHandovers.length} 项
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">迟到任务</span>
              <span className="text-wine font-medium">{lateTasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">待确认交接</span>
              <span className="text-champagne-gold font-medium">{unconfirmedHandovers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">待确认任务</span>
              <span className="text-gray-600 font-medium">{pendingTasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">时间冲突</span>
              <span className="text-wine font-medium">
                {workloads.reduce((acc, w) => acc + w.conflicts.length, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-gray-800 mb-4">
          全场进度总览
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {sortedNodes.map((node, index) => {
            const stats = getNodeStats(node.id);
            const progress = stats.total > 0 ? Math.round(((stats.completed + stats.confirmed) / stats.total) * 100) : 0;

            return (
              <div
                key={node.id}
                className="card p-5 animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-gold/20 to-champagne-gold/20 flex items-center justify-center font-bold text-rose-gold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{node.name}</h4>
                    <p className="text-xs text-gray-500">{node.time}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.late > 0
                          ? 'bg-gradient-to-r from-wine to-rose-gold'
                          : 'bg-gradient-to-r from-rose-gold to-champagne-gold'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-forest" />
                    <span className="text-gray-600">{stats.completed} 完成</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-champagne-gold" />
                    <span className="text-gray-600">{stats.confirmed} 进行</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-300" />
                    <span className="text-gray-600">{stats.pending} 待确认</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-wine" />
                    <span className="text-gray-600">{stats.late} 迟到</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lateMembers.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl font-semibold text-wine mb-4">
            🚨 迟到人员名单
          </h3>
          <div className="flex flex-wrap gap-3">
            {[...new Set(lateMembers.map(m => m?.id))].map((id, index) => {
              const member = lateMembers.find(m => m?.id === id);
              if (!member) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 px-4 py-3 bg-wine/5 border border-wine/20 rounded-xl animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                >
                  <MemberAvatar member={member} size="md" showName showRole />
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 bg-wine/10 text-wine rounded-lg hover:bg-wine/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
