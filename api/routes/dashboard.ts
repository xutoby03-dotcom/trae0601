import { Router, type Request, type Response } from 'express';
import {
  DeviceStatus,
  DisinfectionTaskStatus,
  DashboardStats,
  ClinicRoomUsage,
  Device,
  DisinfectionTask,
  InventoryItem,
  ApiResponse,
  OVERDUE_THRESHOLD_MINUTES,
  CLINIC_ROOMS,
} from '@shared/types';
import {
  mockDevices,
  mockDisinfectionTasks,
  mockUsages,
  mockInventory,
} from '../data/mockData.js';

const router = Router();

const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

const isOverdue = (task: DisinfectionTask): boolean => {
  if (task.status === DisinfectionTaskStatus.COMPLETED) return false;
  const thresholdMs = OVERDUE_THRESHOLD_MINUTES * 60 * 1000;
  const usage = mockUsages.find((u) => u.id === task.usageId);
  const baseTime = usage?.endTime ? new Date(usage.endTime).getTime() : new Date(task.createdAt).getTime();
  return Date.now() - baseTime > thresholdMs;
};

router.get('/stats', (req: Request, res: Response): void => {
  try {
    const todayStr = getTodayStr();

    const totalDevices = mockDevices.filter(
      (d) => d.status !== DeviceStatus.SCRAPPED
    ).length;
    const availableDevices = mockDevices.filter(
      (d) => d.status === DeviceStatus.AVAILABLE
    ).length;
    const inUseDevices = mockDevices.filter(
      (d) => d.status === DeviceStatus.IN_USE
    ).length;
    const pendingDisinfection = mockDevices.filter(
      (d) => d.status === DeviceStatus.PENDING_DISINFECTION
    ).length;
    const overdueTasks = mockDisinfectionTasks.filter(isOverdue).length;
    const todayUsageCount = mockUsages.filter((u) =>
      u.startTime.startsWith(todayStr)
    ).length;

    const stats: DashboardStats = {
      totalDevices,
      availableDevices,
      inUseDevices,
      pendingDisinfection,
      overdueTasks,
      todayUsageCount,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
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

router.get('/status-distribution', (req: Request, res: Response): void => {
  try {
    const statuses = [
      DeviceStatus.AVAILABLE,
      DeviceStatus.IN_USE,
      DeviceStatus.PENDING_DISINFECTION,
      DeviceStatus.DISINFECTING,
      DeviceStatus.SCRAPPED,
    ];
    const distribution = statuses.map((status) => ({
      status,
      count: mockDevices.filter((d) => d.status === status).length,
    }));

    const response: ApiResponse<{ status: DeviceStatus; count: number }[]> = {
      success: true,
      data: distribution,
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

router.get('/clinic-usage', (req: Request, res: Response): void => {
  try {
    const todayStr = getTodayStr();
    const todayUsages = mockUsages.filter((u) =>
      u.startTime.startsWith(todayStr)
    );

    const result: ClinicRoomUsage[] = CLINIC_ROOMS.map((room) => {
      const deviceIds = mockDevices
        .filter((d) => d.clinicRoom === room)
        .map((d) => d.id);
      const count = todayUsages.filter((u) => deviceIds.includes(u.deviceId)).length;
      return { room, count };
    });

    const response: ApiResponse<ClinicRoomUsage[]> = {
      success: true,
      data: result,
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

router.get('/overdue-alerts', (req: Request, res: Response): void => {
  try {
    const overdueTasks = mockDisinfectionTasks.filter(isOverdue);

    const result = overdueTasks.map((task) => {
      const device = mockDevices.find((d) => d.id === task.deviceId);
      const usage = mockUsages.find((u) => u.id === task.usageId);
      const baseTime = usage?.endTime ? new Date(usage.endTime).getTime() : new Date(task.createdAt).getTime();
      return {
        taskId: task.id,
        deviceId: task.deviceId,
        deviceCode: task.deviceCode || device?.code,
        clinicRoom: device?.clinicRoom,
        createdAt: task.createdAt,
        waitMinutes: Math.floor(
          (Date.now() - baseTime) / 60000
        ),
      };
    });

    result.sort((a, b) => b.waitMinutes - a.waitMinutes);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
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

router.get('/low-stock', (req: Request, res: Response): void => {
  try {
    const lowStockItems = mockInventory
      .filter((item) => item.currentStock <= item.safetyStock)
      .map((item) => ({
        ...item,
        shortage: item.safetyStock - item.currentStock,
      }))
      .sort((a, b) => b.shortage - a.shortage);

    const response: ApiResponse<
      (InventoryItem & { shortage: number })[]
    > = {
      success: true,
      data: lowStockItems,
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
