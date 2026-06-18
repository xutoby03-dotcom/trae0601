export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
}

export interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, unknown>;
  body?: unknown;
}

const BASE_URL = "/api";

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
  const { params, headers, body, ...restConfig } = config;

  const fullUrl = `${BASE_URL}${url}${params ? buildQueryString(params) : ""}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    (defaultHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders = { ...defaultHeaders, ...headers };

  try {
    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
      requestBody = body;
    } else if (body !== undefined && body !== null) {
      requestBody = JSON.stringify(body);
    }

    const fetchConfig: RequestInit = {
      ...restConfig,
      headers: mergedHeaders,
      body: requestBody,
    };

    const response = await fetch(fullUrl, fetchConfig);

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return {
        success: false,
        message: data.message || `请求失败: ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "网络请求失败，请检查网络连接",
    };
  }
}

export const apiClient = {
  get: <T>(url: string, config?: Omit<RequestConfig, "method" | "body">) =>
    request<T>(url, { ...config, method: "GET" }),

  post: <T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) =>
    request<T>(url, { ...config, method: "POST", body }),

  put: <T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) =>
    request<T>(url, { ...config, method: "PUT", body }),

  patch: <T>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) =>
    request<T>(url, { ...config, method: "PATCH", body }),

  delete: <T>(url: string, config?: Omit<RequestConfig, "method" | "body">) =>
    request<T>(url, { ...config, method: "DELETE" }),

  upload: <T>(url: string, formData: FormData, config?: Omit<RequestConfig, "method" | "body" | "headers">) =>
    request<T>(url, {
      ...config,
      method: "POST",
      body: formData,
      headers: {},
    }),
};
