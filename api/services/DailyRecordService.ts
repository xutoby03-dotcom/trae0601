import { DailyRecord } from '../../shared/types.js';
import { DailyRecordRepository, TodayRecordItem } from '../repositories/DailyRecordRepository.js';
import { StayRepository } from '../repositories/StayRepository.js';

export interface CreateDailyRecordParams {
  stayId: number;
  recordDate: string;
  feeding: string;
  defecation: DailyRecord['defecation'];
  defecationCount: number;
  mentalState: DailyRecord['mentalState'];
  waterIntake?: string;
  exercise?: string;
  abnormal: boolean;
  abnormalDescription?: string;
  abnormalPhotos?: string[];
  handlingMeasures?: string;
  recordedBy: number;
}

export const DailyRecordService = {
  getByStayId(stayId: number): DailyRecord[] {
    return DailyRecordRepository.findByStayId(stayId);
  },

  getById(id: number): DailyRecord {
    const record = DailyRecordRepository.findById(id);
    if (!record) {
      throw new Error('日常记录不存在');
    }
    return record;
  },

  getTodayRecords(): TodayRecordItem[] {
    return DailyRecordRepository.findTodayRecords();
  },

  getByStayAndDate(stayId: number, date: string): DailyRecord | undefined {
    return DailyRecordRepository.findByStayAndDate(stayId, date);
  },

  hasRecordToday(stayId: number): boolean {
    return DailyRecordRepository.hasRecordToday(stayId);
  },

  create(params: CreateDailyRecordParams): DailyRecord {
    const stay = StayRepository.findById(params.stayId);
    if (!stay) {
      throw new Error('寄养订单不存在');
    }

    if (stay.status !== 'checked-in') {
      throw new Error('订单未入住，不能创建日常记录');
    }

    if (DailyRecordRepository.hasRecordToday(params.stayId)) {
      throw new Error('今日已创建记录');
    }

    return DailyRecordRepository.create({
      stayId: params.stayId,
      recordDate: params.recordDate,
      feeding: params.feeding,
      defecation: params.defecation,
      defecationCount: params.defecationCount,
      mentalState: params.mentalState,
      waterIntake: params.waterIntake,
      exercise: params.exercise,
      abnormal: params.abnormal,
      abnormalDescription: params.abnormalDescription,
      abnormalPhotos: params.abnormalPhotos,
      handlingMeasures: params.handlingMeasures,
      recordedBy: params.recordedBy
    });
  },

  update(id: number, updates: Partial<Omit<DailyRecord, 'id' | 'stayId' | 'createdAt'>>): DailyRecord {
    const existing = DailyRecordRepository.findById(id);
    if (!existing) {
      throw new Error('日常记录不存在');
    }

    const updated = DailyRecordRepository.update(id, updates);
    if (!updated) {
      throw new Error('更新失败');
    }
    return updated;
  },

  delete(id: number): boolean {
    const existing = DailyRecordRepository.findById(id);
    if (!existing) {
      throw new Error('日常记录不存在');
    }
    return DailyRecordRepository.delete(id);
  },

  getAbnormalCountToday(): number {
    return DailyRecordRepository.getAbnormalCountToday();
  }
};
