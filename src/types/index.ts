export type PermitStatus = 'approved' | 'pending' | 'denied';

export interface SamplingSite {
  id: string;
  name: string;
  targetSpecies: string;
  lowTideTime: string;
  travelTimeMinutes: number;
  permitStatus: PermitStatus;
  notes: string;
  createdAt: string;
}

export interface SampleRecord {
  id: string;
  siteId: string;
  sampleNumber: string;
  salinity: number;
  waterTemperature: number;
  photoUrl?: string;
  sampledAt: string;
  notes: string;
}

export interface TideWindow {
  siteId: string;
  lowTide: Date;
  tideStart: Date;
  tideEnd: Date;
  latestDeparture: Date;
  mustEvacuate: Date;
  workDuration: number;
}

export type UrgencyLevel = 'safe' | 'warning' | 'critical' | 'expired';
