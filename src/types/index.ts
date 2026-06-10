export type RouteCategory = 'easy' | 'climbing' | 'night' | 'construction';

export type RiskType = 'tunnel_no_light' | 'heavy_traffic' | 'no_parking' | 'slippery_when_rain';

export type SupplyType = 'convenience_store' | 'water' | 'restroom' | 'bike_shop';

export type RoadCondition = 'asphalt' | 'concrete' | 'gravel' | 'mixed';

export type BikeType = 'road' | 'mountain' | 'hybrid' | 'folding' | 'city' | 'other';

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  elevation: number;
  roadCondition: RoadCondition;
  hasSupply: boolean;
  supplyTypes: SupplyType[];
  coverImage: string;
  photos: string[];
  risks: RiskType[];
  category: RouteCategory;
  description: string;
  createdAt: string;
}

export interface Checkin {
  id: string;
  routeId: string;
  riderName: string;
  duration: number;
  avgSpeed: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  hadFlat: boolean;
  gotLost: boolean;
  hadCrash: boolean;
  notes: string;
  date: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  bikeType: BikeType;
  canLead: boolean;
  note: string;
}

export interface RideEvent {
  id: string;
  routeId: string;
  title: string;
  meetTime: string;
  meetPoint: string;
  participants: Participant[];
  createdAt: string;
}
