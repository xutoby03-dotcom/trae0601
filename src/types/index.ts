export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface NoFlyZone {
  name: string;
  type: 'airport' | 'military' | 'government' | 'population';
  radius: number;
  lat: number;
  lng: number;
}

export interface AirspaceInfo {
  noFlyZones: NoFlyZone[];
  altitudeLimit: number;
  distanceToNearestZone: number;
  status: 'safe' | 'caution' | 'danger';
}

export interface WeatherInfo {
  windSpeed: number;
  windDirection: number;
  temperature: number;
  visibility: number;
  windStatus: 'safe' | 'caution' | 'danger';
}

export interface AlternateLanding {
  name: string;
  location: Location;
  distance: number;
  direction: string;
}

export interface RthInfo {
  homePoint: Location;
  alternatives: AlternateLanding[];
}

export interface Battery {
  id: string;
  name: string;
  cycleCount: number;
  health: number;
  estimatedFlightTime: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AlternativePosition {
  name: string;
  description: string;
  altitude: number;
  reason: string;
}

export interface ShotItem {
  id: string;
  order: number;
  name: string;
  description: string;
  requiredAltitude: number;
  maxWindSpeed: number;
  batteryId: string;
  status: 'safe' | 'caution' | 'danger';
  issues: string[];
  alternatives: AlternativePosition[];
}

export type FlightCheckStatus = 'idle' | 'checking' | 'ready' | 'risk';
