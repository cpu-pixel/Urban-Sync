import { create } from 'zustand';

const API = 'http://localhost:5001';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PLANNER' | 'VIEWER';
  organization: {
    id: string;
    name: string;
    type: 'MUNICIPAL' | 'PUBLIC_UTILITY' | 'PRIVATE_TELECOM';
  };
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; agencyName: string; agencyType: string }) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('urbansync_token'),
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error ?? 'Login failed.', isLoading: false });
        return;
      }

      localStorage.setItem('urbansync_token', data.token);
      set({ token: data.token, user: data.user, isLoading: false });
    } catch {
      set({ error: 'Network error. Is the backend running?', isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        set({ error: resData.error ?? 'Registration failed.', isLoading: false });
        return;
      }

      localStorage.setItem('urbansync_token', resData.token);
      set({ token: resData.token, user: resData.user, isLoading: false });
    } catch {
      set({ error: 'Network error. Is the backend running?', isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('urbansync_token');
    set({ token: null, user: null });
  },

  restoreSession: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Token is stale/invalid — clear it silently
        localStorage.removeItem('urbansync_token');
        set({ token: null, user: null, isLoading: false });
        return;
      }

      const user: AuthUser = await res.json();
      set({ user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

/** Convenience helper for adding auth headers to any fetch call */
export function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
