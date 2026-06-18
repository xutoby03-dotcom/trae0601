import {
  DashboardStats,
  ExpiringVaccineItem,
  PendingMaterialItem,
  HighRiskItem,
  Pet,
  Stay,
  EXPIRING_WARNING_DAYS
} from '../../shared/types.js';
import { StayRepository } from '../repositories/StayRepository.js';
import { VaccineRepository } from '../repositories/VaccineRepository.js';
import { PetRepository } from '../repositories/PetRepository.js';
import { DailyRecordRepository } from '../repositories/DailyRecordRepository.js';
import { VaccinationService } from './VaccinationService.js';

export interface DashboardData {
  stats: DashboardStats;
  expiringVaccines: ExpiringVaccineItem[];
  pendingMaterials: PendingMaterialItem[];
  highRiskList: HighRiskItem[];
  todayAbnormalCount: number;
}

export const DashboardService = {
  getStats(): DashboardStats {
    const todayCheckIn = StayRepository.findTodayCheckIn();
    const todayCheckOut = StayRepository.findTodayCheckOut();
    const currentlyStaying = StayRepository.findCurrentlyStaying();
    const isolationCount = StayRepository.findIsolationCount();
    const highRiskCount = StayRepository.findHighRiskCount();

    const pendingVaccination = StayRepository.findPendingVaccination();
    let pendingMaterials = pendingVaccination.length;

    const expiringVaccines = VaccineRepository.findExpiring(EXPIRING_WARNING_DAYS);
    pendingMaterials += expiringVaccines.filter(v => v.daysRemaining <= 7).length;

    return {
      todayCheckIn,
      todayCheckOut,
      currentlyStaying,
      pendingMaterials,
      isolationCount,
      highRiskCount
    };
  },

  getExpiringVaccines(days: number = EXPIRING_WARNING_DAYS): ExpiringVaccineItem[] {
    const expiring = VaccineRepository.findExpiring(days);
    return expiring
      .map(v => {
        const pet = PetRepository.findById(v.petId);
        if (!pet) return null;
        const { daysRemaining: _, ...vaccine } = v;
        return {
          pet,
          vaccine,
          daysRemaining: v.daysRemaining
        };
      })
      .filter(item => item !== null) as ExpiringVaccineItem[];
  },

  getPendingMaterials(): PendingMaterialItem[] {
    const pendingVaccination = StayRepository.findPendingVaccination();
    const pendingList: PendingMaterialItem[] = [];

    for (const stay of pendingVaccination) {
      const validationResult = VaccinationService.validatePetVaccinations(stay.petId);
      if (!validationResult.overallPass) {
        pendingList.push({
          pet: stay.pet,
          stay,
          missingItems: validationResult.missingDocuments,
          submittedAt: stay.createdAt
        });
      }
    }

    const expiringUrgent = VaccineRepository.findExpiring(7);
    for (const vaccine of expiringUrgent) {
      const pet = PetRepository.findById(vaccine.petId);
      if (pet) {
        const existingStay = pendingList.find(p => p.pet.id === pet.id);
        if (!existingStay) {
          const stays = StayRepository.findByPetId(pet.id);
          const activeStay = stays.find(s => s.status === 'checked-in' || s.status === 'confirmed');
          pendingList.push({
            pet,
            stay: activeStay,
            missingItems: [`${vaccine.name}将在${vaccine.daysRemaining}天后到期`],
            submittedAt: vaccine.vaccinationDate
          });
        }
      }
    }

    return pendingList;
  },

  getHighRiskList(): HighRiskItem[] {
    const highRiskStays = StayRepository.findHighRiskStays();
    return highRiskStays.map(stay => {
      const riskReasons: string[] = [];
      if (stay.requiresIsolation) {
        riskReasons.push('需要隔离');
      }
      if (stay.highRiskReason) {
        riskReasons.push(stay.highRiskReason);
      }
      return {
        pet: stay.pet,
        stay,
        riskReasons
      };
    });
  },

  getTodayAbnormalCount(): number {
    return DailyRecordRepository.getAbnormalCountToday();
  },

  getAllData(): DashboardData {
    return {
      stats: this.getStats(),
      expiringVaccines: this.getExpiringVaccines(),
      pendingMaterials: this.getPendingMaterials(),
      highRiskList: this.getHighRiskList(),
      todayAbnormalCount: this.getTodayAbnormalCount()
    };
  },

  getHighRiskPets() {
    return this.getHighRiskList();
  },

  getDailySummary() {
    const todayRecords = DailyRecordRepository.findTodayRecords();
    const abnormalCount = DailyRecordRepository.getAbnormalCountToday();

    return {
      totalCheckedIn: todayRecords.length,
      recordedCount: todayRecords.filter(r => r.hasRecord).length,
      unrecordedCount: todayRecords.filter(r => !r.hasRecord).length,
      abnormalCount,
      highRiskCount: todayRecords.filter(r => r.stay.highRisk).length
    };
  }
};
