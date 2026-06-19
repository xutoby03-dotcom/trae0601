const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('text/plain')) {
    return response.text() as Promise<T>;
  }

  return response.json();
}

export const api = {
  members: {
    getAll: () => request<Member[]>('/members'),
    getById: (id: string) => request<Member>(`/members/${id}`),
    create: (data: Omit<Member, 'id' | 'createdAt' | 'confirmed'>) =>
      request<Member>('/members', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Member>) =>
      request<Member>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/members/${id}`, { method: 'DELETE' }),
    confirm: (id: string) => request<Member>(`/members/${id}/confirm`, { method: 'PATCH' }),
  },

  plans: {
    getAll: () => request<Plan[]>('/plans'),
    getById: (id: string) => request<Plan>(`/plans/${id}`),
    create: (data: Omit<Plan, 'id' | 'createdAt'>) =>
      request<Plan>('/plans', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Plan>) =>
      request<Plan>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/plans/${id}`, { method: 'DELETE' }),

    addDish: (planId: string, data: Omit<Dish, 'id'>) =>
      request<Dish>(`/plans/${planId}/dishes`, { method: 'POST', body: JSON.stringify(data) }),
    updateDish: (planId: string, dishId: string, data: Partial<Dish>) =>
      request<Dish>(`/plans/${planId}/dishes/${dishId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDish: (planId: string, dishId: string) =>
      request<void>(`/plans/${planId}/dishes/${dishId}`, { method: 'DELETE' }),

    getSeating: (planId: string) => request<{ planId: string; tables: Table[] }>(`/plans/${planId}/seating`),
    generateSeating: (planId: string) =>
      request<{ planId: string; tables: Table[] }>(`/plans/${planId}/seating`, { method: 'POST' }),
    saveSeating: (planId: string, tables: Table[]) =>
      request<{ planId: string; tables: Table[] }>(`/plans/${planId}/seating`, {
        method: 'PUT',
        body: JSON.stringify({ tables }),
      }),

    getConflicts: (planId: string) => request<Conflict[]>(`/plans/${planId}/conflicts`),

    exportRestaurantList: (planId: string) =>
      request<string>(`/plans/${planId}/export/restaurant`),
    exportTableCards: (planId: string) =>
      request<string>(`/plans/${planId}/export/table-cards`),
  },

  dashboard: {
    getStats: () => request<DashboardStats>('/dashboard/stats'),
  },
};
