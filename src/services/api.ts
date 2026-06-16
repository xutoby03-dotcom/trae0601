import type {
  Course,
  CourseWithQuota,
  Application,
  Statistics,
  CourseStatistics,
  Seat,
} from '../types';

const API_BASE = '/api';

const request = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Network error',
    }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const courseApi = {
  getAll: (): Promise<CourseWithQuota[]> =>
    request<CourseWithQuota[]>('/courses'),

  getById: (id: string): Promise<CourseWithQuota> =>
    request<CourseWithQuota>(`/courses/${id}`),

  create: (
    data: Omit<Course, 'id' | 'usedQuota'>
  ): Promise<Course> =>
    request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Course>): Promise<Course> =>
    request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/courses/${id}`, { method: 'DELETE' }),

  updateSeats: (id: string, seats: Seat[][]): Promise<Course> =>
    request<Course>(`/courses/${id}/seats`, {
      method: 'PUT',
      body: JSON.stringify({ seats }),
    }),

  getQuota: (id: string): Promise<{ used: number; total: number }> =>
    request<{ used: number; total: number }>(`/courses/${id}/quota`),
};

export const applicationApi = {
  getAll: (courseId?: string, studentName?: string): Promise<Application[]> => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (studentName) params.append('studentName', studentName);
    return request<Application[]>(
      `/applications${params.toString() ? `?${params.toString()}` : ''}`
    );
  },

  getById: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}`),

  submit: (
    data: Omit<
      Application,
      'id' | 'createdAt' | 'status' | 'waitlistPosition' | 'seatId'
    >
  ): Promise<Application> =>
    request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approve: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}/approve`, { method: 'PUT' }),

  reject: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}/reject`, { method: 'PUT' }),

  checkIn: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}/checkin`, { method: 'PUT' }),

  release: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}/release`, { method: 'PUT' }),

  cancel: (id: string): Promise<Application> =>
    request<Application>(`/applications/${id}/cancel`, { method: 'PUT' }),

  getWaitlist: (courseId: string): Promise<Application[]> =>
    request<Application[]>(`/applications/course/${courseId}/waitlist`),
};

export const statisticsApi = {
  getOverall: (): Promise<Statistics> =>
    request<Statistics>('/statistics'),

  getCourse: (id: string): Promise<CourseStatistics> =>
    request<CourseStatistics>(`/statistics/course/${id}`),
};
