import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthTokens } from '@/types';
import { api, ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock users for demo
// alice = admin (can create rooms & add members)
// bob   = member (read-only, cannot create rooms)
export const MOCK_USERS: User[] = [
  {
    _id: 'u1',
    username: 'alice',
    email: 'alice@example.com',
    status: 'online',
    createdAt: new Date().toISOString(),
    role: 'admin',
  },
  {
    _id: 'u2',
    username: 'bob',
    email: 'bob@example.com',
    status: 'online',
    createdAt: new Date().toISOString(),
    role: 'member',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, tokens: null, isAuthenticated: false };
      }
    }
    return { user: null, tokens: null, isAuthenticated: false };
  });

  const persist = (newState: AuthState) => {
    setState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{ user: { id: string; email: string }; accessToken: string; refreshToken: string }>('/auth/login', {
        email,
        password,
      });
      
      // Convert backend response to frontend format
      const user: User = {
        _id: response.user.id,
        email: response.user.email,
        username: response.user.email.split('@')[0], // Extract username from email
        status: 'online',
        createdAt: new Date().toISOString(),
        role: 'member', // Default role
      };
      
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
      
      persist({ user, tokens, isAuthenticated: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      // First register the user
      await api.post<{ id: string; email: string }>('/auth/register', {
        fullName: username, // Use username as fullName for now
        username,
        email,
        password,
      });
      
      // Then log them in
      const loginResponse = await api.post<{ user: { id: string; email: string }; accessToken: string; refreshToken: string }>('/auth/login', {
        email,
        password,
      });
      
      // Convert backend response to frontend format
      const user: User = {
        _id: loginResponse.user.id,
        email: loginResponse.user.email,
        username,
        status: 'online',
        createdAt: new Date().toISOString(),
        role: 'member', // Default role
      };
      
      const tokens: AuthTokens = {
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      };
      
      persist({ user, tokens, isAuthenticated: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth');
      setState({ user: null, tokens: null, isAuthenticated: false });
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!state.tokens?.refreshToken) return null;
      
      const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken: state.tokens.refreshToken,
      });
      
      persist({
        ...state,
        tokens: { ...state.tokens, accessToken: response.accessToken },
      });
      return response.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }, [state]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAccessToken, allUsers: MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
