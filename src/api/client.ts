import type { ApiResponse } from "@/types";

const BASE_URL = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data.data as T;
}

export const http = {
  get: <T>(path: string, params?: Record<string, any>) => {
    const url = params
      ? `${path}?${new URLSearchParams(params).toString()}`
      : path;
    return request<T>(url, { method: "GET" });
  },

  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
