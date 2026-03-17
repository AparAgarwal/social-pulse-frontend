import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../api/types';
import { getCurrentUser } from '../api/user';
import { logoutUser } from '../api/auth';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
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
      if (user) {
        try {
          const freshUser = await getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('session_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Initial session sync failed:', err);
        }
      }
      setIsLoading(false);
    };

    syncSession();
  }, []); // Only run on mount

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('session_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Failed to logout on backend:', err);
    }
    setUser(null);
    localStorage.removeItem('session_user');
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
