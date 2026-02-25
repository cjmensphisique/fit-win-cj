export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api`;

const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const patch = (url, body) =>
  fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const del = (url) => fetch(url, { method: 'DELETE' });

export const api = {
  async login(identifier, password) {
    const r = await post(`${API_BASE}/login`, { identifier, password });
    if (!r.ok) {
      const error = await r.json();
      throw new Error(error.error || 'Authentication failed');
    }
    return r.json();
  },

  async getData() {
    const r = await fetch(`${API_BASE}/data`);
    if (!r.ok) throw new Error('Failed to fetch data');
    return r.json();
  },

  async saveData(data) {
    const r = await post(`${API_BASE}/save`, data);
    if (!r.ok) throw new Error('Failed to save data');
    return r.json();
  },

  // Clients
  async createClient(client) {
    const r = await post(`${API_BASE}/clients`, client);
    if (!r.ok) throw new Error('Failed to create client');
    return r.json();
  },

  async deleteClient(id) {
    const r = await del(`${API_BASE}/clients/${id}`);
    if (!r.ok) throw new Error('Failed to delete client');
    return r.json();
  },
  async updateClient(id, fields) {
    const r = await patch(`${API_BASE}/clients/${id}`, fields);
    if (!r.ok) throw new Error('Failed to update client');
    return r.json();
  },

  async addPhoto(clientId, photo) {
    const r = await post(`${API_BASE}/clients/${clientId}/photos`, photo);
    if (!r.ok) throw new Error('Failed to add photo');
    return r.json();
  },

  async deletePhoto(clientId, photoId) {
    const r = await del(`${API_BASE}/clients/${clientId}/photos/${photoId}`);
    if (!r.ok) throw new Error('Failed to delete photo');
    return r.json();
  },

  // Notifications
  async getNotifications(userId) {
    const r = await fetch(`${API_BASE}/notifications/${userId}`);
    if (!r.ok) throw new Error('Failed to fetch notifications');
    return r.json();
  },

  async addNotification(notif) {
    const r = await post(`${API_BASE}/notifications`, notif);
    if (!r.ok) throw new Error('Failed to create notification');
    return r.json();
  },

  async markNotificationRead(id) {
    const r = await patch(`${API_BASE}/notifications/${id}/read`, {});
    if (!r.ok) throw new Error('Failed to mark notification read');
    return r.json();
  },

  async markAllNotificationsRead(userId) {
    const r = await patch(`${API_BASE}/notifications/read-all/${userId}`, {});
    if (!r.ok) throw new Error('Failed to mark all read');
    return r.json();
  },

  // Workout Plans
  async getWorkoutPlans() {
    const r = await fetch(`${API_BASE}/workout-plans`);
    if (!r.ok) throw new Error('Failed to fetch workout plans');
    return r.json();
  },

  async saveWorkoutPlan(plan) {
    const r = await post(`${API_BASE}/workout-plans`, plan);
    if (!r.ok) throw new Error('Failed to save workout plan');
    return r.json();
  },

  async deleteWorkoutPlan(id) {
    const r = await del(`${API_BASE}/workout-plans/${id}`);
    if (!r.ok) throw new Error('Failed to delete workout plan');
    return r.json();
  },

  // Check-Ins
  async getCheckIns() {
    const r = await fetch(`${API_BASE}/check-ins`);
    if (!r.ok) throw new Error('Failed to fetch check-ins');
    return r.json();
  },

  async createCheckIn(data) {
    const r = await post(`${API_BASE}/check-ins`, data);
    if (!r.ok) throw new Error('Failed to create check-in');
    return r.json();
  },

  async updateCheckIn(id, data) {
    const r = await patch(`${API_BASE}/check-ins/${id}`, data);
    if (!r.ok) throw new Error('Failed to update check-in');
    return r.json();
  },

  // Auth
  async verifyIdentity(email) {
    const r = await post(`${API_BASE}/auth/verify-identity`, { email });
    if (!r.ok) {
      const error = await r.json();
      throw new Error(error.error || 'User not found');
    }
    return r.json();
  },

  async resetPassword(email, phone, newPassword) {
    const r = await post(`${API_BASE}/auth/reset-password`, { email, phone, newPassword });
    if (!r.ok) {
      const error = await r.json();
      throw new Error(error.error || 'Reset failed');
    }
    return r.json();
  },
};
