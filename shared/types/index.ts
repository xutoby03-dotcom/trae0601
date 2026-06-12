export type PetType = 'dog' | 'cat' | 'other';
export type ComplianceStatus = 'compliant' | 'expiring' | 'expired' | 'unvaccinated';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  ownerName: string;
  building: string;
  phone: string;
  photoUrl?: string;
  createdAt: string;
}

export interface VaccineRecord {
  id: string;
  petId: string;
  vaccineName: string;
  vaccinatedAt: string;
  nextDueAt: string;
  hospital: string;
  proofPhotoUrl?: string;
  remark?: string;
  createdAt: string;
}

export interface PetWithStatus extends Pet {
  status: ComplianceStatus;
  latestRecord?: VaccineRecord;
  daysUntilDue?: number;
  hasProofPhoto: boolean;
}

export interface FilterState {
  building: string;
  petType: PetType | 'all';
  status: ComplianceStatus | 'all';
  keyword: string;
}
