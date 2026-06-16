import { Request, Response } from 'express';
import { chairService } from '../services/ChairService';
import { ApiResponse } from '../../shared/types';

export class ChairController {
  async getAllChairs(req: Request, res: Response) {
    try {
      const chairs = chairService.getAllChairs();
      res.json({
        success: true,
        data: chairs,
      } as ApiResponse);
    } catch (error) {
      console.error('Get chairs error:', error);
      res.status(500).json({
        success: false,
        message: '获取躺椅列表失败',
      } as ApiResponse);
    }
  }

  async getChairById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const chair = chairService.getChairById(id);
      
      if (!chair) {
        return res.status(404).json({
          success: false,
          message: '躺椅不存在',
        } as ApiResponse);
      }

      const damageRecords = chairService.getChairDamageRecords(id);

      res.json({
        success: true,
        data: { chair, damageRecords },
      } as ApiResponse);
    } catch (error) {
      console.error('Get chair error:', error);
      res.status(500).json({
        success: false,
        message: '获取躺椅详情失败',
      } as ApiResponse);
    }
  }

  async getAvailableChairs(req: Request, res: Response) {
    try {
      const { date, startTime, endTime } = req.query;
      
      if (!date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: '请提供日期和时间段',
        } as ApiResponse);
      }

      const chairs = chairService.getAvailableChairs(
        date as string,
        startTime as string,
        endTime as string
      );

      res.json({
        success: true,
        data: chairs,
      } as ApiResponse);
    } catch (error) {
      console.error('Get available chairs error:', error);
      res.status(500).json({
        success: false,
        message: '获取可用躺椅失败',
      } as ApiResponse);
    }
  }
}

export const chairController = new ChairController();
