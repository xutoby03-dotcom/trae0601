export type PetSpecies = 'cat' | 'dog';

export type PetSize = 'small' | 'medium' | 'large';

export type MissingStatus = 'missing' | 'seen' | 'found';

export type GroupType = 'recent' | 'seen' | 'found' | 'urgent';

export interface PetMissing {
  id: string;
  petName: string;
  species: PetSpecies;
  breed: string;
  color: string;
  size: PetSize;
  lostTime: string;
  lastLocation: string;
  lat: number;
  lng: number;
  photos: string[];
  contact: string;
  description: string;
  status: MissingStatus;
  urgent: boolean;
  createdAt: string;
  foundTime?: string;
  foundProcess?: string;
  thankYou?: string;
}

export interface Clue {
  id: string;
  missingId: string;
  seenTime: string;
  location: string;
  lat: number;
  lng: number;
  photo?: string;
  confidence: number;
  description: string;
  contact?: string;
  createdAt: string;
}

export interface Statistics {
  totalMissing: number;
  totalFound: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  topAreas: { area: string; count: number }[];
  dailyTrend: { date: string; missing: number; found: number }[];
}
