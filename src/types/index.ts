export type StrollerStatus = 'normal' | 'blocking' | 'pending' | 'moved';

export interface Stroller {
  id: string;
  building: string;
  room: string;
  ownerName: string;
  phone: string;
  model: string;
  color: string;
  location: string;
  isFireExit: boolean;
  isLongTerm: boolean;
  photos: string[];
  status: StrollerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatrolRecord {
  id: string;
  strollerId: string;
  status: StrollerStatus;
  remark: string;
  handleTime?: string;
  scenePhotos: string[];
  createdAt: string;
}

export interface LocationStats {
  location: string;
  blockingCount: number;
}

export interface Filters {
  building: string;
  location: string;
  status: StrollerStatus | 'all';
}
