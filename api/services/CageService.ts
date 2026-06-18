import { Cage } from '../../shared/types.js';
import { CageRepository } from '../repositories/CageRepository.js';

export interface CageListParams {
  type?: string;
  status?: string;
  suitableFor?: string;
}

export interface AvailableCageParams {
  checkInDate: string;
  checkOutDate: string;
  suitableFor?: string;
}

export const CageService = {
  list(params: CageListParams = {}): Cage[] {
    const { type, status, suitableFor } = params;
    return CageRepository.findAll(type, status, suitableFor);
  },

  getAvailable(params: AvailableCageParams): Cage[] {
    const { checkInDate, checkOutDate, suitableFor } = params;
    return CageRepository.findAvailable(checkInDate, checkOutDate, suitableFor);
  },

  getById(id: number): Cage {
    const cage = CageRepository.findById(id);
    if (!cage) {
      throw new Error('笼位不存在');
    }
    return cage;
  },

  getByCode(code: string): Cage {
    const cage = CageRepository.findByCode(code);
    if (!cage) {
      throw new Error('笼位不存在');
    }
    return cage;
  },

  create(cageData: Omit<Cage, 'id'>): Cage {
    const existing = CageRepository.findByCode(cageData.code);
    if (existing) {
      throw new Error('笼位编号已存在');
    }
    return CageRepository.create(cageData);
  },

  update(id: number, updates: Partial<Omit<Cage, 'id'>>): Cage {
    const existing = CageRepository.findById(id);
    if (!existing) {
      throw new Error('笼位不存在');
    }

    if (updates.code && updates.code !== existing.code) {
      const codeExists = CageRepository.findByCode(updates.code);
      if (codeExists) {
        throw new Error('笼位编号已存在');
      }
    }

    const updated = CageRepository.update(id, updates);
    if (!updated) {
      throw new Error('更新失败');
    }
    return updated;
  },

  delete(id: number): boolean {
    const existing = CageRepository.findById(id);
    if (!existing) {
      throw new Error('笼位不存在');
    }

    if (existing.status === 'occupied') {
      throw new Error('笼位正在使用中，不能删除');
    }

    return CageRepository.delete(id);
  },

  setOccupied(cageId: number, stayId: number): boolean {
    const cage = CageRepository.findById(cageId);
    if (!cage) {
      throw new Error('笼位不存在');
    }

    if (cage.status !== 'available') {
      throw new Error('笼位不可用');
    }

    return CageRepository.setOccupied(cageId, stayId);
  },

  setAvailable(cageId: number): Cage {
    const existing = CageRepository.findById(cageId);
    if (!existing) {
      throw new Error('笼位不存在');
    }

    const success = CageRepository.setAvailable(cageId);
    if (!success) {
      throw new Error('设置失败');
    }
    const updated = CageRepository.findById(cageId);
    if (!updated) {
      throw new Error('设置失败');
    }
    return updated;
  },

  setMaintenance(id: number, notes?: string): Cage {
    const existing = CageRepository.findById(id);
    if (!existing) {
      throw new Error('笼位不存在');
    }
    if (existing.status === 'occupied') {
      throw new Error('笼位正在使用中，无法设置为维护');
    }
    const updated = CageRepository.update(id, { status: 'maintenance', notes });
    if (!updated) {
      throw new Error('设置失败');
    }
    return updated;
  }
};
