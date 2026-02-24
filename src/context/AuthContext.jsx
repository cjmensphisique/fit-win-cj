import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from './DataContext';
import { api, API_URL } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: 'admin' | 'client', ...details }
  const [isLoading, setIsLoading] = useState(true); // true until localStorage is checked
  const { data } = useData();

  // Load user from localStorage on mount (persistence across refreshes)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false); // ALWAYS set to false to unblock rendering
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const response = await api.login(identifier, password);
      if (response.success) {
        const loggedInUser = response.user;
        setUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        return { success: true };
      }
      return { success: false, error: 'invalid' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  // Poll server to check if current client has been deleted
  useEffect(() => {
    if (!user || user.role !== 'client' || !user.id) return;

    const checkClientExists = async () => {
      try {
        const res = await fetch(`${API_URL}/api/clients/${user.id}`);
        // If the server explicitly returns 404 Not Found, the client was deleted
        if (res.status === 404) {
          logout();
          window.location.href = '/login'; // force redirect
        }
      } catch (err) {
        // Ignore network errors so we don't logout if the server is just restarting
      }
    };

    const intervalId = setInterval(checkClientExists, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [user, logout]);

  const contextValue = useMemo(() => ({
    user, isLoading, login, logout
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
