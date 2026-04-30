import api from './api';

const sessionService = {
  list: async () => (await api.get('/api/sessions')).data,
  create: async (payload) => (await api.post('/api/sessions', payload)).data,
  get: async (id) => (await api.get(`/api/sessions/${id}`)).data,
  appendMessages: async (id, messages) =>
    (await api.post(`/api/sessions/${id}/messages`, { messages })).data,
  remove: async (id) => (await api.delete(`/api/sessions/${id}`)).data,
};

export default sessionService;
