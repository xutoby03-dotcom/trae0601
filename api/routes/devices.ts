import { Router, type Request, type Response } from 'express';
import { Device, DeviceStatus, ApiResponse } from '@shared/types';
import { mockDevices } from '../data/mockData.js';

const router = Router();

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const now = () => new Date().toISOString();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { status, clinicRoom, keyword, page = '1', pageSize = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 20;

    let filtered = [...mockDevices];

    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (clinicRoom) {
      filtered = filtered.filter((d) => d.clinicRoom === clinicRoom);
    }
    if (keyword) {
      const kw = (keyword as string).toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.code.toLowerCase().includes(kw) ||
          d.brand.toLowerCase().includes(kw) ||
          d.model.toLowerCase().includes(kw)
      );
    }

    const total = filtered.length;
    const start = (pageNum - 1) * pageSizeNum;
    const data = filtered.slice(start, start + pageSizeNum);

    const response: ApiResponse<Device[]> = {
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
    const device = mockDevices.find((d) => d.id === id);
    if (!device) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备不存在',
      };
      res.status(404).json(response);
      return;
    }
    const response: ApiResponse<Device> = {
      success: true,
      data: device,
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
    const body = req.body as Partial<Device>;
    const nowTime = now();
    const newDevice: Device = {
      id: generateId(),
      code: body.code || '',
      brand: body.brand || '',
      model: body.model || '',
      ageRange: body.ageRange || '',
      accessories: body.accessories || [],
      clinicRoom: body.clinicRoom || '',
      photo: body.photo || '',
      status: body.status || DeviceStatus.AVAILABLE,
      purchaseDate: body.purchaseDate || nowTime,
      lastMaintenanceDate: body.lastMaintenanceDate,
      remark: body.remark,
      createdAt: nowTime,
      updatedAt: nowTime,
    };
    mockDevices.push(newDevice);
    const response: ApiResponse<Device> = {
      success: true,
      data: newDevice,
      message: '创建设备成功',
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

router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备不存在',
      };
      res.status(404).json(response);
      return;
    }
    const body = req.body as Partial<Device>;
    const updated: Device = {
      ...mockDevices[index],
      ...body,
      id: mockDevices[index].id,
      createdAt: mockDevices[index].createdAt,
      updatedAt: now(),
    };
    mockDevices[index] = updated;
    const response: ApiResponse<Device> = {
      success: true,
      data: updated,
      message: '更新设备成功',
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

router.patch('/:id/status', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: DeviceStatus };
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备不存在',
      };
      res.status(404).json(response);
      return;
    }
    mockDevices[index].status = status;
    mockDevices[index].updatedAt = now();
    const response: ApiResponse<Device> = {
      success: true,
      data: mockDevices[index],
      message: '更新状态成功',
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

router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: '设备不存在',
      };
      res.status(404).json(response);
      return;
    }
    mockDevices[index].status = DeviceStatus.SCRAPPED;
    mockDevices[index].updatedAt = now();
    const response: ApiResponse<Device> = {
      success: true,
      data: mockDevices[index],
      message: '设备已报废',
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
