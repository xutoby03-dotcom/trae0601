import { Task, Dependency, CalendarConfig, TaskNode, CPMResult, DependencyType } from '../types';
import { parseDate, addWorkDays, getWorkDaysBetween, maxDate, minDate, addDays, formatDate } from './dateUtils';

export const buildTaskTree = (tasks: Task[]): TaskNode[] => {
  const taskMap = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  sortedTasks.forEach((task) => {
    const node: TaskNode = {
      ...task,
      children: [],
      depth: 0,
    };
    taskMap.set(task.id, node);
  });

  taskMap.forEach((node) => {
    if (node.parentId && taskMap.has(node.parentId)) {
      const parent = taskMap.get(node.parentId)!;
      parent.children.push(node);
      node.depth = parent.depth + 1;
    } else {
      roots.push(node);
    }
  });

  const sortChildren = (nodes: TaskNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(roots);

  return roots;
};

export const flattenTree = (roots: TaskNode[], respectExpansion: boolean = false): TaskNode[] => {
  const result: TaskNode[] = [];
  const traverse = (nodes: TaskNode[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (!respectExpansion || node.expanded) {
        traverse(node.children);
      }
    });
  };
  traverse(roots);
  return result;
};

export const nodeOrDescendantsHaveResource = (node: TaskNode, resource: string): boolean => {
  if (node.assignees.includes(resource)) {
    return true;
  }
  return node.children.some((child) => nodeOrDescendantsHaveResource(child, resource));
};

export const getVisibleTaskIds = (roots: TaskNode[], resourceFilter: string | null): Set<string> => {
  const visibleIds = new Set<string>();
  if (!resourceFilter) {
    flattenTree(roots, true).forEach((n) => visibleIds.add(n.id));
    return visibleIds;
  }
  const traverse = (nodes: TaskNode[]) => {
    nodes.forEach((node) => {
      const shouldShow = nodeOrDescendantsHaveResource(node, resourceFilter);
      if (shouldShow) {
        visibleIds.add(node.id);
        if (node.expanded) {
          traverse(node.children);
        }
      }
    });
  };
  traverse(roots);
  return visibleIds;
};

export const getTaskAndDescendants = (taskId: string, tasks: Task[]): string[] => {
  const ids: string[] = [taskId];
  const findChildren = (parentId: string) => {
    tasks.forEach((t) => {
      if (t.parentId === parentId) {
        ids.push(t.id);
        findChildren(t.id);
      }
    });
  };
  findChildren(taskId);
  return ids;
};

export const detectCyclicDependency = (
  dependencies: Dependency[],
  newDep: { sourceId: string; targetId: string }
): boolean => {
  const adjList = new Map<string, string[]>();
  dependencies.forEach((d) => {
    if (!adjList.has(d.sourceId)) adjList.set(d.sourceId, []);
    adjList.get(d.sourceId)!.push(d.targetId);
  });
  if (!adjList.has(newDep.sourceId)) adjList.set(newDep.sourceId, []);
  adjList.get(newDep.sourceId)!.push(newDep.targetId);

  const visited = new Set<string>();
  const recStack = new Set<string>();

  const dfs = (node: string): boolean => {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    recStack.add(node);
    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }
    recStack.delete(node);
    return false;
  };

  for (const [source] of adjList) {
    if (dfs(source)) return true;
  }
  return false;
};

const calculateTaskDuration = (
  task: Task,
  calendar: CalendarConfig
): number => {
  if (task.isMilestone) return 0;
  return getWorkDaysBetween(task.startDate, task.endDate, calendar);
};

