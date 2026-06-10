import type {
  Activity,
  Registration,
  CreateActivityDto,
  RegisterDto,
  ActivityStats,
  TypeStats,
} from '../../shared/types.js';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = (await res.json()) as ApiResponse<T>;
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

export const api = {
  getActivities: (): Promise<Activity[]> => request<Activity[]>('/activities'),

  getActivity: (id: string): Promise<Activity> =>
    request<Activity>(`/activities/${id}`),

  createActivity: (dto: CreateActivityDto): Promise<Activity> =>
    request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getRegistrations: (activityId: string): Promise<Registration[]> =>
    request<Registration[]>(`/activities/${activityId}/registrations`),

  register: (
    activityId: string,
    dto: RegisterDto,
  ): Promise<{ registration: Registration; isWaitlist: boolean }> =>
    request<{ registration: Registration; isWaitlist: boolean }>(
      `/activities/${activityId}/register`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
    ),

  cancelRegistration: (
    id: string,
  ): Promise<{ cancelled: Registration; promoted: Registration | null }> =>
    request<{ cancelled: Registration; promoted: Registration | null }>(
      `/registrations/${id}/cancel`,
      {
        method: 'PUT',
      },
    ),

  checkIn: (id: string): Promise<Registration> =>
    request<Registration>(`/registrations/${id}/checkin`, {
      method: 'PUT',
    }),

  markAbsent: (id: string): Promise<Registration> =>
    request<Registration>(`/registrations/${id}/absent`, {
      method: 'PUT',
    }),

  getStats: (): Promise<{
    activities: ActivityStats[];
    typeStats: TypeStats[];
    totalWaitlistPromoted: number;
  }> => request<{ activities: ActivityStats[]; typeStats: TypeStats[]; totalWaitlistPromoted: number }>('/stats'),
};
