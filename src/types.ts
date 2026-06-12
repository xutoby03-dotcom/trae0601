export interface Screening {
  id: string
  movieName: string
  date: string
  location: string
  seatLimit: number
  ageRating: string
  posterUrl: string
  weatherPlan: string
  isRescheduled: boolean
  originalDate?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'rained_out'
}

export interface Registration {
  id: string
  screeningId: string
  name: string
  peopleCount: number
  building: string
  hasChildren: boolean
  phone: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  checkedIn: boolean
  rescheduleNotified: boolean
  createdAt: string
}

export interface ScreeningFormData {
  movieName: string
  date: string
  location: string
  seatLimit: number
  ageRating: string
  posterUrl: string
  weatherPlan: string
}

export interface RegistrationFormData {
  name: string
  peopleCount: number
  building: string
  hasChildren: boolean
  phone: string
}