export const calculateCPM = (
  tasks: Task[],
  dependencies: Dependency[],
  calendar: CalendarConfig
): CPMResult => {
  const taskMap = new Map<string, TaskNode>();
  const leaves: Set<string> = new Set();

  tasks.forEach((task) => {
    const node: TaskNode = {
      ...task,
      children: [],
      depth: 0,
      earlyStart: task.startDate,
      earlyFinish: task.endDate,
      lateStart: task.startDate,
      lateFinish: task.endDate,
      totalFloat: 0,
    };
    taskMap.set(task.id, node);
    leaves.add(task.id);
  });

  const incoming = new Map<string, Dependency[]>();
  const outgoing = new Map<string, Dependency[]>();

  tasks.forEach((t) => {
    incoming.set(t.id, []);
    outgoing.set(t.id, []);
  });

  dependencies.forEach((dep) => {
    incoming.get(dep.targetId)!.push(dep);
    outgoing.get(dep.sourceId)!.push(dep);
    leaves.delete(dep.sourceId);
  });

  const topoOrder: string[] = [];
  const inDegree = new Map<string, number>();
  tasks.forEach((t) => inDegree.set(t.id, incoming.get(t.id)!.length));

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    topoOrder.push(node);
    outgoing.get(node)!.forEach((dep) => {
      const newDegree = inDegree.get(dep.targetId)! - 1;
      inDegree.set(dep.targetId, newDegree);
      if (newDegree === 0) queue.push(dep.targetId);
    });
  }

  topoOrder.forEach((taskId) => {
    const task = taskMap.get(taskId)!;
    const deps = incoming.get(taskId)!;

    if (deps.length > 0) {
      let earliestStart = '1900-01-01';
      deps.forEach((dep) => {
        const source = taskMap.get(dep.sourceId)!;
        let constraintDate: string;

        switch (dep.type) {
          case 'FS':
            constraintDate = source.earlyFinish!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, dep.lag, calendar);
            }
            constraintDate = addWorkDays(constraintDate, 1, calendar);
            break;
          case 'SS':
            constraintDate = source.earlyStart!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, dep.lag, calendar);
            }
            break;
          case 'FF':
            constraintDate = source.earlyFinish!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, dep.lag, calendar);
            }
            break;
          case 'SF':
            constraintDate = source.earlyStart!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, dep.lag, calendar);
            }
            break;
          default:
            constraintDate = source.earlyFinish!;
        }

        if (dep.type === 'FS' || dep.type === 'SS') {
          earliestStart = maxDate(earliestStart, constraintDate);
        }
      });

      if (earliestStart !== '1900-01-01') {
        task.earlyStart = earliestStart;
        const duration = calculateTaskDuration(task, calendar);
        task.earlyFinish = addWorkDays(earliestStart, duration, calendar);
      }
    }
  });

  let projectEndDate = '1900-01-01';
  taskMap.forEach((task) => {
    if (task.earlyFinish! > projectEndDate) {
      projectEndDate = task.earlyFinish!;
    }
  });

  const reverseTopo = [...topoOrder].reverse();

  reverseTopo.forEach((taskId) => {
    const task = taskMap.get(taskId)!;
    const deps = outgoing.get(taskId)!;

    if (deps.length === 0) {
      task.lateFinish = projectEndDate;
    } else {
      let latestFinish = '9999-12-31';
      deps.forEach((dep) => {
        const target = taskMap.get(dep.targetId)!;
        let constraintDate: string;

        switch (dep.type) {
          case 'FS':
            constraintDate = addWorkDays(target.lateStart!, -1, calendar);
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, -dep.lag, calendar);
            }
            break;
          case 'SS':
            constraintDate = target.lateStart!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, -dep.lag, calendar);
            }
            break;
          case 'FF':
            constraintDate = target.lateFinish!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, -dep.lag, calendar);
            }
            break;
          case 'SF':
            constraintDate = target.lateFinish!;
            if (dep.lag > 0) {
              constraintDate = addWorkDays(constraintDate, -dep.lag, calendar);
            }
            break;
          default:
            constraintDate = target.lateStart!;
        }

        if (dep.type === 'FS' || dep.type === 'FF') {
          latestFinish = minDate(latestFinish, constraintDate);
        } else {
          const duration = calculateTaskDuration(task, calendar);
          const lateStartFromConstraint = addWorkDays(constraintDate, -duration, calendar);
          latestFinish = minDate(latestFinish, addWorkDays(lateStartFromConstraint, duration, calendar));
        }
      });
      task.lateFinish = latestFinish;
    }

    const duration = calculateTaskDuration(task, calendar);
    task.lateStart = addWorkDays(task.lateFinish!, -duration, calendar);
    task.totalFloat = getWorkDaysBetween(task.earlyFinish!, task.lateFinish!, calendar);
    task.isCritical = task.totalFloat <= 0;
  });

  const criticalPath: string[] = [];
  taskMap.forEach((task, id) => {
    if (task.isCritical) {
      criticalPath.push(id);
    }
  });

  const projectDuration = getWorkDaysBetween(
    [...taskMap.values()].reduce((min, t) => minDate(min, t.earlyStart!), '9999-12-31'),
    projectEndDate,
    calendar
  );

  return {
    criticalPath,
    taskMap,
    projectDuration,
    projectEndDate,
  };
};

