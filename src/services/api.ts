import type {
  Product,
  Sample,
  Incident,
  DashboardStats,
} from "../../shared/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const request = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error || "请求失败");
  }
  return json.data as T;
};

export const dashboardApi = {
  getStats: () => request<DashboardStats>("/api/dashboard"),
  getExpiringSamples: () => request<Sample[]>("/api/dashboard/expiring-samples"),
  getRecentIncidents: () => request<Incident[]>("/api/dashboard/recent-incidents"),
};

export const productsApi = {
  list: (params?: {
    category?: string;
    isOnSale?: boolean;
    keyword?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append("category", params.category);
    if (params?.isOnSale !== undefined)
      q.append("isOnSale", String(params.isOnSale));
    if (params?.keyword) q.append("keyword", params.keyword);
    return request<Product[]>(`/api/products?${q.toString()}`);
  },
  get: (id: string) => request<Product & { samples: Sample[] }>(`/api/products/${id}`),
  create: (data: Partial<Product>) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/api/products/${id}`, { method: "DELETE" }),
};

export const samplesApi = {
  list: (params?: {
    status?: string;
    productId?: string;
    keyword?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append("status", params.status);
    if (params?.productId) q.append("productId", params.productId);
    if (params?.keyword) q.append("keyword", params.keyword);
    return request<Sample[]>(`/api/samples?${q.toString()}`);
  },
  get: (id: string) => request<Sample>(`/api/samples/${id}`),
  create: (data: Partial<Sample>) =>
    request<Sample>("/api/samples", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Sample>) =>
    request<Sample>(`/api/samples/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const incidentsApi = {
  list: (params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append("type", params.type);
    if (params?.status) q.append("status", params.status);
    return request<Incident[]>(`/api/incidents?${q.toString()}`);
  },
  get: (id: string) => request<Incident>(`/api/incidents/${id}`),
  create: (data: Partial<Incident>) =>
    request<Incident>("/api/incidents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Incident>) =>
    request<Incident>(`/api/incidents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const destructionApi = {
  getPending: () => request<Sample[]>("/api/destruction/pending"),
  confirm: (sampleId: string, data: { destructionPhoto: string; destructionPerson: string }) =>
    request<Sample>(`/api/destruction/${sampleId}/confirm`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const uploadApi = {
  image: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, filename: file.name }),
          });
          const json = (await res.json()) as ApiResponse<{ url: string }>;
          if (json.success && json.data) {
            resolve(json.data.url);
          } else {
            reject(new Error(json.error || "上传失败"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });
  },
};
