import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  PRIORITY_COLORS,
  PRIORITY_LABEL,
  TASK_TRIGGER_OPTIONS,
  MATERIAL_LABEL_MAP,
  CLEAN_METHOD_LABEL_MAP,
  CLEAN_ACTION_OPTIONS,
  DAMAGE_TYPE_OPTIONS,
  formatDateShort,
  cleanMethodToActions,
} from '@/utils/constants';
import type { TaskTrigger, TaskPriority, Toy, CleaningRecord, CleanMethodAction, DamageType } from '@/types';

const triggerCardStyles: Record<TaskTrigger, string> = {
  teething: 'bg-gradient-to-br from-alert-400 to-alert-300 text-white shadow-glow-red',
  flu: 'bg-gradient-to-br from-orange-500 to-alert-400 text-white shadow-soft',
  visitor: 'bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-soft',
  manual: 'bg-gradient-to-br from-gray-400 to-gray-300 text-white shadow-soft',
};

const ACTION_COLORS: Record<CleanMethodAction, string> = {
  water: 'bg-clean-100 text-clean-500',
  wipe: 'bg-mint-100 text-mint-500',
  uv: 'bg-baby-100 text-baby-500',
  dry: 'bg-woody-100 text-woody-500',
};

export default function TasksPage() {
  const { tasks, toys, cleaningRecords, alerts, generateTaskByTrigger, createTask, toggleTaskItem, completeTask, addCleaningRecord } = useAppStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('任务已生成');
  const [showManualForm, setShowManualForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [manualTitle, setManualTitle] = useState('');
  const [manualToyIds, setManualToyIds] = useState<string[]>([]);
  const [manualPriority, setManualPriority] = useState<TaskPriority>('normal');

  const [activeAlertPanel, setActiveAlertPanel] = useState<string | null>(null);
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType | null>(null);
  const [hasOdorSelected, setHasOdorSelected] = useState(false);

  const showSuccessToast = (msg: string = '任务已生成') => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleTriggerClick = (trigger: TaskTrigger) => {
    if (trigger === 'manual') {
      setShowManualForm(true);
      return;
    }
    const result = generateTaskByTrigger(trigger);
    if (result) {
      showSuccessToast('任务已生成');
    } else {
      showSuccessToast('暂无可匹配的玩具');
    }
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleManualToy = (toyId: string) => {
    setManualToyIds(prev =>
      prev.includes(toyId) ? prev.filter(id => id !== toyId) : [...prev, toyId]
    );
  };

  const handleCreateManual = () => {
    if (!manualTitle.trim() || manualToyIds.length === 0) return;
    createTask(manualTitle.trim(), manualToyIds, 'manual', manualPriority);
    setManualTitle('');
    setManualToyIds([]);
    setManualPriority('normal');
    setShowManualForm(false);
    showSuccessToast('任务已创建');
  };

  const getToyById = (id: string): Toy | undefined => toys.find(t => t.id === id);
  const getTriggerMeta = (trigger: TaskTrigger) => TASK_TRIGGER_OPTIONS.find(t => t.value === trigger);

  const getRecordForTaskToy = useMemo(() => {
    const map = new Map<string, CleaningRecord>();
    for (const task of tasks) {
      for (const toyId of task.toyIds) {
        const record = cleaningRecords
          .filter(r => r.toyId === toyId && new Date(r.date) >= new Date(task.createdAt))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (record) {
          map.set(`${task.id}-${toyId}`, record);
        }
      }
    }
    return map;
  }, [tasks, cleaningRecords]);

  const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const isToday = (dateStr: string): boolean => {
    const d = new Date(dateStr);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const hasActiveAlert = useMemo(() => {
    const set = new Set<string>();
    for (const alert of alerts) {
      if (alert.status === 'pending') set.add(alert.toyId);
    }
    return set;
  }, [alerts]);

  const openAlertPanel = (taskId: string, toyId: string) => {
    setActiveAlertPanel(`${taskId}-${toyId}`);
    setSelectedDamageType(null);
    setHasOdorSelected(false);
  };

  const closeAlertPanel = () => {
    setActiveAlertPanel(null);
    setSelectedDamageType(null);
    setHasOdorSelected(false);
  };

  const handleSaveQuickAlert = (taskId: string, toyId: string) => {
    if (!selectedDamageType && !hasOdorSelected) {
      showSuccessToast('请选择异常类型');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    const toy = getToyById(toyId);
    const methods = toy
      ? cleanMethodToActions[toy.cleanMethod] || ['wipe' as CleanMethodAction]
      : ['wipe' as CleanMethodAction];

    addCleaningRecord({
      toyId,
      date: new Date().toISOString(),
      methods,
      hasDamage: !!selectedDamageType,
      hasOdor: hasOdorSelected,
      damageType: selectedDamageType || undefined,
      notes: `任务「${task?.title || ''}」快记异常`,
    });

    if (task && !task.completedToyIds.includes(toyId)) {
      toggleTaskItem(taskId, toyId);
    }

    showSuccessToast('⚠️ 异常已记录');
    closeAlertPanel();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder: Record<TaskPriority, number> = { critical: 0, urgent: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 font-display mb-2">
          消毒任务清单 📋
        </h1>
        <p className="text-gray-500 text-lg">智能场景一键生成重点任务</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TASK_TRIGGER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleTriggerClick(opt.value)}
            className={`${triggerCardStyles[opt.value]} rounded-2xl-plus p-5 text-left transition-all duration-300 hover:scale-105 hover:shadow-card-hover active:scale-95`}
          >
            <div className="text-4xl mb-3">{opt.icon}</div>
            <div className="text-lg font-bold mb-1">{opt.label}</div>
            <div className="text-xs opacity-90">{PRIORITY_LABEL[opt.priority]}优先级</div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 && (
          <div className="card-base p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl text-gray-500">暂无任务，点击上方卡片快速创建</p>
          </div>
        )}

        {sortedTasks.map((task, idx) => {
          const triggerMeta = getTriggerMeta(task.trigger);
          const progress = task.toyIds.length > 0
            ? Math.round((task.completedToyIds.length / task.toyIds.length) * 100)
            : 0;
          const isExpanded = expandedTasks.has(task.id) || !task.completed;
          const isCompleted = task.completed;

          return (
            <div
              key={task.id}
              className={`card-base overflow-hidden animate-fade-in-up ${isCompleted ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`${PRIORITY_COLORS[task.priority]} pl-0`}>
                <div className="p-5 pl-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className={`text-xl font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </h3>
                        {triggerMeta && (
                          <span className="tag bg-baby-100 text-baby-500">
                            {triggerMeta.icon} {triggerMeta.label}
                          </span>
                        )}
                        <span className={`tag ${
                          task.priority === 'critical' ? 'bg-alert-100 text-alert-400' :
                          task.priority === 'urgent' ? 'bg-amber-100 text-amber-500' :
                          'bg-clean-100 text-clean-500'
                        }`}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                        <span>📅 截止：{formatDateShort(task.dueDate)}</span>
                        <span>🧸 {task.completedToyIds.length}/{task.toyIds.length} 已完成</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTaskExpand(task.id)}
                      className="btn-ghost shrink-0"
                    >
                      {isExpanded ? '收起' : '展开'}
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                      <span>完成进度</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          progress === 100
                            ? 'bg-gradient-to-r from-mint-400 to-mint-300'
                            : task.priority === 'critical'
                            ? 'bg-gradient-to-r from-alert-400 to-alert-300'
                            : task.priority === 'urgent'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                            : 'bg-gradient-to-r from-clean-400 to-clean-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-2 mb-4 pt-2 border-t border-gray-100">
                      {task.toyIds.map(toyId => {
                        const toy = getToyById(toyId);
                        if (!toy) return null;
                        const isDone = task.completedToyIds.includes(toyId);
                        const record = getRecordForTaskToy.get(`${task.id}-${toyId}`);
                        const materialMeta = MATERIAL_LABEL_MAP.get(toy.material);
                        const cleanMeta = CLEAN_METHOD_LABEL_MAP.get(toy.cleanMethod);
                        const todayRecorded = record && isToday(record.date);
                        const hasAlert = hasActiveAlert.has(toyId);
                        const panelKey = `${task.id}-${toyId}`;
                        const isPanelOpen = activeAlertPanel === panelKey;

                        const latestAlert = alerts
                          .filter(a => a.toyId === toyId && a.status === 'pending')
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                        return (
                          <div key={toyId} className="relative">
                            <div
                              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                                hasAlert
                                  ? 'bg-alert-50 border border-alert-200 animate-pulse-glow'
                                  : isDone
                                  ? 'bg-mint-50 border border-mint-100'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                              }`}
                            >
                              <label className="flex items-center cursor-pointer shrink-0 mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => !isCompleted && toggleTaskItem(task.id, toyId)}
                                  disabled={isCompleted}
                                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-mint-500 focus:ring-mint-300 focus:ring-4 cursor-pointer"
                                />
                              </label>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className={`font-medium ${hasAlert ? 'text-alert-500 font-semibold' : isDone ? 'text-gray-500' : 'text-gray-700'}`}>
                                    {toy.name}
                                  </div>
                                  {hasAlert && latestAlert && (
                                    <span className="tag bg-alert-100 text-alert-400 font-semibold animate-bounce-soft">
                                      ⚠️ 建议停用
                                    </span>
                                  )}
                                  {todayRecorded && (
                                    <span className="tag bg-mint-100 text-mint-500 text-[10px] animate-bounce-soft">
                                      ✅ 今天已记
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                  {materialMeta && (
                                    <span className={`tag ${materialMeta.color}`}>
                                      {materialMeta.icon} {materialMeta.label}
                                    </span>
                                  )}
                                  {cleanMeta && (
                                    <span className="tag bg-clean-100 text-clean-500">
                                      {cleanMeta.icon} {cleanMeta.label}
                                    </span>
                                  )}
                                  {hasAlert && latestAlert && (
                                    <span className="tag bg-alert-100 text-alert-400">
                                      {DAMAGE_TYPE_OPTIONS.find(d => d.value === latestAlert.type)?.icon}{' '}
                                      {DAMAGE_TYPE_OPTIONS.find(d => d.value === latestAlert.type)?.label}
                                    </span>
                                  )}
                                </div>
                                {(record || hasAlert) && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-mint-100/50">
                                    {record && record.methods.map(method => {
                                      const meta = CLEAN_ACTION_OPTIONS.find(opt => opt.value === method);
                                      return meta ? (
                                        <span key={method} className={`tag ${ACTION_COLORS[method]}`}>
                                          {meta.icon} {meta.label}
                                        </span>
                                      ) : null;
                                    })}
                                    {record && (
                                      <span className="text-xs text-gray-400 ml-1">
                                        🕐 {formatTime(record.date)} {!isToday(record.date) && `(${formatDateShort(record.date)})`}
                                      </span>
                                    )}
                                    {hasAlert && record?.hasOdor && (
                                      <span className="tag bg-alert-50 text-alert-400">👃 有异味</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => (isPanelOpen ? closeAlertPanel() : openAlertPanel(task.id, toyId))}
                                disabled={isCompleted}
                                className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                                  isPanelOpen
                                    ? 'bg-alert-200 text-alert-500 shadow-glow-red'
                                    : hasAlert
                                    ? 'bg-alert-100 text-alert-400 hover:bg-alert-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-alert-100 hover:text-alert-400'
                                } ${isCompleted ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title="快速记录异常"
                              >
                                ⚠️
                              </button>
                            </div>

                            {isPanelOpen && (
                              <div className="ml-16 mr-3 mb-3 -mt-1 p-4 rounded-2xl bg-white border border-alert-100 shadow-card animate-slide-in-right relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                    ⚠️ 发现异常
                                    <span className="text-sm font-normal text-gray-400">— 为「{toy.name}」记录</span>
                                  </h4>
                                  <button onClick={closeAlertPanel} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-2">✕</button>
                                </div>

                                <div className="mb-4">
                                  <label className="label-base">选择问题类型（可单选）</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {DAMAGE_TYPE_OPTIONS.slice(0, 3).map(opt => (
                                      <button
                                        key={opt.value}
                                        onClick={() => setSelectedDamageType(selectedDamageType === opt.value ? null : opt.value)}
                                        className={`chip-select text-sm ${selectedDamageType === opt.value ? 'active !border-alert-300 !bg-alert-50 !text-alert-400' : ''}`}
                                      >
                                        <span className="text-lg">{opt.icon}</span>
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="mb-5">
                                  <label className="label-base">其他情况</label>
                                  <button
                                    onClick={() => setHasOdorSelected(v => !v)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                      hasOdorSelected
                                        ? 'border-alert-300 bg-alert-50'
                                        : 'border-gray-200 bg-white hover:border-alert-200 hover:bg-alert-50'
                                    }`}
                                  >
                                    <span className="text-2xl">👃</span>
                                    <div className="flex-1 text-left">
                                      <div className={`font-medium ${hasOdorSelected ? 'text-alert-400' : 'text-gray-700'}`}>有异味</div>
                                      <div className="text-xs text-gray-400">发现霉味、刺鼻气味等不正常味道</div>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-colors duration-200 ${hasOdorSelected ? 'bg-alert-300' : 'bg-gray-200'} relative`}>
                                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${hasOdorSelected ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                  </button>
                                </div>

                                <div className="flex gap-2">
                                  <button onClick={closeAlertPanel} className="btn-ghost flex-1">取消</button>
                                  <button
                                    onClick={() => handleSaveQuickAlert(task.id, toyId)}
                                    disabled={!selectedDamageType && !hasOdorSelected}
                                    className="btn-danger flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    🚨 记录并标记停用风险
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => {
                          completeTask(task.id);
                          showSuccessToast('任务已全部完成');
                        }}
                        className="w-full btn-secondary"
                      >
                        ✅ 标记全部完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showManualForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl-plus shadow-card w-full max-w-lg max-h-[85vh] overflow-y-auto animate-bounce-soft">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 font-display">📝 手动创建任务</h2>
                <button
                  onClick={() => setShowManualForm(false)}
                  className="btn-ghost !px-3 !py-2"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label-base">任务标题</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    placeholder="例如：本周深度清洁"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="label-base">优先级</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'urgent', 'critical'] as TaskPriority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setManualPriority(p)}
                        className={`chip-select ${manualPriority === p ? 'active' : ''} ${
                          p === 'critical' ? '!text-alert-400 !border-alert-300 active:!bg-alert-100' :
                          p === 'urgent' ? '!text-amber-500 !border-amber-300 active:!bg-amber-100' : ''
                        }`}
                      >
                        {PRIORITY_LABEL[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-base">
                    选择玩具 <span className="text-gray-400 font-normal">（{manualToyIds.length} 已选）</span>
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {toys.map(toy => {
                      const materialMeta = MATERIAL_LABEL_MAP.get(toy.material);
                      const selected = manualToyIds.includes(toy.id);
                      return (
                        <button
                          key={toy.id}
                          onClick={() => toggleManualToy(toy.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? 'border-baby-300 bg-baby-50'
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                            selected ? 'bg-baby-400 border-baby-400' : 'border-gray-300'
                          }`}>
                            {selected && <span className="text-white text-sm font-bold">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-700 truncate">{toy.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              {materialMeta?.icon} {materialMeta?.label} · {toy.storageLocation}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 btn-ghost"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateManual}
                  disabled={!manualTitle.trim() || manualToyIds.length === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建任务
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-soft">
          <div className="bg-mint-500 text-white px-6 py-3 rounded-2xl shadow-card flex items-center gap-2 font-semibold">
            <span className="text-xl">✅</span>
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}
