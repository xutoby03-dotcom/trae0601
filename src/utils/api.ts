const API_BASE = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  total?: number
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const result = (await response.json()) as ApiResponse<T>

  if (!result.success) {
    throw new Error(result.message || '请求失败')
  }

  return result.data as T
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, data: any) =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data: any) =>
    request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}

export default api
