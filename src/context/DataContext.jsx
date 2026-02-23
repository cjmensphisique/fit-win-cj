import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({ clients: [], tasks: [], admin: {}, notifications: [], workoutPlans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = async (newData) => {
    try {
      await api.saveData(newData);
      setData(newData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a single client's profile fields
  const updateClient = async (id, fields) => {
    try {
      const updated = await api.updateClient(id, fields);
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === id ? { ...c, ...updated } : c),
      }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add a new client
  const addClient = async (clientData) => {
    try {
      const created = await api.createClient(clientData);
      setData(prev => ({
        ...prev,
        clients: [...prev.clients, created],
      }));
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a client
  const removeClient = async (id) => {
    try {
      await api.deleteClient(id);
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add a progress photo
  const addPhoto = async (clientId, photo) => {
    try {
      const newPhoto = await api.addPhoto(clientId, photo);
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c =>
          c.id === clientId ? { ...c, photos: [...(c.photos || []), newPhoto] } : c
        ),
      }));
      return newPhoto;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a progress photo
  const deletePhoto = async (clientId, photoId) => {
    try {
      await api.deletePhoto(clientId, photoId);
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c =>
          c.id === clientId ? { ...c, photos: (c.photos || []).filter(p => p.id !== photoId) } : c
        ),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Notifications
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async (userId) => {
    try {
      const notifs = await api.getNotifications(userId);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  const addNotification = async (notif) => {
    try {
      const created = await api.addNotification(notif);
      // Refresh data to get updated notifications in data.json
      return created;
    } catch (err) {
      console.error('Failed to add notification', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const markAllNotificationsRead = async (userId) => {
    try {
      await api.markAllNotificationsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  // Workout Plans
  const [workoutPlans, setWorkoutPlans] = useState([]);

  const loadWorkoutPlans = useCallback(async () => {
    try {
      const plans = await api.getWorkoutPlans();
      setWorkoutPlans(plans);
    } catch (err) {
      console.error('Failed to load workout plans', err);
    }
  }, []);

  const saveWorkoutPlan = async (plan) => {
    try {
      const saved = await api.saveWorkoutPlan(plan);
      setWorkoutPlans(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteWorkoutPlan = async (id) => {
    try {
      await api.deleteWorkoutPlan(id);
      setWorkoutPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Goals
  const [goals, setGoals] = useState([]);
  
  const loadGoals = useCallback(async (clientId) => {
    try {
      const res = await fetch(`${api.API}/api/goals/${clientId}`);
      if (res.ok) setGoals(await res.json());
    } catch {}
  }, []);

  const createGoal = async (goal) => {
    try {
      const res = await fetch(`${api.API}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals(prev => [...prev, newGoal]);
        return newGoal;
      }
    } catch {}
  };

  const updateGoal = async (id, updates) => {
    try {
      await fetch(`${api.API}/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    } catch {}
  };

  const deleteGoal = async (id) => {
    await fetch(`${api.API}/api/goals/${id}`, { method: 'DELETE' });
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Check-Ins
  const [checkIns, setCheckIns] = useState([]);
  
  const loadCheckIns = useCallback(async () => {
    try {
      const result = await api.getCheckIns();
      setCheckIns(result);
    } catch (err) { console.error('Failed to load check-ins', err); }
  }, []);

  const createCheckIn = async (payload) => {
    try {
      const created = await api.createCheckIn(payload);
      setCheckIns(prev => {
        const next = [...prev, created];
        
        // Gamification Engine
        const client = data.clients.find(c => c.id === payload.clientId);
        if (client) {
          const myCheckIns = next.filter(c => c.clientId === payload.clientId);
          const badges = client.badges || [];
          const newBadges = [];
          
          if (myCheckIns.length === 1 && !badges.find(b => b.id === 'first-checkin')) {
            newBadges.push({ id: 'first-checkin', title: 'First Step', icon: 'Star', dateAwarded: new Date().toISOString() });
          }
          if (myCheckIns.length === 5 && !badges.find(b => b.id === 'five-checkins')) {
            newBadges.push({ id: 'five-checkins', title: 'Consistency King', icon: 'Flame', dateAwarded: new Date().toISOString() });
          }

          if (newBadges.length > 0) {
            updateClient(client.id, { badges: [...badges, ...newBadges] });
            newBadges.forEach(b => {
              addNotification({ userId: client.id, message: `🏆 You earned a new badge: ${b.title}!`, type: 'success', icon: 'metrics' });
            });
          }
        }
        
        return next;
      });
      
      refreshData();
      return created;
    } catch (err) { 
      console.error(err);
      throw err;
    }
  };

  const updateCheckIn = async (id, data) => {
    try {
      const updated = await api.updateCheckIn(id, data);
      setCheckIns(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    refreshData();
    loadWorkoutPlans();
    loadCheckIns();
  }, []);

  const contextValue = useMemo(() => ({
    data, loading, error, refreshData, save,
    updateClient, addClient, removeClient, addPhoto, deletePhoto,
    notifications, loadNotifications, addNotification, markNotificationRead, markAllNotificationsRead,
    workoutPlans, loadWorkoutPlans, saveWorkoutPlan, deleteWorkoutPlan,
    goals, loadGoals, createGoal, updateGoal, deleteGoal,
    checkIns, loadCheckIns, createCheckIn, updateCheckIn,
  }), [
    data, loading, error, refreshData, save,
    updateClient, addClient, removeClient, addPhoto, deletePhoto,
    notifications, loadNotifications, addNotification, markNotificationRead, markAllNotificationsRead,
    workoutPlans, loadWorkoutPlans, saveWorkoutPlan, deleteWorkoutPlan,
    goals, loadGoals, createGoal, updateGoal, deleteGoal,
    checkIns, loadCheckIns, createCheckIn, updateCheckIn
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
