import React, { useRef, useState, useEffect } from 'react';
import {
  TaskNode,
  TimeUnit,
  CalendarConfig,
  DragState,
  TooltipState,
  LinkDragState,
  Dependency,
  DependencyType,
} from '../types';
import {
  parseDate,
  addDays,
  getDaysBetween,
  getToday,
  isWorkDay,
  addWorkDays,
  getWorkDaysBetween,
} from '../utils/dateUtils';
import DependencyArrows from './DependencyArrows';

interface GanttChartProps {
  tasks: TaskNode[];
  flatTasks: TaskNode[];
  dependencies: Dependency[];
  timeUnit: TimeUnit;
  startDate: string;
  endDate: string;
  dayWidth: number;
  scrollLeft: number;
  scrollTop: number;
  onScroll: (scrollLeft: number, scrollTop: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskNode>) => void;
  onTaskDateChange: (taskId: string, startDate: string, endDate: string) => void;
  onAddDependency: (sourceId: string, targetId: string) => void;
  onDeleteDependency: (depId: string) => void;
  onUpdateDependency: (depId: string, newType: DependencyType) => void;
  calendar: CalendarConfig;
  resourceFilter: string | null;
}

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  flatTasks,
  dependencies,
  timeUnit,
  startDate,
  endDate,
  dayWidth,
  scrollLeft,
  scrollTop,
  onScroll,
  onUpdateTask,
  onTaskDateChange,
  onAddDependency,
  onDeleteDependency,
  onUpdateDependency,
  calendar,
  resourceFilter,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    mode: 'none',
    taskId: null,
    startX: 0,
    initialStart: '',
    initialEnd: '',
  });
  const [linkDragState, setLinkDragState] = useState<LinkDragState>({
    isDragging: false,
    sourceId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    taskId: null,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollLeft !== scrollLeft) {
        scrollRef.current.scrollLeft = scrollLeft;
      }
      if (scrollRef.current.scrollTop !== scrollTop) {
        scrollRef.current.scrollTop = scrollTop;
      }
    }
  }, [scrollLeft, scrollTop]);

  const handleScroll = () => {
    if (scrollRef.current) {
      onScroll(scrollRef.current.scrollLeft, scrollRef.current.scrollTop);
    }
  };

  const getTaskLeft = (taskStartDate: string): number => {
    return getDaysBetween(startDate, taskStartDate) * dayWidth;
  };

  const getTaskWidth = (task: TaskNode): number => {
    if (task.isMilestone) return 0;
    return Math.max(getDaysBetween(task.startDate, task.endDate) * dayWidth + dayWidth, dayWidth);
  };

  const getTaskTop = (taskId: string): number => {
    const index = flatTasks.findIndex((t) => t.id === taskId);
    return index * 36;
  };

  const getDateFromX = (x: number): string => {
    const days = Math.round(x / dayWidth);
    return addDays(startDate, days);
  };

  const getTaskBarClass = (task: TaskNode): string => {
    if (task.progress >= 100) return 'completed';
    if (task.isCritical) return 'critical';
    return 'normal';
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    task: TaskNode,
    mode: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDragState({
      mode,
      taskId: task.id,
      startX: e.clientX,
      initialStart: task.startDate,
      initialEnd: task.endDate,
    });
  };

  const handleLinkMouseDown = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    setLinkDragState({
      isDragging: true,
      sourceId: taskId,
      startX: e.clientX - rect.left + scrollLeft,
      startY: e.clientY - rect.top + scrollTop,
      currentX: e.clientX - rect.left + scrollLeft,
      currentY: e.clientY - rect.top + scrollTop,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.mode !== 'none' && dragState.taskId) {
        const deltaX = e.clientX - dragState.startX;
        const deltaDays = Math.round(deltaX / dayWidth);

        let newStart = dragState.initialStart;
        let newEnd = dragState.initialEnd;

        const task = flatTasks.find((t) => t.id === dragState.taskId);
        if (!task) return;

        const duration = task.isMilestone
          ? 0
          : getWorkDaysBetween(dragState.initialStart, dragState.initialEnd, calendar);

        if (dragState.mode === 'move') {
          newStart = addWorkDays(dragState.initialStart, deltaDays, calendar);
          newEnd = task.isMilestone
            ? newStart
            : addWorkDays(newStart, duration, calendar);
        } else if (dragState.mode === 'resize-start') {
          newStart = addWorkDays(dragState.initialStart, deltaDays, calendar);
          if (newStart >= newEnd) {
            newStart = addWorkDays(newEnd, -1, calendar);
          }
        } else if (dragState.mode === 'resize-end') {
          newEnd = addWorkDays(dragState.initialEnd, deltaDays, calendar);
          if (newEnd <= newStart) {
            newEnd = addWorkDays(newStart, 1, calendar);
          }
        }

        onTaskDateChange(dragState.taskId, newStart, newEnd);
      }

      if (linkDragState.isDragging) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setLinkDragState((prev) => ({
            ...prev,
            currentX: e.clientX - rect.left + scrollLeft,
            currentY: e.clientY - rect.top + scrollTop,
          }));
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dragState.mode !== 'none') {
        setDragState({
          mode: 'none',
          taskId: null,
          startX: 0,
          initialStart: '',
          initialEnd: '',
        });
      }

      if (linkDragState.isDragging && linkDragState.sourceId) {
        const sourceId = linkDragState.sourceId;
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left + scrollLeft;
          const y = e.clientY - rect.top + scrollTop;

          let targetTask: TaskNode | null = null;
          for (let i = 0; i < flatTasks.length; i++) {
            const task = flatTasks[i];
            if (task.id === sourceId) continue;
            const taskTop = getTaskTop(task.id);
            const taskLeft = getTaskLeft(task.startDate);
            const taskWidth = getTaskWidth(task);

            if (
              y >= taskTop &&
              y <= taskTop + 36 &&
              x >= taskLeft &&
              x <= taskLeft + taskWidth
            ) {
              targetTask = task;
              break;
            }
          }

          if (targetTask) {
            onAddDependency(sourceId, targetTask.id);
          }
        }

        setLinkDragState({
          isDragging: false,
          sourceId: null,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
        });
      }
    };

    if (dragState.mode !== 'none' || linkDragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, linkDragState, dayWidth, scrollLeft, flatTasks, calendar, onTaskDateChange, onAddDependency]);

  const handleTaskHover = (e: React.MouseEvent, taskId: string) => {
    setTooltip({
      visible: true,
      taskId,
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  const handleTaskLeave = () => {
    setTooltip({
      visible: false,
      taskId: null,
      x: 0,
      y: 0,
    });
  };

  const generateDayUnits = () => {
    const units: { date: string; width: number; isWeekend: boolean }[] = [];
    let current = startDate;

    while (current <= endDate) {
      const date = parseDate(current);
      const isWeekend = !isWorkDay(date, calendar);

      units.push({
        date: current,
        width: dayWidth,
        isWeekend,
      });

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      current = `${year}-${month}-${day}`;
    }

    return units;
  };

  const dayUnits = generateDayUnits();
  const totalWidth = dayUnits.reduce((sum, d) => sum + d.width, 0);
  const totalHeight = flatTasks.length * 36;
  const today = getToday();
  const todayLeft = getDaysBetween(startDate, today) * dayWidth;

  const tooltipTask = tooltip.visible && tooltip.taskId
    ? flatTasks.find((t) => t.id === tooltip.taskId)
    : null;

  const getDependencyTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      FS: '完成-开始',
      SS: '开始-开始',
      FF: '完成-完成',
      SF: '开始-完成',
    };
    return labels[type] || type;
  };

  const filteredTasks = resourceFilter
    ? flatTasks.filter((t) => t.assignees.includes(resourceFilter))
    : flatTasks;

  return (
    <div className="gantt-chart-container" ref={scrollRef} onScroll={handleScroll}>
      <div className="gantt-chart-content" ref={chartRef} style={{ width: totalWidth, minHeight: '100%' }}>
        <div className="gantt-grid" style={{ width: totalWidth }}>
          {flatTasks.map((task, rowIndex) => (
            <div
              key={task.id}
              className={`grid-row ${dayUnits[0]?.isWeekend ? 'weekend' : ''}`}
              style={{ width: totalWidth }}
            >
              {dayUnits.map((unit) => (
                <div
                  key={unit.date}
                  className={`grid-cell ${unit.isWeekend ? 'weekend' : ''}`}
                  style={{ width: unit.width }}
                />
              ))}
            </div>
          ))}
        </div>

        {todayLeft >= 0 && todayLeft <= totalWidth && (
          <div className="today-line" style={{ left: todayLeft }} />
        )}

        <div className="task-bar-container" style={{ height: totalHeight }}>
          {filteredTasks.map((task) => {
            const left = getTaskLeft(task.startDate);
            const top = getTaskTop(task.id);
            const width = getTaskWidth(task);
            const barClass = getTaskBarClass(task);

            if (task.isMilestone) {
              return (
                <div
                  key={task.id}
                  className={`task-milestone ${barClass}`}
                  style={{ left: left + width / 2 - 10, top }}
                  onMouseEnter={(e) => handleTaskHover(e, task.id)}
                  onMouseLeave={handleTaskLeave}
                  title={task.name}
                />
              );
            }

            return (
              <div
                key={task.id}
                className={`task-bar ${barClass}`}
                style={{ left, top, width }}
                onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                onMouseEnter={(e) => handleTaskHover(e, task.id)}
                onMouseLeave={handleTaskLeave}
              >
                <div
                  className="task-bar progress"
                  style={{ width: `${task.progress}%` }}
                />
                <span className="task-bar-label">{task.name}</span>

                <div
                  className="task-bar-resize-handle left"
                  onMouseDown={(e) => handleMouseDown(e, task, 'resize-start')}
                />
                <div
                  className="task-bar-resize-handle right"
                  onMouseDown={(e) => handleMouseDown(e, task, 'resize-end')}
                />

                <div
                  className="task-bar-link-handle"
                  onMouseDown={(e) => handleLinkMouseDown(e, task.id)}
                  title="拖动创建依赖"
                />
              </div>
            );
          })}
        </div>

        <DependencyArrows
          tasks={flatTasks}
          dependencies={dependencies}
          getTaskLeft={getTaskLeft}
          getTaskWidth={getTaskWidth}
          getTaskTop={getTaskTop}
          dayWidth={dayWidth}
          chartWidth={totalWidth}
          chartHeight={totalHeight}
          linkDragState={linkDragState}
          onDeleteDependency={onDeleteDependency}
          onUpdateDependency={onUpdateDependency}
          resourceFilter={resourceFilter}
        />
      </div>

      {tooltip.visible && tooltipTask && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tooltip-title">{tooltipTask.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">开始日期:</span>
            <span className="tooltip-value">{tooltipTask.startDate}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">结束日期:</span>
            <span className="tooltip-value">{tooltipTask.endDate}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">工期:</span>
            <span className="tooltip-value">{tooltipTask.duration} 工作日</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">进度:</span>
            <span className="tooltip-value">{tooltipTask.progress}%</span>
          </div>
          {tooltipTask.isCritical && (
            <div className="tooltip-row">
              <span className="tooltip-label">关键路径:</span>
              <span className="tooltip-value" style={{ color: '#fa8c16' }}>是</span>
            </div>
          )}
          {tooltipTask.assignees.length > 0 && (
            <div className="tooltip-row">
              <span className="tooltip-label">负责人:</span>
              <span className="tooltip-value">{tooltipTask.assignees.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GanttChart;
