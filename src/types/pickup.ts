export type PackageSize = 'small' | 'medium' | 'large';

export type RequestStatus = 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'completed' | 'exception';

export type ExceptionType = 'code_invalid' | 'door_stuck' | 'package_damaged' | 'other';

export type FilterType = 'all' | 'expiring' | 'building' | 'heavy';

export type OrderTab = 'active' | 'completed';

export interface PickupRequest {
  id: string;
  publisherId: string;
  publisherName: string;
  publisherAvatar: string;
  publisherBuilding: string;
  lockerLocation: string;
  lockerName: string;
  pickupCode: string;
  isCodeEncrypted: boolean;
  packageSize: PackageSize;
  isFragile: boolean;
  deadline: string;
  deliveryLocation: string;
  reward: number;
  status: RequestStatus;
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedByAvatar?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  placementPhoto?: string;
  exceptionType?: ExceptionType;
  exceptionDesc?: string;
  createdAt: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  building: string;
  helpCount: number;
  publishCount: number;
}

export interface LockerStats {
  lockerLocation: string;
  totalRequests: number;
  timeoutCount: number;
  timeoutRate: number;
}

export interface HelperRanking {
  userId: string;
  name: string;
  avatar: string;
  building: string;
  helpCount: number;
  totalReward: number;
}
