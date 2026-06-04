import { Task, Dependency, CalendarConfig, ResourceConflict, ProjectData } from '../types';
import { isDateInRange } from './dateUtils';

export const detectResourceConflicts = (tasks: Task[]): ResourceConflict[] => {
  const conflicts: ResourceConflict[] = [];
  const resourceTasks = new Map<string, Task[]>();

  tasks.forEach((task) => {
    if (task.assignees.length === 0 || task.isMilestone) return;
    task.assignees.forEach((resource) => {
      if (!resourceTasks.has(resource)) {
        resourceTasks.set(resource, []);
      }
      resourceTasks.get(resource)!.push(task);
    });
  });

  resourceTasks.forEach((taskList, resource) => {
    for (let i = 0; i < taskList.length; i++) {
      for (let j = i + 1; j < taskList.length; j++) {
        const t1 = taskList[i];
        const t2 = taskList[j];

        const overlapStart = t1.startDate > t2.startDate ? t1.startDate : t2.startDate;
        const overlapEnd = t1.endDate < t2.endDate ? t1.endDate : t2.endDate;

        if (overlapStart <= overlapEnd) {
          conflicts.push({
            resource,
            task1Id: t1.id,
            task2Id: t2.id,
            startDate: overlapStart,
            endDate: overlapEnd,
          });
        }
      }
    }
  });

  return conflicts;
};

export const exportToJSON = (
  tasks: Task[],
  dependencies: Dependency[],
  calendar: CalendarConfig,
  resources: string[]
): string => {
  const data: ProjectData = { tasks, dependencies, calendar, resources };
  return JSON.stringify(data, null, 2);
};

export const exportToCSV = (tasks: Task[], dependencies: Dependency[]): string => {
  const taskCSV = [
    ['ID', '任务名称', '开始日期', '结束日期', '工期(天)', '进度(%)', '里程碑', '负责人', '父任务ID'].join(','),
  ];

  tasks.forEach((task) => {
    taskCSV.push(
      [
        task.id,
        `"${task.name.replace(/"/g, '""')}"`,
        task.startDate,
        task.endDate,
        task.duration,
        task.progress,
        task.isMilestone ? '是' : '否',
        `"${task.assignees.join('; ')}"`,
        task.parentId || '',
      ].join(',')
    );
  });

  const depCSV = [
    ['\n依赖ID', '源任务ID', '目标任务ID', '类型', '延后天数'].join(','),
  ];

  dependencies.forEach((dep) => {
    depCSV.push([dep.id, dep.sourceId, dep.targetId, dep.type, dep.lag].join(','));
  });

  return taskCSV.join('\n') + depCSV.join('\n');
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsPNG = async (elementId: string, filename: string = 'gantt-chart.png'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('PNG export failed:', error);
    throw error;
  }
};

export const importFromJSON = (jsonString: string): ProjectData => {
  try {
    const data = JSON.parse(jsonString) as ProjectData;
    if (!data.tasks || !data.dependencies || !data.calendar || !data.resources) {
      throw new Error('Invalid JSON format');
    }
    return data;
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('导入失败：JSON格式错误');
  }
};
