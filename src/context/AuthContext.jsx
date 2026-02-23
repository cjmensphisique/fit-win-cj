import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: 'admin' | 'client', ...details }
  const [isLoading, setIsLoading] = useState(true); // true until localStorage is checked
  const { data } = useData();

  // Load user from localStorage on mount (persistence across refreshes)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false); // done checking — safe to render protected routes
  }, []);

  const login = useCallback((identifier, password) => {
    // Admin Check
    if (data.admin && 
       (data.admin.email === identifier || data.admin.phone === identifier) && 
        data.admin.password === password) {
      const adminUser = { role: 'admin', ...data.admin };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Client Check
    const client = data.clients.find(c => 
      (c.email === identifier || c.phone === identifier) && c.password === password
    );

    if (client) {
      const clientUser = { role: 'client', ...client };
      setUser(clientUser);
      localStorage.setItem('currentUser', JSON.stringify(clientUser));
      return true;
    }

    return false;
  }, [data]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  // Poll server to check if current client has been deleted
  useEffect(() => {
    if (!user || user.role !== 'client' || !user.id) return;

    const checkClientExists = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/clients/${user.id}`);
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
