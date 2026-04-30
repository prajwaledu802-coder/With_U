import api from './api';

export const dbService = {
  dashboard: async () => (await api.get('/api/dashboard/summary')).data,
  stats: async () => (await api.get('/api/dashboard/stats')).data,

  createLog: async (payload) => (await api.post('/api/logs', payload)).data,
  listLogs: async (params = {}) => (await api.get('/api/logs', { params })).data,
  deleteLog: async (id) => (await api.delete(`/api/logs/${id}`)).data,

  sentimentHistory: async (days = 14) =>
    (await api.get('/api/sentiment/history', { params: { days } })).data,
  sentimentTrend: async () => (await api.get('/api/sentiment/trend')).data,

  contacts: async () => (await api.get('/api/contacts')).data,
  createContact: async (payload) => (await api.post('/api/contacts', payload)).data,
  updateContact: async (id, payload) => (await api.put(`/api/contacts/${id}`, payload)).data,
  deleteContact: async (id) => (await api.delete(`/api/contacts/${id}`)).data,

  toggleGentleReach: async (enabled) =>
    (await api.post('/api/gentlereach/toggle', { enabled })).data,
  triggerGentleReach: async (contactId) =>
    (await api.post('/api/gentlereach/trigger', { contactId })).data,
  gentleReachHistory: async () => (await api.get('/api/gentlereach/history')).data,

  resources: async (lang = 'en', tag) =>
    (await api.get('/api/resources', { params: { lang, tag } })).data,

  updateSettings: async (payload) => (await api.put('/api/users/settings', payload)).data,
  updateProfile: async (payload) => (await api.put('/api/users/profile', payload)).data,
};
