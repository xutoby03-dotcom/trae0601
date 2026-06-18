import { Stay, Pet } from '../../shared/types.js';
import { StayRepository, StayWithRelations } from '../repositories/StayRepository.js';
import { PetRepository } from '../repositories/PetRepository.js';
import { CageRepository } from '../repositories/CageRepository.js';
import { VaccinationService } from './VaccinationService.js';

export interface StayListParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface StayListResult {
  data: StayWithRelations[];
  total: number;
}

export interface CreateStayParams {
  petId: number;
  checkInDate: string;
  checkOutDate: string;
  cageId?: number;
  requiresIsolation?: boolean;
  notes?: string;
}

export interface CheckInParams {
  stayId: number;
  cageId: number;
  assignedStaffId?: number;
}

export interface CheckOutParams {
  stayId: number;
  notes?: string;
}

export const StayService = {
  list(params: StayListParams = {}): StayListResult {
    const { status, page = 1, pageSize = 20 } = params;
    return StayRepository.findAll(status, page, pageSize);
  },

  getById(id: number): StayWithRelations {
    const stay = StayRepository.findById(id);
    if (!stay) {
      throw new Error('寄养订单不存在');
    }
    return stay;
  },

  getByPetId(petId: number): Stay[] {
    return StayRepository.findByPetId(petId);
  },

  async create(params: CreateStayParams): Promise<StayWithRelations> {
    const pet = PetRepository.findById(params.petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    const validationResult = VaccinationService.validatePetVaccinations(params.petId);
    const vaccinationVerified = validationResult.overallPass;

    let highRisk = false;
    let highRiskReason: string | undefined;

    if (params.requiresIsolation) {
      highRisk = true;
      highRiskReason = '需要隔离';
    }

    const stay = StayRepository.create({
      petId: params.petId,
      cageId: params.cageId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      status: 'pending',
      vaccinationVerified,
      requiresIsolation: params.requiresIsolation || false,
      highRisk,
      highRiskReason,
      notes: params.notes
    });

    if (params.cageId) {
      CageRepository.setOccupied(params.cageId, stay.id);
    }

    return this.getById(stay.id);
  },

  update(id: number, updates: Partial<Omit<Stay, 'id' | 'createdAt'>>): StayWithRelations {
    const existing = StayRepository.findById(id);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (updates.cageId !== undefined && updates.cageId !== existing.cageId) {
      if (existing.cageId) {
        CageRepository.setAvailable(existing.cageId);
      }
      if (updates.cageId) {
        CageRepository.setOccupied(updates.cageId, id);
      }
    }

    const updated = StayRepository.update(id, updates);
    if (!updated) {
      throw new Error('更新失败');
    }
    return this.getById(id);
  },

  delete(id: number): boolean {
    const existing = StayRepository.findById(id);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (existing.cageId) {
      CageRepository.setAvailable(existing.cageId);
    }

    return StayRepository.delete(id);
  },

  checkIn(params: CheckInParams): StayWithRelations {
    const existing = StayRepository.findById(params.stayId);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (existing.status !== 'confirmed' && existing.status !== 'pending') {
      throw new Error('订单状态不允许入住');
    }

    if (!existing.vaccinationVerified) {
      throw new Error('疫苗未核验通过，不能入住');
    }

    const cage = CageRepository.findById(params.cageId);
    if (!cage) {
      throw new Error('笼位不存在');
    }

    if (cage.status !== 'available') {
      throw new Error('笼位不可用');
    }

    if (existing.cageId) {
      CageRepository.setAvailable(existing.cageId);
    }

    CageRepository.setOccupied(params.cageId, params.stayId);

    const updated = StayRepository.checkIn(params.stayId, params.cageId, params.assignedStaffId);
    if (!updated) {
      throw new Error('入住失败');
    }

    return this.getById(params.stayId);
  },

  checkOut(params: CheckOutParams): StayWithRelations {
    const existing = StayRepository.findById(params.stayId);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (existing.status !== 'checked-in') {
      throw new Error('订单状态不允许退房');
    }

    if (existing.cageId) {
      CageRepository.setAvailable(existing.cageId);
    }

    const updated = StayRepository.checkOut(params.stayId, params.notes);
    if (!updated) {
      throw new Error('退房失败');
    }

    return this.getById(params.stayId);
  },

  cancel(id: number): StayWithRelations {
    const existing = StayRepository.findById(id);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (existing.status === 'checked-in' || existing.status === 'checked-out') {
      throw new Error('订单状态不允许取消');
    }

    if (existing.cageId) {
      CageRepository.setAvailable(existing.cageId);
    }

    const updated = StayRepository.update(id, { status: 'cancelled' });
    if (!updated) {
      throw new Error('取消失败');
    }

    return this.getById(id);
  },

  confirm(id: number): StayWithRelations {
    const existing = StayRepository.findById(id);
    if (!existing) {
      throw new Error('寄养订单不存在');
    }

    if (existing.status !== 'pending') {
      throw new Error('订单状态不允许确认');
    }

    const updated = StayRepository.update(id, { status: 'confirmed' });
    if (!updated) {
      throw new Error('确认失败');
    }

    return this.getById(id);
  },

  getPendingVaccination(): (Stay & { pet: Pet })[] {
    return StayRepository.findPendingVaccination();
  },

  getHighRiskStays(): (Stay & { pet: Pet })[] {
    return StayRepository.findHighRiskStays();
  },

  getTodayCheckInCount(): number {
    return StayRepository.findTodayCheckIn();
  },

  getTodayCheckOutCount(): number {
    return StayRepository.findTodayCheckOut();
  },

  getCurrentlyStayingCount(): number {
    return StayRepository.findCurrentlyStaying();
  },

  getIsolationCount(): number {
    return StayRepository.findIsolationCount();
  },

  getHighRiskCount(): number {
    return StayRepository.findHighRiskCount();
  }
};
