export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface Application {
  id: string
  activityName: string
  clubName: string
  boardId: string
  startDate: string
  endDate: string
  size: string
  imageUrl: string
  contact: string
  status: ApplicationStatus
  postedPhotoUrl: string
  removedPhotoUrl: string
  postedAt: string
  removedAt: string
  createdAt: string
}

export interface Board {
  id: string
  name: string
  location: string
  positionX: number
  positionY: number
}

export interface Conflict {
  applicationA: Application
  applicationB: Application
  boardId: string
  overlapStart: string
  overlapEnd: string
}

export interface Club {
  name: string
  password: string
}

export type UserRole = 'club' | 'admin'
