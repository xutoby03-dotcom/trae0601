import { Router, type Request, type Response } from 'express';
import {
  UsageRecord,
  UsageStatus,
  DeviceStatus,
  DisinfectionTask,
  DisinfectionTaskStatus,
  DisinfectionStep,
  DisinfectionStepIndex,
  ApiResponse,
} from '@shared/types';
import {
  mockUsages,
  mockDevices,
  mockDisinfectionTasks,
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

router.get('/', (req: Request, res: Response): void => {
  try {
    const { deviceId, date, doctor, patient, page = '1', pageSize = '20' } =
      req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 20;

    let filtered = [...mockUsages];

    if (deviceId) {
      filtered = filtered.filter((u) => u.deviceId === deviceId);
    }
    if (date) {
      const dateStr = date as string;
      filtered = filtered.filter((u) => u.startTime.startsWith(dateStr));
    }
    if (doctor) {
      filtered = filtered.filter((u) => u.doctor === doctor);
    }
    if (patient) {
      const patientStr = (patient as string).toLowerCase();
      filtered = filtered.filter((u) =>
        u.patientName.toLowerCase().includes(patientStr)
      );
    }

    filtered.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    const total = filtered.length;
    const start = (pageNum - 1) * pageSizeNum;
    const data = filtered.slice(start, start + pageSizeNum);

    const response: ApiResponse<UsageRecord[]> = {
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
    const usage = mockUsages.find((u) => u.id === id);
    if (!usage) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '使用记录不存在',
      };
      res.status(404).json(response);
      return;
    }
    const response: ApiResponse<UsageRecord> = {
      success: true,
      data: usage,
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

router.post('/', (req: Request, res: Response): void => {
  try {
    const body = req.body as Partial<UsageRecord>;

    const deviceIndex = mockDevices.findIndex((d) => d.id === body.deviceId);
    if (deviceIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备不存在',
      };
      res.status(404).json(response);
      return;
    }
    if (mockDevices[deviceIndex].status !== DeviceStatus.AVAILABLE) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备当前不可用',
      };
      res.status(400).json(response);
      return;
    }

    const nowTime = now();
    const newUsage: UsageRecord = {
      id: generateId(),
      deviceId: body.deviceId || '',
      deviceCode: mockDevices[deviceIndex].code,
      patientName: body.patientName || '',
      patientAge: body.patientAge || 0,
      doctor: body.doctor || '',
      medicine: body.medicine || '',
      medicineDose: body.medicineDose || 0,
      maskType: body.maskType! ,
      startTime: body.startTime || nowTime,
      durationMinutes: body.durationMinutes || 15,
      status: UsageStatus.ONGOING,
      remark: body.remark,
      createdAt: nowTime,
    };
    mockUsages.push(newUsage);
    mockDevices[deviceIndex].status = DeviceStatus.IN_USE;
    mockDevices[deviceIndex].updatedAt = nowTime;

    const response: ApiResponse<UsageRecord> = {
      success: true,
      data: newUsage,
      message: '创建使用记录成功',
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

router.patch('/:id/end', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const usageIndex = mockUsages.findIndex((u) => u.id === id);
    if (usageIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '使用记录不存在',
      };
      res.status(404).json(response);
      return;
    }
    if (mockUsages[usageIndex].status !== UsageStatus.ONGOING) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '该使用记录已结束',
      };
      res.status(400).json(response);
      return;
    }

    const nowTime = now();
    mockUsages[usageIndex].status = UsageStatus.FINISHED;
    mockUsages[usageIndex].endTime = nowTime;

    const deviceIndex = mockDevices.findIndex(
      (d) => d.id === mockUsages[usageIndex].deviceId
    );
    if (deviceIndex !== -1) {
      mockDevices[deviceIndex].status = DeviceStatus.PENDING_DISINFECTION;
      mockDevices[deviceIndex].updatedAt = nowTime;
    }

    const existingTask = mockDisinfectionTasks.find(
      (t) => t.usageId === mockUsages[usageIndex].id
    );
    if (!existingTask) {
      const newTask: DisinfectionTask = {
        id: generateId(),
        usageId: mockUsages[usageIndex].id,
        deviceId: mockUsages[usageIndex].deviceId,
        deviceCode: mockUsages[usageIndex].deviceCode,
        currentStep: 0,
        steps: createInitialSteps(),
        status: DisinfectionTaskStatus.PENDING,
        createdAt: nowTime,
      };
      mockDisinfectionTasks.push(newTask);
    }

    const response: ApiResponse<UsageRecord> = {
      success: true,
      data: mockUsages[usageIndex],
      message: '使用已结束，设备转为待消毒，已自动创建消毒任务',
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
