import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse, ApiResponse } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (employeeId: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const API_BASE = '/api';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {
    // ignore
  }
  return localStorage.getItem('token');
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  return response.json();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: async (employeeId: string) => {
        const result = await fetchApi<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ employeeId }),
        });

        if (result.success && result.data) {
          set({
            user: result.data.user,
            token: result.data.token,
          });
          return { success: true };
        }
        
        return { success: false, message: result.message };
      },
      
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');
      },
      
      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        
        const result = await fetchApi<User>('/auth/me');
        if (result.success && result.data) {
          set({ user: result.data });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export { fetchApi };
