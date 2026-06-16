import type {
  Elevator,
  Reservation,
  CompletionRecord,
  Inspection,
  ApiResponse,
  ConflictCheckResult,
  WeightCheckResult,
  Maintenance,
  ElevatorTimeSlot
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json() as ApiResponse<T>;
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || '请求失败');
  }
  
  return data.data as T;
}

export const elevatorApi = {
  getAll: () => request<Elevator[]>('/elevators'),
  getById: (id: string) => request<Elevator>(`/elevators/${id}`),
  create: (data: Omit<Elevator, 'id' | 'createdAt' | 'maintenanceSchedule' | 'timeSlots'>) => 
    request<Elevator>('/elevators', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Elevator>) =>
    request<Elevator>(`/elevators/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/elevators/${id}`, { method: 'DELETE' }),
  getMaintenance: (id: string) => request<Maintenance[]>(`/elevators/${id}/maintenance`),
  addMaintenance: (id: string, data: Omit<Maintenance, 'id' | 'elevatorId'>) =>
    request<Maintenance>(`/elevators/${id}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
  deleteMaintenance: (maintenanceId: string) =>
    request<void>(`/elevators/maintenance/${maintenanceId}`, { method: 'DELETE' }),
  getTimeSlots: (id: string) => request<ElevatorTimeSlot[]>(`/elevators/${id}/time-slots`),
  addTimeSlot: (id: string, data: Omit<ElevatorTimeSlot, 'id' | 'elevatorId'>) =>
    request<ElevatorTimeSlot>(`/elevators/${id}/time-slots`, { method: 'POST', body: JSON.stringify(data) }),
  updateTimeSlot: (slotId: string, data: Partial<ElevatorTimeSlot>) =>
    request<ElevatorTimeSlot>(`/elevators/time-slots/${slotId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTimeSlot: (slotId: string) =>
    request<void>(`/elevators/time-slots/${slotId}`, { method: 'DELETE' }),
  batchUpdateTimeSlots: (id: string, slots: Omit<ElevatorTimeSlot, 'id' | 'elevatorId'>[]) =>
    request<ElevatorTimeSlot[]>(`/elevators/${id}/time-slots/batch`, { 
      method: 'PUT', 
      body: JSON.stringify({ slots }) 
    }),
};

export const reservationApi = {
  getAll: (params?: { date?: string; status?: string; elevatorId?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status) query.set('status', params.status);
    if (params?.elevatorId) query.set('elevatorId', params.elevatorId);
    const queryStr = query.toString();
    return request<Reservation[]>(`/reservations${queryStr ? `?${queryStr}` : ''}`);
  },
  getToday: () => request<Reservation[]>('/reservations/today'),
  checkConflict: (params: { elevatorId: string; date: string; startTime: string; endTime: string; reservationId?: string }) => {
    const queryParams: Record<string, string> = {
      elevatorId: params.elevatorId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
    };
    if (params.reservationId) {
      queryParams.reservationId = params.reservationId;
    }
    const query = new URLSearchParams(queryParams);
    return request<ConflictCheckResult>(`/reservations/check-conflict?${query.toString()}`);
  },
  checkWeight: (params: { elevatorId: string; estimatedWeight: number }) => {
    const queryParams = {
      elevatorId: params.elevatorId,
      estimatedWeight: params.estimatedWeight.toString(),
    };
    const query = new URLSearchParams(queryParams);
    return request<WeightCheckResult>(`/reservations/check-weight?${query.toString()}`);
  },
  create: (data: Omit<Reservation, 'id' | 'createdAt' | 'elevator'>) =>
    request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: Reservation['status']) =>
    request<Reservation>(`/reservations/${id}/status`, { 
      method: 'PUT', 
      body: JSON.stringify({ status }) 
    }),
  approve: (id: string) =>
    request<Reservation>(`/reservations/${id}/approve`, { method: 'PUT' }),
  cancel: (id: string) =>
    request<Reservation>(`/reservations/${id}/cancel`, { method: 'PUT' }),
};

export const completionApi = {
  getByReservationId: (reservationId: string) =>
    request<CompletionRecord>(`/completion/${reservationId}`),
  create: (data: Omit<CompletionRecord, 'id' | 'completedAt'>) =>
    request<{ completion: CompletionRecord; inspection?: Inspection }>('/completion', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
};

export const inspectionApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<Inspection[]>(`/inspections${query}`);
  },
  getPending: () => request<Inspection[]>('/inspections/pending'),
  update: (id: string, data: Partial<Inspection>) =>
    request<Inspection>(`/inspections/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  complete: (id: string, data: {
    wallDamage: 'none' | 'minor' | 'major';
    wallDamageDescription?: string;
    protectionMatReturned: boolean;
    depositStatus: 'collected' | 'refunded' | 'deducted';
    notes?: string;
  }) =>
    request<{ inspection: Inspection; completion: CompletionRecord }>(`/inspections/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
