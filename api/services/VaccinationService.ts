import { VaccineRecord, VaccinationCheckResult, Pet, VaccineType, EXPIRING_WARNING_DAYS } from '../../shared/types.js';
import { VaccineRepository } from '../repositories/VaccineRepository.js';
import { PetRepository } from '../repositories/PetRepository.js';
import { validateVaccinations, calculateExpiryDate } from '../utils/vaccineValidator.js';
import { getVaccineStatus } from '../utils/dateUtils.js';

export interface CreateVaccineParams {
  petId: number;
  type: VaccineType;
  name: string;
  vaccinationDate: string;
  certificateUrl?: string;
  notes?: string;
}

export const VaccinationService = {
  getByPetId(petId: number): VaccineRecord[] {
    return VaccineRepository.findByPetId(petId);
  },

  getById(id: number): VaccineRecord {
    const vaccine = VaccineRepository.findById(id);
    if (!vaccine) {
      throw new Error('疫苗记录不存在');
    }
    return vaccine;
  },

  create(params: CreateVaccineParams): VaccineRecord {
    const pet = PetRepository.findById(params.petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    const expiryDate = calculateExpiryDate(params.vaccinationDate, params.type, pet.species);
    const status = getVaccineStatus(expiryDate, EXPIRING_WARNING_DAYS);

    return VaccineRepository.create({
      petId: params.petId,
      type: params.type,
      name: params.name,
      vaccinationDate: params.vaccinationDate,
      expiryDate,
      certificateUrl: params.certificateUrl,
      status,
      verified: false,
      notes: params.notes
    });
  },

  update(id: number, updates: Partial<Omit<VaccineRecord, 'id' | 'petId'>>): VaccineRecord {
    const existing = VaccineRepository.findById(id);
    if (!existing) {
      throw new Error('疫苗记录不存在');
    }

    const pet = PetRepository.findById(existing.petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }

    let status = existing.status;
    let expiryDate = existing.expiryDate;

    if (updates.vaccinationDate || updates.type) {
      const newVaccinationDate = updates.vaccinationDate || existing.vaccinationDate;
      const newType = updates.type || existing.type;
      expiryDate = calculateExpiryDate(newVaccinationDate, newType, pet.species);
      status = getVaccineStatus(expiryDate, EXPIRING_WARNING_DAYS);
    }

    const updated = VaccineRepository.update(id, {
      ...updates,
      expiryDate: updates.vaccinationDate || updates.type ? expiryDate : updates.expiryDate,
      status: updates.vaccinationDate || updates.type || updates.expiryDate ? status : updates.status
    });

    if (!updated) {
      throw new Error('更新失败');
    }
    return updated;
  },

  delete(id: number): boolean {
    const existing = VaccineRepository.findById(id);
    if (!existing) {
      throw new Error('疫苗记录不存在');
    }
    return VaccineRepository.delete(id);
  },

  verify(id: number, verifiedBy: number, notes?: string): VaccineRecord {
    const existing = VaccineRepository.findById(id);
    if (!existing) {
      throw new Error('疫苗记录不存在');
    }
    const verified = VaccineRepository.verify(id, verifiedBy, notes);
    if (!verified) {
      throw new Error('核验失败');
    }
    return verified;
  },

  validatePetVaccinations(petId: number): VaccinationCheckResult {
    const pet = PetRepository.findById(petId);
    if (!pet) {
      throw new Error('宠物不存在');
    }
    const vaccines = VaccineRepository.findByPetId(petId);
    return validateVaccinations(pet, vaccines);
  },

  validatePetVaccinationsWithPet(pet: Pet): VaccinationCheckResult {
    const vaccines = VaccineRepository.findByPetId(pet.id);
    return validateVaccinations(pet, vaccines);
  },

  calculateExpiryDate(vaccinationDate: string, vaccineType: VaccineType, species: Pet['species']): string {
    return calculateExpiryDate(vaccinationDate, vaccineType, species);
  },

  getExpiringVaccines(days: number = 30): (VaccineRecord & { daysRemaining: number; pet?: Pet })[] {
    const expiring = VaccineRepository.findExpiring(days);
    return expiring.map(v => ({
      ...v,
      pet: PetRepository.findById(v.petId)
    }));
  },

  updateVaccineStatus(id: number): VaccineRecord {
    const vaccine = VaccineRepository.findById(id);
    if (!vaccine) {
      throw new Error('疫苗记录不存在');
    }
    const status = getVaccineStatus(vaccine.expiryDate, EXPIRING_WARNING_DAYS);
    if (status !== vaccine.status) {
      VaccineRepository.updateStatus(id, status);
      const updated = VaccineRepository.findById(id);
      if (!updated) {
        throw new Error('更新失败');
      }
      return updated;
    }
    return vaccine;
  },

  checkPetVaccinations(petId: number): VaccinationCheckResult {
    return this.validatePetVaccinations(petId);
  },

  getExpiring(days: number = 30): (VaccineRecord & { daysRemaining: number; pet?: Pet })[] {
    return this.getExpiringVaccines(days);
  }
};
