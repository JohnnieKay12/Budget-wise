import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data)
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get('/expenses/stats')
};

export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getOverview: () => api.get('/budgets/overview')
};

export const savingsAPI = {
  getAll: (params) => api.get('/savings', { params }),
  getById: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  addSavings: (id, data) => api.post(`/savings/${id}/add`, data),
  delete: (id) => api.delete(`/savings/${id}`),
  getOverview: () => api.get('/savings/overview')
};

export const reminderAPI = {
  getAll: (params) => api.get('/reminders', { params }),
  getUpcoming: () => api.get('/reminders/upcoming'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  toggle: (id) => api.patch(`/reminders/${id}/toggle`),
  delete: (id) => api.delete(`/reminders/${id}`)
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const insightAPI = {
  getAll: (params) => api.get('/insights', { params }),
  generate: () => api.post('/insights/generate'),
  markAsRead: (id) => api.patch(`/insights/${id}/read`)
};

export const challengeAPI = {
  getAll: (params) => api.get('/challenges', { params }),
  getById: (id) => api.get(`/challenges/${id}`),
  create: (data) => api.post('/challenges', data),
  join: (id) => api.post(`/challenges/${id}/join`),
  updateProgress: (id, data) => api.post(`/challenges/${id}/progress`, data),
  delete: (id) => api.delete(`/challenges/${id}`)
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getSoftLifeScore: () => api.get('/dashboard/soft-life-score')
};
