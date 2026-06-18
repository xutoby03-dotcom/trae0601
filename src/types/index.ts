export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  noShowCount: number;
  isOwner: boolean;
}

export type RouteStatus = 'open' | 'full' | 'closed' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'no_show';
export type LuggageSpace = 'small' | 'medium' | 'large';

export interface Route {
  id: string;
  ownerId: string;
  ownerName: string;
  departure: string;
  destination: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  hasChildSeat: boolean;
  luggageSpace: LuggageSpace;
  plateNumber: string;
  status: RouteStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  routeId: string;
  passengerId: string;
  passengerName: string;
  passengerCount: number;
  pickupPoint: string;
  contactPhone: string;
  hasElderlyOrChild: boolean;
  remarks: string;
  status: BookingStatus;
  createdAt: string;
}

export interface DestinationStat {
  name: string;
  count: number;
}

export interface RouteFormData {
  departure: string;
  destination: string;
  departureTime: string;
  totalSeats: number;
  hasChildSeat: boolean;
  luggageSpace: LuggageSpace;
  plateNumber: string;
}

export interface BookingFormData {
  passengerCount: number;
  pickupPoint: string;
  contactPhone: string;
  hasElderlyOrChild: boolean;
  remarks: string;
}
