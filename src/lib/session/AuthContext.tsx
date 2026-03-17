import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../api/types';
import { tokenManager } from './tokenManager';
import { getCurrentUser } from '../api/user';
import { logoutUser } from '../api/auth';

interface AuthContextType {
  user: User | null;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRevoked: boolean;
  setIsSessionRevoked: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedSession = localStorage.getItem('session_user');
    if (storedSession) {
      try {
        return JSON.parse(storedSession);
      } catch {
        localStorage.removeItem('session_user');
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionRevoked, setIsSessionRevoked] = useState(false);

  const handleUnauthorized = useCallback(() => {
    const wasLoggedIn = !!user || !!localStorage.getItem('session_user');
    
    setUser(null);
    localStorage.removeItem('session_user');
    tokenManager.setAccessToken(null);
    setIsLoading(false);
    
    if (wasLoggedIn) {
      setIsSessionRevoked(true);
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    const syncSession = async () => {
      // If we have a user in localStorage, try to proactively refresh 
      // the access token before syncing their data.
      if (user) {
        try {
          // Import refreshAccessToken dynamically here or at top
          const { refreshAccessToken } = await import('../api/auth');
          const { accessToken } = await refreshAccessToken();
          tokenManager.setAccessToken(accessToken);
          
          const freshUser = await getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('session_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Initial session sync failed:', err);
          // If refresh fails, we'll let handleUnauthorized (via fetchApi event)
          // or this catch block handle the cleanup.
        }
      }
      setIsLoading(false);
    };

    syncSession();
  }, []); // Only run on mount

  const login = useCallback((userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('session_user', JSON.stringify(userData));
    tokenManager.setAccessToken(accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Failed to logout on backend:', err);
    }
    setUser(null);
    localStorage.removeItem('session_user');
    tokenManager.setAccessToken(null);
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      localStorage.setItem('session_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser, 
      isAuthenticated: !!user, 
      isLoading,
      isSessionRevoked,
      setIsSessionRevoked
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