export const calculateDependentDates = (
  sourceTask: Task,
  depType: DependencyType,
  lag: number,
  targetDuration: number,
  calendar: CalendarConfig
): { startDate: string; endDate: string } => {
  let startDate: string;
  let endDate: string;

  switch (depType) {
    case 'FS':
      startDate = addWorkDays(sourceTask.endDate, 1 + lag, calendar);
      endDate = addWorkDays(startDate, targetDuration, calendar);
      break;
    case 'SS':
      startDate = addWorkDays(sourceTask.startDate, lag, calendar);
      endDate = addWorkDays(startDate, targetDuration, calendar);
      break;
    case 'FF':
      endDate = addWorkDays(sourceTask.endDate, lag, calendar);
      startDate = addWorkDays(endDate, -targetDuration, calendar);
      break;
    case 'SF':
      endDate = addWorkDays(sourceTask.startDate, lag, calendar);
      startDate = addWorkDays(endDate, -targetDuration, calendar);
      break;
    default:
      startDate = addWorkDays(sourceTask.endDate, 1 + lag, calendar);
      endDate = addWorkDays(startDate, targetDuration, calendar);
  }

  return { startDate, endDate };
};

export const propagateDateChanges = (
  modifiedTaskId: string,
  tasks: Task[],
  dependencies: Dependency[],
  calendar: CalendarConfig
): { updatedTasks: Task[]; circularDeps: boolean } => {
  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]));
  const modifiedTask = taskMap.get(modifiedTaskId);
  if (!modifiedTask) return { updatedTasks: [], circularDeps: false };

  const incoming = new Map<string, Dependency[]>();
  const outgoing = new Map<string, Dependency[]>();

  tasks.forEach((t) => {
    incoming.set(t.id, []);
    outgoing.set(t.id, []);
  });

  dependencies.forEach((dep) => {
    incoming.get(dep.targetId)!.push(dep);
    outgoing.get(dep.sourceId)!.push(dep);
  });

  const visited = new Set<string>();
  const inPath = new Set<string>();
  let circularDeps = false;

  const propagate = (taskId: string): void => {
    if (inPath.has(taskId)) {
      circularDeps = true;
      return;
    }
    if (visited.has(taskId)) return;

    inPath.add(taskId);
    visited.add(taskId);

    const outDeps = outgoing.get(taskId) || [];
    outDeps.forEach((dep) => {
      const target = taskMap.get(dep.targetId);
      if (!target) return;

      const source = taskMap.get(dep.sourceId)!;
      const duration = target.isMilestone ? 0 : getWorkDaysBetween(target.startDate, target.endDate, calendar);
      const newDates = calculateDependentDates(source, dep.type, dep.lag, duration, calendar);

      const startChanged = newDates.startDate !== target.startDate;
      const endChanged = newDates.endDate !== target.endDate;

      if (startChanged || endChanged) {
        target.startDate = newDates.startDate;
        target.endDate = newDates.endDate;
        target.duration = duration;
        propagate(dep.targetId);
      }
    });

    inPath.delete(taskId);
  };

  propagate(modifiedTaskId);

  const updatedTasks = Array.from(taskMap.values());
  return { updatedTasks, circularDeps };
};

export const calculateAggregatedDates = (
  tasks: Task[],
  calendar: CalendarConfig
): Task[] => {
  const updatedTasks = tasks.map((t) => ({ ...t }));
  const taskMap = new Map(updatedTasks.map((t) => [t.id, t]));

  const calculateParentDates = (taskId: string): { start: string; end: string } => {
    const task = taskMap.get(taskId)!;
    const children = updatedTasks.filter((t) => t.parentId === taskId);

    if (children.length === 0) {
      return { start: task.startDate, end: task.endDate };
    }

    let minStart = '9999-12-31';
    let maxEnd = '1900-01-01';

    children.forEach((child) => {
      const dates = calculateParentDates(child.id);
      if (dates.start < minStart) minStart = dates.start;
      if (dates.end > maxEnd) maxEnd = dates.end;
    });

    if (minStart !== task.startDate || maxEnd !== task.endDate) {
      task.startDate = minStart;
      task.endDate = maxEnd;
      task.duration = task.isMilestone ? 0 : getWorkDaysBetween(minStart, maxEnd, calendar);
    }

    return { start: minStart, end: maxEnd };
  };

  const roots = updatedTasks.filter((t) => t.parentId === null);
  roots.forEach((root) => calculateParentDates(root.id));

  return updatedTasks;
};

export const getProjectDateRange = (tasks: Task[]): { minDate: string; maxDate: string } => {
  if (tasks.length === 0) {
    const today = formatDate(new Date());
    return {
      minDate: addDays(today, -7),
      maxDate: addDays(today, 30),
    };
  }

  let min = '9999-12-31';
  let max = '1900-01-01';

  tasks.forEach((task) => {
    if (task.startDate < min) min = task.startDate;
    if (task.endDate > max) max = task.endDate;
  });

  min = addDays(min, -7);
  max = addDays(max, 7);

  return { minDate: min, maxDate: max };
};
