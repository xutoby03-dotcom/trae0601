import { chairRepository } from '../repositories/ChairRepository';
import { damageRepository } from '../repositories/DamageRepository';
import { Chair, DamageRecord } from '../../shared/types';

export class ChairService {
  getAllChairs(): Chair[] {
    return chairRepository.findAll();
  }

  getChairById(id: number): Chair | undefined {
    return chairRepository.findById(id);
  }

  getAvailableChairs(date: string, startTime: string, endTime: string): Chair[] {
    return chairRepository.findAvailableForDate(date, startTime, endTime);
  }

  getChairDamageRecords(chairId: number): DamageRecord[] {
    return damageRepository.findByChairId(chairId);
  }

  updateChairStatus(id: number, status: Chair['status']): void {
    chairRepository.updateStatus(id, status);
  }
}

export const chairService = new ChairService();
