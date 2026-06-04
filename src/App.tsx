import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskNode,
  Dependency,
  DependencyType,
  CalendarConfig,
  TimeUnit,
  ProjectData,
} from './types';
import {
  getAllProjectData,
  saveTask,
  deleteTask,
  saveDependency,
  deleteDependency,
  saveCalendar,
  saveResource,
  saveAllProjectData,
} from './db';
import {
  buildTaskTree,
  flattenTree,
  getTaskAndDescendants,
  detectCyclicDependency,
  calculateCPM,
  propagateDateChanges,
  calculateAggregatedDates,
  getProjectDateRange,
} from './utils/ganttUtils';
import {
  formatDate,
  addDays,
  getToday,
  getWorkDaysBetween,
  addWorkDays,
  parseDate,
} from './utils/dateUtils';
import {
  exportToJSON,
  exportToCSV,
  downloadFile,
  exportAsPNG,
  importFromJSON,
  buildConflictInfo,
} from './utils/exportUtils';
import TaskTree from './components/TaskTree';
import Timeline from './components/Timeline';
import GanttChart from './components/GanttChart';
import CalendarModal from './components/CalendarModal';
import TaskEditModal from './components/TaskEditModal';

const DAY_WIDTH = 28;

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [calendar, setCalendar] = useState<CalendarConfig>({
    workDays: [1, 2, 3, 4, 5],
    holidays: [],
  });
  const [resources, setResources] = useState<string[]>(['张三', '李四', '王五']);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskNode | null>(null);
  const [alerts, setAlerts] = useState<{ type: string; message: string }[]>([]);
  const [dayWidth, setDayWidth] = useState(DAY_WIDTH);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllProjectData();
        setTasks(data.tasks);
        setDependencies(data.dependencies);
        setCalendar(data.calendar);
        setResources(data.resources.length > 0 ? data.resources : ['张三', '李四', '王五']);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        addAlert('error', '加载数据失败');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addAlert = useCallback((type: string, message: string) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((_, i) => i !== 0));
    }, 5000);
  }, []);

  const taskTree = useMemo(() => buildTaskTree(tasks), [tasks]);
  const flatTasksWithCPM = useMemo(() => {
    const cpmResult = calculateCPM(tasks, dependencies, calendar);
    const tree = buildTaskTree(tasks);
    const flat = flattenTree(tree, true);
    return flat.map((task) => ({
      ...task,
      ...cpmResult.taskMap.get(task.id),
    }));
  }, [tasks, dependencies, calendar]);

  const cpmResult = useMemo(
    () => calculateCPM(tasks, dependencies, calendar),
    [tasks, dependencies, calendar]
  );

  const dateRange = useMemo(() => getProjectDateRange(tasks), [tasks]);

  const conflictInfo = useMemo(
    () => buildConflictInfo(tasks),
    [tasks]
  );

  const handleToggleExpand = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, expanded: !t.expanded } : t))
    );
  }, []);

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, ...updates };
        await saveTask(updatedTask);
      }
    },
    [tasks]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const taskToDelete = tasks.find((t) => t.id === taskId);
      if (!taskToDelete) return;

      const idsToDelete = getTaskAndDescendants(taskId, tasks);

      const updatedTasks = tasks.filter((t) => !idsToDelete.includes(t.id));
      const updatedDeps = dependencies.filter(
        (d) => !idsToDelete.includes(d.sourceId) && !idsToDelete.includes(d.targetId)
      );

      setTasks(updatedTasks);
      setDependencies(updatedDeps);

      for (const id of idsToDelete) {
        await deleteTask(id);
      }
      for (const dep of updatedDeps.length < dependencies.length ? dependencies.filter(
        (d) => idsToDelete.includes(d.sourceId) || idsToDelete.includes(d.targetId)
      ) : []) {
        await deleteDependency(dep.id);
      }

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    },
    [tasks, dependencies, selectedTaskId]
  );

  const handleAddSubTask = useCallback(
    async (parentId: string) => {
      const today = getToday();
      const newTask: Task = {
        id: uuidv4(),
        name: '新任务',
        parentId: parentId || null,
        startDate: today,
        endDate: addWorkDays(today, 2, calendar),
        progress: 0,
        isMilestone: false,
        assignees: [],
        expanded: true,
        order: tasks.filter((t) => t.parentId === (parentId || null)).length,
        duration: 2,
      };

      const updatedTasks = [...tasks, newTask];
      const aggregatedTasks = calculateAggregatedDates(updatedTasks, calendar);

      setTasks(aggregatedTasks);
      await saveTask(newTask);

      const node: TaskNode = {
        ...newTask,
        children: [],
        depth: 0,
      };
      setEditingTask(node);
      setShowTaskModal(true);
    },
    [tasks, calendar]
  );

  const handleReorderTask = useCallback(
    async (
      draggedId: string,
      targetId: string,
      position: 'before' | 'after' | 'inside'
    ) => {
      const draggedTask = tasks.find((t) => t.id === draggedId);
      const targetTask = tasks.find((t) => t.id === targetId);
      if (!draggedTask || !targetTask) return;

      if (getTaskAndDescendants(draggedId, tasks).includes(targetId)) {
        addAlert('error', '不能将任务移动到其子任务下');
        return;
      }

      let updatedTasks = tasks.map((t) => ({ ...t }));

      if (position === 'inside') {
        updatedTasks = updatedTasks.map((t) =>
          t.id === draggedId ? { ...t, parentId: targetId } : t
        );
      } else {
        const siblings = updatedTasks
          .filter((t) => t.parentId === targetTask.parentId)
          .sort((a, b) => a.order - b.order);
        const targetIndex = siblings.findIndex((t) => t.id === targetId);
        const draggedIndex = siblings.findIndex((t) => t.id === draggedId);

        if (draggedIndex !== -1) {
          siblings.splice(draggedIndex, 1);
        }

        const newIndex = position === 'before' ? targetIndex : targetIndex + 1;
        siblings.splice(newIndex, 0, { ...draggedTask, parentId: targetTask.parentId });

        siblings.forEach((t, i) => {
          const idx = updatedTasks.findIndex((ut) => ut.id === t.id);
          if (idx !== -1) {
            updatedTasks[idx].order = i;
            updatedTasks[idx].parentId = targetTask.parentId;
          }
        });
      }

      setTasks(updatedTasks);
      for (const task of updatedTasks) {
        await saveTask(task);
      }
    },
    [tasks, addAlert]
  );

  const handleTaskDateChange = useCallback(
    async (taskId: string, newStartDate: string, newEndDate: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate: newStartDate,
              endDate: newEndDate,
              duration: t.isMilestone ? 0 : getWorkDaysBetween(newStartDate, newEndDate, calendar),
            }
          : t
      );

      const { updatedTasks: propagatedTasks, circularDeps } = propagateDateChanges(
        taskId,
        updatedTasks,
        dependencies,
        calendar
      );

      if (circularDeps) {
        addAlert('warning', '检测到循环依赖，部分日期未自动更新');
      }

      const aggregatedTasks = calculateAggregatedDates(propagatedTasks, calendar);

      const updatedTask = aggregatedTasks.find((t) => t.id === taskId);
      const originalTask = tasks.find((t) => t.id === taskId);

      if (updatedTask && originalTask && cpmResult.criticalPath.includes(taskId)) {
        if (updatedTask.endDate > originalTask.endDate) {
          addAlert(
            'warning',
            `关键路径任务"${updatedTask.name}"延期，整体项目工期将受影响`
          );
        }
      }

      setTasks(aggregatedTasks);
      for (const t of aggregatedTasks) {
        await saveTask(t);
      }
    },
    [tasks, dependencies, calendar, cpmResult.criticalPath, addAlert]
  );

  const handleAddDependency = useCallback(
    async (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        addAlert('error', '不能创建自依赖');
        return;
      }

      const existingDep = dependencies.find(
        (d) => d.sourceId === sourceId && d.targetId === targetId
      );
      if (existingDep) {
        addAlert('warning', '依赖关系已存在');
        return;
      }

      if (detectCyclicDependency(dependencies, { sourceId, targetId })) {
        addAlert('error', '检测到循环依赖，无法创建');
        return;
      }

      const newDep: Dependency = {
        id: uuidv4(),
        sourceId,
        targetId,
        type: 'FS',
        lag: 0,
      };

      const updatedDeps = [...dependencies, newDep];
      setDependencies(updatedDeps);
      await saveDependency(newDep);

      const sourceTask = tasks.find((t) => t.id === sourceId);
      const targetTask = tasks.find((t) => t.id === targetId);
      if (sourceTask && targetTask) {
        const { updatedTasks, circularDeps } = propagateDateChanges(
          sourceId,
          tasks,
          updatedDeps,
          calendar
        );
        if (circularDeps) {
          addAlert('warning', '检测到循环依赖');
        }
        const aggregatedTasks = calculateAggregatedDates(updatedTasks, calendar);
        setTasks(aggregatedTasks);
        for (const t of aggregatedTasks) {
          await saveTask(t);
        }
      }

      addAlert('info', '依赖关系创建成功');
    },
    [tasks, dependencies, calendar, addAlert]
  );

  const handleDeleteDependency = useCallback(
    async (depId: string) => {
      setDependencies((prev) => prev.filter((d) => d.id !== depId));
      await deleteDependency(depId);
    },
    []
  );

  const handleUpdateDependency = useCallback(
    async (depId: string, newType: DependencyType) => {
      const dep = dependencies.find((d) => d.id === depId);
      if (!dep || dep.type === newType) return;

      const updatedDep = { ...dep, type: newType };
      const updatedDeps = dependencies.map((d) => (d.id === depId ? updatedDep : d));
      setDependencies(updatedDeps);
      await saveDependency(updatedDep);

      const { updatedTasks, circularDeps } = propagateDateChanges(
        dep.sourceId,
        tasks,
        updatedDeps,
        calendar
      );
      if (circularDeps) {
        addAlert('warning', '切换依赖类型后检测到循环依赖');
      }
      const aggregatedTasks = calculateAggregatedDates(updatedTasks, calendar);
      setTasks(aggregatedTasks);
      for (const t of aggregatedTasks) {
        await saveTask(t);
      }

      addAlert('info', `依赖类型已切换为 ${newType}`);
    },
    [dependencies, tasks, calendar, addAlert]
  );

  const handleSelectTask = useCallback((taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const task = flatTasksWithCPM.find((t) => t.id === taskId);
      if (task) {
        setEditingTask(task);
      }
    }
  }, [flatTasksWithCPM]);

  const handleDoubleClickTask = useCallback(
    (taskId: string) => {
      const task = flatTasksWithCPM.find((t) => t.id === taskId);
      if (task) {
        setEditingTask(task);
        setShowTaskModal(true);
      }
    },
    [flatTasksWithCPM]
  );

  const handleSaveTaskModal = useCallback(
    async (updatedTask: TaskNode) => {
      let updatedTasks = tasks.map((t) =>
        t.id === updatedTask.id
          ? {
              ...t,
              name: updatedTask.name,
              startDate: updatedTask.startDate,
              endDate: updatedTask.endDate,
              progress: updatedTask.progress,
              isMilestone: updatedTask.isMilestone,
              assignees: updatedTask.assignees,
              duration: updatedTask.duration,
            }
          : t
      );

      const { updatedTasks: propagatedTasks, circularDeps } = propagateDateChanges(
        updatedTask.id,
        updatedTasks,
        dependencies,
        calendar
      );

      if (circularDeps) {
        addAlert('warning', '检测到循环依赖');
      }

      const aggregatedTasks = calculateAggregatedDates(propagatedTasks, calendar);
      setTasks(aggregatedTasks);
      for (const t of aggregatedTasks) {
        await saveTask(t);
      }

      for (const assignee of updatedTask.assignees) {
        if (!resources.includes(assignee)) {
          setResources((prev) => [...prev, assignee]);
          await saveResource(assignee);
        }
      }

      setShowTaskModal(false);
      setEditingTask(null);
    },
    [tasks, dependencies, calendar, resources, addAlert]
  );

  const handleSaveCalendar = useCallback(
    async (newCalendar: CalendarConfig) => {
      setCalendar(newCalendar);
      await saveCalendar(newCalendar);

      const updatedTasks = tasks.map((t) => ({
        ...t,
        duration: t.isMilestone
          ? 0
          : getWorkDaysBetween(t.startDate, t.endDate, newCalendar),
      }));
      setTasks(updatedTasks);
      for (const t of updatedTasks) {
        await saveTask(t);
      }

      setShowCalendarModal(false);
      addAlert('info', '日历配置已保存');
    },
    [tasks, addAlert]
  );

  const handleAddResource = useCallback(
    async (resourceName: string) => {
      if (!resources.includes(resourceName)) {
        setResources((prev) => [...prev, resourceName]);
        await saveResource(resourceName);
      }
    },
    [resources]
  );

  const handleExportJSON = useCallback(() => {
    const json = exportToJSON(tasks, dependencies, calendar, resources);
    downloadFile(json, `gantt-project-${formatDate(new Date())}.json`, 'application/json');
  }, [tasks, dependencies, calendar, resources]);

  const handleExportCSV = useCallback(() => {
    const csv = exportToCSV(tasks, dependencies);
    downloadFile(csv, `gantt-project-${formatDate(new Date())}.csv`, 'text/csv');
  }, [tasks, dependencies]);

  const handleExportPNG = useCallback(async () => {
    try {
      await exportAsPNG('gantt-main-container', `gantt-chart-${formatDate(new Date())}.png`);
      addAlert('info', 'PNG导出成功');
    } catch (error) {
      addAlert('error', 'PNG导出失败');
    }
  }, [addAlert]);

  const handleImportJSON = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = importFromJSON(content);
          await saveAllProjectData(data);
          setTasks(data.tasks);
          setDependencies(data.dependencies);
          setCalendar(data.calendar);
          setResources(data.resources);
          addAlert('info', '导入成功');
        } catch (error) {
          addAlert('error', '导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [addAlert]
  );

  const handleAddSampleData = useCallback(async () => {
    const today = getToday();
    const sampleTasks: Task[] = [
      {
        id: '1',
        name: '项目启动',
        parentId: null,
        startDate: today,
        endDate: addWorkDays(today, 2, calendar),
        progress: 100,
        isMilestone: true,
        assignees: ['张三'],
        expanded: true,
        order: 0,
        duration: 0,
      },
      {
        id: '2',
        name: '需求分析',
        parentId: null,
        startDate: addWorkDays(today, 1, calendar),
        endDate: addWorkDays(today, 7, calendar),
        progress: 80,
        isMilestone: false,
        assignees: ['张三', '李四'],
        expanded: true,
        order: 1,
        duration: 7,
      },
      {
        id: '3',
        name: '用户调研',
        parentId: '2',
        startDate: addWorkDays(today, 1, calendar),
        endDate: addWorkDays(today, 3, calendar),
        progress: 100,
        isMilestone: false,
        assignees: ['张三'],
        expanded: true,
        order: 0,
        duration: 3,
      },
      {
        id: '4',
        name: '需求文档',
        parentId: '2',
        startDate: addWorkDays(today, 4, calendar),
        endDate: addWorkDays(today, 7, calendar),
        progress: 60,
        isMilestone: false,
        assignees: ['李四'],
        expanded: true,
        order: 1,
        duration: 4,
      },
      {
        id: '5',
        name: '系统设计',
        parentId: null,
        startDate: addWorkDays(today, 8, calendar),
        endDate: addWorkDays(today, 14, calendar),
        progress: 30,
        isMilestone: false,
        assignees: ['王五'],
        expanded: true,
        order: 2,
        duration: 7,
      },
      {
        id: '6',
        name: '开发阶段',
        parentId: null,
        startDate: addWorkDays(today, 15, calendar),
        endDate: addWorkDays(today, 35, calendar),
        progress: 0,
        isMilestone: false,
        assignees: [],
        expanded: true,
        order: 3,
        duration: 21,
      },
      {
        id: '7',
        name: '前端开发',
        parentId: '6',
        startDate: addWorkDays(today, 15, calendar),
        endDate: addWorkDays(today, 28, calendar),
        progress: 0,
        isMilestone: false,
        assignees: ['张三'],
        expanded: true,
        order: 0,
        duration: 14,
      },
      {
        id: '8',
        name: '后端开发',
        parentId: '6',
        startDate: addWorkDays(today, 15, calendar),
        endDate: addWorkDays(today, 30, calendar),
        progress: 0,
        isMilestone: false,
        assignees: ['李四'],
        expanded: true,
        order: 1,
        duration: 16,
      },
      {
        id: '9',
        name: '测试阶段',
        parentId: '6',
        startDate: addWorkDays(today, 29, calendar),
        endDate: addWorkDays(today, 35, calendar),
        progress: 0,
        isMilestone: false,
        assignees: ['王五'],
        expanded: true,
        order: 2,
        duration: 7,
      },
      {
        id: '10',
        name: '项目上线',
        parentId: null,
        startDate: addWorkDays(today, 36, calendar),
        endDate: addWorkDays(today, 36, calendar),
        progress: 0,
        isMilestone: true,
        assignees: ['张三', '李四', '王五'].slice(0, 2),
        expanded: true,
        order: 4,
        duration: 0,
      },
    ];

    const sampleDeps: Dependency[] = [
      { id: 'd1', sourceId: '1', targetId: '2', type: 'FS', lag: 0 },
      { id: 'd2', sourceId: '3', targetId: '4', type: 'FS', lag: 0 },
      { id: 'd3', sourceId: '2', targetId: '5', type: 'FS', lag: 0 },
      { id: 'd4', sourceId: '5', targetId: '6', type: 'FS', lag: 0 },
      { id: 'd5', sourceId: '7', targetId: '9', type: 'FS', lag: 0 },
      { id: 'd6', sourceId: '8', targetId: '9', type: 'FS', lag: 0 },
      { id: 'd7', sourceId: '9', targetId: '10', type: 'FS', lag: 0 },
      { id: 'd8', sourceId: '7', targetId: '8', type: 'SS', lag: 0 },
    ];

    await saveAllProjectData({
      tasks: sampleTasks,
      dependencies: sampleDeps,
      calendar,
      resources,
    });
    setTasks(sampleTasks);
    setDependencies(sampleDeps);
    addAlert('info', '示例数据已加载');
  }, [calendar, resources, addAlert]);

  const handleScroll = useCallback((left: number, top: number) => {
    setScrollLeft(left);
    setScrollTop(top);
  }, []);

  const handleTimelineScroll = useCallback((left: number) => {
    setScrollLeft(left);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = e.currentTarget as HTMLElement;
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      const newScrollLeft = scrollLeft + (e.deltaX || e.deltaY);
      container.scrollLeft = newScrollLeft;
      setScrollLeft(Math.max(0, newScrollLeft));
    }
  }, [scrollLeft]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="gantt-app">
      <div className="gantt-toolbar">
        <span className="toolbar-title">📊 项目甘特图管理</span>

        <button className="toolbar-btn primary" onClick={() => handleAddSubTask('')}>
          + 新建任务
        </button>

        <div className="time-unit-switch">
          {(['day', 'week', 'month', 'quarter'] as TimeUnit[]).map((unit) => (
            <button
              key={unit}
              className={`time-unit-btn ${timeUnit === unit ? 'active' : ''}`}
              onClick={() => setTimeUnit(unit)}
            >
              {{ day: '日', week: '周', month: '月', quarter: '季度' }[unit]}
            </button>
          ))}
        </div>

        <div className="resource-filter">
          <span style={{ fontSize: '12px', color: '#666' }}>负责人筛选:</span>
          <select
            value={resourceFilter || ''}
            onChange={(e) => setResourceFilter(e.target.value || null)}
          >
            <option value="">全部</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {conflictInfo.conflictedResources.has(r) ? '❗ ' : ''}{r}
              </option>
            ))}
          </select>
        </div>

        <button className="toolbar-btn" onClick={() => setShowCalendarModal(true)}>
          📅 日历配置
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="toolbar-btn" onClick={handleExportPNG}>导出PNG</button>
          <button className="toolbar-btn" onClick={handleExportJSON}>导出JSON</button>
          <button className="toolbar-btn" onClick={handleExportCSV}>导出CSV</button>
          <button
            className="toolbar-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            导入JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />
        </div>

        {tasks.length === 0 && (
          <button className="toolbar-btn" onClick={handleAddSampleData}>
            加载示例数据
          </button>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ fontSize: '12px', color: '#666' }}>
          关键路径: <span style={{ color: '#fa8c16', fontWeight: 600 }}>{cpmResult.criticalPath.length}</span> 个任务 |
          总工期: <span style={{ fontWeight: 600 }}>{cpmResult.projectDuration}</span> 工作日
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 1000, gap: '8px', display: 'flex', flexDirection: 'column' }}>
          {alerts.map((alert, i) => (
            <div key={i} className={`alert alert-${alert.type}`} style={{ margin: 0 }}>
              <span>
                {alert.type === 'error' && '❌ '}
                {alert.type === 'warning' && '⚠️ '}
                {alert.type === 'info' && 'ℹ️ '}
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {conflictInfo.conflicts.length > 0 && (() => {
        const taskNameMap = new Map(tasks.map((t) => [t.id, t.name]));
        return (
          <div className="alert alert-warning" style={{ margin: '8px 16px 0' }}>
            <span>
              ⚠️ 检测到 {conflictInfo.conflicts.length} 个资源冲突：
              {conflictInfo.conflicts.slice(0, 4).map((c, i) => (
                <span key={i} style={{ marginLeft: '8px' }}>
                  {c.resource}（{taskNameMap.get(c.task1Id) || c.task1Id} 与 {taskNameMap.get(c.task2Id) || c.task2Id} {c.startDate}~{c.endDate}）
                </span>
              ))}
              {conflictInfo.conflicts.length > 4 && ` 等${conflictInfo.conflicts.length - 4}个`}
            </span>
          </div>
        );
      })()}

      <div
        className="gantt-main"
        id="gantt-main-container"
        onWheel={handleWheel}
      >
        <TaskTree
          tasks={taskTree}
          onToggleExpand={handleToggleExpand}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onAddSubTask={handleAddSubTask}
          onReorderTask={handleReorderTask}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
        />

        <div className="gantt-right">
          <Timeline
            timeUnit={timeUnit}
            startDate={dateRange.minDate}
            endDate={dateRange.maxDate}
            dayWidth={dayWidth}
            scrollLeft={scrollLeft}
            onScroll={handleTimelineScroll}
            calendar={calendar}
          />

          <GanttChart
            tasks={taskTree}
            flatTasks={flatTasksWithCPM}
            dependencies={dependencies}
            timeUnit={timeUnit}
            startDate={dateRange.minDate}
            endDate={dateRange.maxDate}
            dayWidth={dayWidth}
            scrollLeft={scrollLeft}
            scrollTop={scrollTop}
            onScroll={handleScroll}
            onUpdateTask={handleUpdateTask}
            onTaskDateChange={handleTaskDateChange}
            onAddDependency={handleAddDependency}
            onDeleteDependency={handleDeleteDependency}
            onUpdateDependency={handleUpdateDependency}
            calendar={calendar}
            resourceFilter={resourceFilter}
            conflictInfo={conflictInfo}
          />
        </div>
      </div>

      <CalendarModal
        visible={showCalendarModal}
        calendar={calendar}
        onSave={handleSaveCalendar}
        onCancel={() => setShowCalendarModal(false)}
      />

      <TaskEditModal
        visible={showTaskModal}
        task={editingTask}
        resources={resources}
        calendar={calendar}
        onSave={handleSaveTaskModal}
        onCancel={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onDelete={
          editingTask && !editingTask.id.startsWith('new-')
            ? () => {
                handleDeleteTask(editingTask.id);
                setShowTaskModal(false);
                setEditingTask(null);
              }
            : undefined
        }
        onAddResource={handleAddResource}
      />

      {selectedTaskId && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            minWidth: '280px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>任务详情</span>
            <button
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#999' }}
              onClick={() => setSelectedTaskId(null)}
            >
              ×
            </button>
          </div>
          <button
            className="toolbar-btn"
            style={{ width: '100%', marginBottom: '8px' }}
            onClick={() => handleDoubleClickTask(selectedTaskId)}
          >
            编辑任务
          </button>
          {(() => {
            const task = flatTasksWithCPM.find((t) => t.id === selectedTaskId);
            if (!task) return null;
            return (
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.8 }}>
                <div>名称: {task.name}</div>
                <div>日期: {task.startDate} ~ {task.endDate}</div>
                <div>工期: {task.duration} 工作日</div>
                <div>进度: {task.progress}%</div>
                {task.isCritical && (
                  <div style={{ color: '#fa8c16' }}>关键路径: 是</div>
                )}
                {task.assignees.length > 0 && (
                  <div>负责人: {task.assignees.join(', ')}</div>
                )}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={task.progress}
                    onChange={(e) => handleUpdateTask(task.id, { progress: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ width: '40px', textAlign: 'right' }}>{task.progress}%</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default App;
