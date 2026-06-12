import { ComplianceStatus, Pet, PetWithStatus, VaccineRecord } from '../../shared/types';
import { diffInDays, parseDate, today } from './date';

export const STATUS_LABEL: Record<ComplianceStatus, string> = {
  compliant: '已合规',
  expiring: '即将到期',
  expired: '已过期',
  unvaccinated: '未接种',
};

export const STATUS_EMOJI: Record<ComplianceStatus, string> = {
  compliant: '✅',
  expiring: '⚠️',
  expired: '❌',
  unvaccinated: '🔴',
};

export const STATUS_PRIORITY: Record<ComplianceStatus, number> = {
  expired: 3,
  expiring: 2,
  compliant: 1,
  unvaccinated: 0,
};

export function computeRecordStatus(
  record: VaccineRecord,
  todayDate: Date = today()
): { status: ComplianceStatus; daysUntilDue: number } {
  const dueDate = parseDate(record.nextDueAt);
  const daysUntil = diffInDays(dueDate, todayDate);
  let status: ComplianceStatus;
  if (daysUntil < 0) {
    status = 'expired';
  } else if (daysUntil <= 30) {
    status = 'expiring';
  } else {
    status = 'compliant';
  }
  return { status, daysUntilDue: daysUntil };
}

export function computePetStatus(
  pet: Pet,
  records: VaccineRecord[],
  todayDate: Date = today()
): PetWithStatus {
  const petRecords = records.filter((r) => r.petId === pet.id);

  if (petRecords.length === 0) {
    return {
      ...pet,
      status: 'unvaccinated',
      hasProofPhoto: false,
    };
  }

  let worstStatus: ComplianceStatus = 'compliant';
  let worstRecord: VaccineRecord | undefined;
  let worstDays = Infinity;
  let minDays = Infinity;

  petRecords.forEach((r) => {
    const { status, daysUntilDue } = computeRecordStatus(r, todayDate);
    if (STATUS_PRIORITY[status] > STATUS_PRIORITY[worstStatus]) {
      worstStatus = status;
      worstRecord = r;
      worstDays = daysUntilDue;
    } else if (status === worstStatus && daysUntilDue < minDays) {
      minDays = daysUntilDue;
      worstRecord = r;
      worstDays = daysUntilDue;
    }
    if (daysUntilDue < minDays) minDays = daysUntilDue;
  });

  const hasProofPhoto = petRecords.some((r) => r.proofPhotoUrl);

  return {
    ...pet,
    status: worstStatus,
    latestRecord: worstRecord,
    daysUntilDue: worstDays,
    hasProofPhoto,
  };
}

export function getPetRecordsByStatus(
  pet: Pet,
  records: VaccineRecord[],
  status: ComplianceStatus,
  todayDate: Date = today()
): VaccineRecord[] {
  return records
    .filter((r) => r.petId === pet.id)
    .filter((r) => computeRecordStatus(r, todayDate).status === status)
    .sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
}

export function computeAllPetsWithStatus(
  pets: Pet[],
  records: VaccineRecord[]
): PetWithStatus[] {
  const t = today();
  return pets.map((p) => computePetStatus(p, records, t));
}
