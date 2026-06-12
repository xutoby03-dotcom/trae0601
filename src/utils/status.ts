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

  const sorted = [...petRecords].sort(
    (a, b) => parseDate(b.nextDueAt).getTime() - parseDate(a.nextDueAt).getTime()
  );
  const latest = sorted[0];
  const latestDate = parseDate(latest.nextDueAt);
  const daysUntil = diffInDays(latestDate, todayDate);

  let status: ComplianceStatus;
  if (daysUntil < 0) {
    status = 'expired';
  } else if (daysUntil <= 30) {
    status = 'expiring';
  } else {
    status = 'compliant';
  }

  const hasProofPhoto = petRecords.some((r) => r.proofPhotoUrl);

  return {
    ...pet,
    status,
    latestRecord: latest,
    daysUntilDue: daysUntil,
    hasProofPhoto,
  };
}

export function computeAllPetsWithStatus(
  pets: Pet[],
  records: VaccineRecord[]
): PetWithStatus[] {
  const t = today();
  return pets.map((p) => computePetStatus(p, records, t));
}
