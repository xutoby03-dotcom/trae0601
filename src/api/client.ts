import type {
  Printer,
  Consumption,
  Replenishment,
  Alert,
  ConsumptionRate,
  DepartmentUsage,
  ReplenishmentForecast,
  CreatePrinterRequest,
  CreateConsumptionRequest,
  CreateReplenishmentRequest,
  ApiResponse,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }

  return data.data as T;
}

export const api = {
  printers: {
    getAll: () => request<Printer[]>('/printers'),
    getById: (id: string) => request<Printer>(`/printers/${id}`),
    create: (data: CreatePrinterRequest) =>
      request<Printer>('/printers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CreatePrinterRequest>) =>
      request<Printer>(`/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/printers/${id}`, {
        method: 'DELETE',
      }),
  },

  consumptions: {
    getAll: (printerId?: string, department?: string) => {
      const params = new URLSearchParams();
      if (printerId) params.append('printerId', printerId);
      if (department) params.append('department', department);
      return request<Consumption[]>(
        `/consumptions${params.toString() ? '?' + params.toString() : ''}`
      );
    },
    create: (data: CreateConsumptionRequest) =>
      request<Consumption>('/consumptions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  replenishments: {
    getAll: (printerId?: string, supplier?: string) => {
      const params = new URLSearchParams();
      if (printerId) params.append('printerId', printerId);
      if (supplier) params.append('supplier', supplier);
      return request<Replenishment[]>(
        `/replenishments${params.toString() ? '?' + params.toString() : ''}`
      );
    },
    create: (data: CreateReplenishmentRequest) =>
      request<Replenishment>('/replenishments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  alerts: {
    getAll: (printerId?: string, isResolved?: boolean) => {
      const params = new URLSearchParams();
      if (printerId) params.append('printerId', printerId);
      if (isResolved !== undefined)
        params.append('isResolved', isResolved.toString());
      return request<Alert[]>(
        `/alerts${params.toString() ? '?' + params.toString() : ''}`
      );
    },
    resolve: (id: string) =>
      request<Alert>(`/alerts/${id}/resolve`, {
        method: 'PUT',
      }),
  },

  statistics: {
    getConsumptionRate: () =>
      request<ConsumptionRate[]>('/statistics/consumption-rate'),
    getDepartmentUsage: () =>
      request<DepartmentUsage[]>('/statistics/department-usage'),
    getReplenishmentForecast: () =>
      request<ReplenishmentForecast[]>('/statistics/replenishment-forecast'),
    getDailyTrend: (days: number = 30) =>
      request<any[]>(`/statistics/daily-trend?days=${days}`),
  },

  upload: {
    photo: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data: ApiResponse<{ photoUrl: string }> = await response.json();

      if (!data.success) {
        throw new Error(data.message || '上传失败');
      }

      return data.data!.photoUrl;
    },
  },
};
