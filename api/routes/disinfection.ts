import { Router, type Request, type Response } from 'express';
import {
  DisinfectionTask,
  DisinfectionTaskStatus,
  DeviceStatus,
  DisinfectionStep,
  DisinfectionStepIndex,
  ApiResponse,
  OVERDUE_THRESHOLD_MINUTES,
} from '@shared/types';
import {
  mockDisinfectionTasks,
  mockUsages,
  mockDevices,
} from '../data/mockData.js';

const router = Router();

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const now = () => new Date().toISOString();

const createInitialSteps = (): DisinfectionStep[] => {
  return [
    DisinfectionStepIndex.CLEANING,
    DisinfectionStepIndex.SOAKING,
    DisinfectionStepIndex.RINSING,
    DisinfectionStepIndex.DRYING,
    DisinfectionStepIndex.STORING,
  ].map((idx) => ({
    stepIndex: idx,
    stepName: ['清洗', '浸泡消毒', '无菌水冲洗', '晾干', '收纳'][idx - 1],
    operator: '',
    finishedAt: undefined,
    note: '',
  }));
};

const updateOverdueStatus = () => {
  const thresholdMs = OVERDUE_THRESHOLD_MINUTES * 60 * 1000;
  const currentTime = Date.now();
  mockDisinfectionTasks.forEach((task) => {
    if (
      task.status === DisinfectionTaskStatus.PENDING ||
      task.status === DisinfectionTaskStatus.IN_PROGRESS
    ) {
      const waitTime = currentTime - new Date(task.createdAt).getTime();
      if (waitTime > thresholdMs) {
        task.status = DisinfectionTaskStatus.OVERDUE;
      }
    }
  });
};

router.get('/queue', (req: Request, res: Response): void => {
  try {
    updateOverdueStatus();
    const queue = mockDisinfectionTasks.filter(
      (t) =>
        t.status === DisinfectionTaskStatus.PENDING ||
        t.status === DisinfectionTaskStatus.OVERDUE ||
        t.status === DisinfectionTaskStatus.IN_PROGRESS
    );
    queue.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const response: ApiResponse<DisinfectionTask[]> = {
      success: true,
      data: queue,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.get('/records', (req: Request, res: Response): void => {
  try {
    const { deviceId, date, staff, page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 20;

    updateOverdueStatus();
    let filtered = [...mockDisinfectionTasks];

    if (deviceId) {
      filtered = filtered.filter((t) => t.deviceId === deviceId);
    }
    if (date) {
      const dateStr = date as string;
      filtered = filtered.filter((t) => t.createdAt.startsWith(dateStr));
    }
    if (staff) {
      filtered = filtered.filter((t) =>
        t.steps.some((s) => s.operator === staff)
      );
    }

    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;
    const start = (pageNum - 1) * pageSizeNum;
    const data = filtered.slice(start, start + pageSizeNum);

    const response: ApiResponse<DisinfectionTask[]> = {
      success: true,
      data,
      total,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    updateOverdueStatus();
    const task = mockDisinfectionTasks.find((t) => t.id === id);
    if (!task) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '消毒任务不存在',
      };
      res.status(404).json(response);
      return;
    }
    const response: ApiResponse<DisinfectionTask> = {
      success: true,
      data: task,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.post('/start', (req: Request, res: Response): void => {
  try {
    const { usageId } = req.body as { usageId: string };

    let task = mockDisinfectionTasks.find((t) => t.usageId === usageId);
    const usage = mockUsages.find((u) => u.id === usageId);

    if (!usage) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '使用记录不存在',
      };
      res.status(404).json(response);
      return;
    }

    const nowTime = now();

    if (!task) {
      task = {
        id: generateId(),
        usageId,
        deviceId: usage.deviceId,
        deviceCode: usage.deviceCode,
        currentStep: 0,
        steps: createInitialSteps(),
        status: DisinfectionTaskStatus.IN_PROGRESS,
        createdAt: nowTime,
      };
      mockDisinfectionTasks.push(task);
    } else {
      task.status = DisinfectionTaskStatus.IN_PROGRESS;
    }

    const deviceIndex = mockDevices.findIndex((d) => d.id === usage.deviceId);
    if (deviceIndex !== -1) {
      mockDevices[deviceIndex].status = DeviceStatus.DISINFECTING;
      mockDevices[deviceIndex].updatedAt = nowTime;
    }

    const response: ApiResponse<DisinfectionTask> = {
      success: true,
      data: task,
      message: '消毒任务已开始',
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.patch('/:id/step', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { step, staff, note } = req.body as {
      step: number;
      staff: string;
      note?: string;
    };

    const taskIndex = mockDisinfectionTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '消毒任务不存在',
      };
      res.status(404).json(response);
      return;
    }

    const task = mockDisinfectionTasks[taskIndex];
    if (task.status === DisinfectionTaskStatus.COMPLETED) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '任务已完成，无法更新步骤',
      };
      res.status(400).json(response);
      return;
    }

    const stepIndex = task.steps.findIndex((s) => s.stepIndex === step);
    if (stepIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '步骤不存在',
      };
      res.status(400).json(response);
      return;
    }

    const nowTime = now();
    task.steps[stepIndex].operator = staff;
    task.steps[stepIndex].finishedAt = nowTime;
    if (note !== undefined) {
      task.steps[stepIndex].note = note;
    }
    task.currentStep = step;
    task.status = DisinfectionTaskStatus.IN_PROGRESS;

    const deviceIndex = mockDevices.findIndex((d) => d.id === task.deviceId);
    if (deviceIndex !== -1) {
      mockDevices[deviceIndex].status = DeviceStatus.DISINFECTING;
      mockDevices[deviceIndex].updatedAt = nowTime;
    }

    const response: ApiResponse<DisinfectionTask> = {
      success: true,
      data: task,
      message: `步骤${step}已完成`,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

router.post('/:id/complete', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const taskIndex = mockDisinfectionTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '消毒任务不存在',
      };
      res.status(404).json(response);
      return;
    }

    const nowTime = now();
    mockDisinfectionTasks[taskIndex].status = DisinfectionTaskStatus.COMPLETED;
    mockDisinfectionTasks[taskIndex].currentStep = 5;
    mockDisinfectionTasks[taskIndex].completedAt = nowTime;

    const deviceIndex = mockDevices.findIndex(
      (d) => d.id === mockDisinfectionTasks[taskIndex].deviceId
    );
    if (deviceIndex !== -1) {
      mockDevices[deviceIndex].status = DeviceStatus.AVAILABLE;
      mockDevices[deviceIndex].updatedAt = nowTime;
    }

    const response: ApiResponse<DisinfectionTask> = {
      success: true,
      data: mockDisinfectionTasks[taskIndex],
      message: '消毒完成，设备已转为可用状态',
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: (error as Error).message,
    };
    res.status(500).json(response);
  }
});

export default router;
