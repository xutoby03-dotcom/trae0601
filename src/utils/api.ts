import type { Session, Guest, Feedback, OverviewStats, Reminder, KeywordCount } from '../../shared/types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || '请求失败');
  }
  
  return data.data;
}

export const sessionsApi = {
  getAll: () => request<Session[]>('/sessions'),
  getById: (id: string) => request<Session>(`/sessions/${id}`),
  create: (session: Omit<Session, 'id'>) => 
    request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    }),
  update: (id: string, updates: Partial<Session>) =>
    request<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),
};

export const guestsApi = {
  getAll: (params?: { sessionId?: string; status?: string; search?: string; isVIP?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.sessionId) query.append('sessionId', params.sessionId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.isVIP !== undefined) query.append('isVIP', String(params.isVIP));
    return request<Guest[]>(`/guests${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getById: (id: string) => request<Guest>(`/guests/${id}`),
  create: (guest: Omit<Guest, 'id' | 'createdAt'>) =>
    request<Guest>('/guests', {
      method: 'POST',
      body: JSON.stringify(guest),
    }),
  update: (id: string, updates: Partial<Guest>) =>
    request<Guest>(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/guests/${id}`, {
      method: 'DELETE',
    }),
  confirm: (id: string) =>
    request<Guest>(`/guests/${id}/confirm`, {
      method: 'PATCH',
    }),
  checkIn: (id: string) =>
    request<Guest>(`/guests/${id}/checkin`, {
      method: 'PATCH',
    }),
  checkOut: (id: string) =>
    request<Guest>(`/guests/${id}/checkout`, {
      method: 'PATCH',
    }),
  markNoShow: (id: string, reason?: string) =>
    request<Guest>(`/guests/${id}/no-show`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
};

export const feedbackApi = {
  getAll: (params?: { sessionId?: string; guestId?: string; isFollowedUp?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.sessionId) query.append('sessionId', params.sessionId);
    if (params?.guestId) query.append('guestId', params.guestId);
    if (params?.isFollowedUp !== undefined) query.append('isFollowedUp', String(params.isFollowedUp));
    return request<Feedback[]>(`/feedback${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getById: (id: string) => request<Feedback>(`/feedback/${id}`),
  create: (feedback: Omit<Feedback, 'id' | 'createdAt'>) =>
    request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),
  markFollowedUp: (id: string) =>
    request<Feedback>(`/feedback/${id}/follow-up`, {
      method: 'PATCH',
    }),
};

export const statsApi = {
  getOverview: () => request<OverviewStats>('/stats/overview'),
  getSessionStats: (sessionId: string) => request<OverviewStats['sessionStats'][0]>(`/stats/session/${sessionId}`),
  getKeywords: (sessionId?: string) => {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return request<{ positiveKeywords: KeywordCount[]; negativeKeywords: KeywordCount[] }>(`/stats/keywords${query}`);
  },
};

export const remindersApi = {
  getAll: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return request<Reminder[]>(`/reminders${query}`);
  },
  getCount: () => request<{ unconfirmed: number; no_show: number; follow_up: number; total: number }>('/reminders/count'),
  dismiss: (id: string) =>
    request<{ message: string }>(`/reminders/${id}/dismiss`, {
      method: 'PATCH',
    }),
};
