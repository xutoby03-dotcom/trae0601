const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '请求失败' }));
    if (errorData.unavailableCostumes) {
      throw new Error(JSON.stringify(errorData));
    }
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  costumes: {
    getAll: (params?: { type?: string; size?: string; status?: string }) => {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      return request<Costume[]>(`/costumes${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Costume>(`/costumes/${id}`),
    getAvailability: (date: string, timeSlot: string) =>
      request<{ available: Record<string, number> }>(`/costumes/availability?date=${date}&timeSlot=${timeSlot}`),
    create: (data: Partial<Costume>) =>
      request<Costume>('/costumes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Costume>) =>
      request<Costume>(`/costumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/costumes/${id}`, { method: 'DELETE' }),
  },

  reservations: {
    getAll: (params?: { date?: string; status?: string; className?: string }) => {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      return request<Reservation[]>(`/reservations${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Reservation>(`/reservations/${id}`),
    create: (data: Partial<Reservation>) =>
      request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Reservation>) =>
      request<Reservation>(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: (id: string) => request<Reservation>(`/reservations/${id}/approve`, { method: 'PUT' }),
    reject: (id: string, reason: string) =>
      request<Reservation>(`/reservations/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    cancel: (id: string) => request<Reservation>(`/reservations/${id}/cancel`, { method: 'PUT' }),
  },

  lendings: {
    getAll: () => request<LendingRecord[]>('/lendings'),
    get: (id: string) => request<LendingRecord>(`/lendings/${id}`),
    preview: (reservationId: string) =>
      request<{
        canLend: boolean;
        totalNeeded: number;
        totalAvailable: number;
        allocatedCostumes: { size: string; costumes: { id: string; type: string; color: string; rfidTag: string }[] }[];
        insufficient: { size: string; needed: number; available: number }[];
      }>('/lendings/preview', { method: 'POST', body: JSON.stringify({ reservationId }) }),
    create: (data: { reservationId: string; lenderName: string; costumeIds: string[] }) =>
      request<LendingRecord>('/lendings', { method: 'POST', body: JSON.stringify(data) }),
  },

  returns: {
    getPending: () => request<LendingRecord[]>('/returns'),
    returnItems: (id: string, items: Array<{ costumeId: string; accessoryCheck: Accessory; hasStain: boolean; damageNote?: string }>) =>
      request<LendingRecord>(`/returns/${id}/return`, { method: 'PUT', body: JSON.stringify({ items }) }),
  },

  cleaning: {
    getAll: (status?: string) =>
      request<CleaningRecord[]>(`/cleaning${status ? `?status=${status}` : ''}`),
    add: (costumeIds: string[]) =>
      request<CleaningRecord[]>('/cleaning', { method: 'POST', body: JSON.stringify({ costumeIds }) }),
    start: (id: string, operator: string) =>
      request<CleaningRecord>(`/cleaning/${id}/start`, { method: 'PUT', body: JSON.stringify({ operator }) }),
    complete: (id: string) => request<CleaningRecord>(`/cleaning/${id}/complete`, { method: 'PUT' }),
  },

  statistics: {
    getOverview: () => request<Statistics>('/statistics'),
    getDamages: (resolved?: boolean) =>
      request<DamageRecord[]>(`/statistics/damages${resolved !== undefined ? `?resolved=${resolved}` : ''}`),
    getOverdue: () => request<LendingRecord[]>('/statistics/overdue'),
  },
};

export default api;
