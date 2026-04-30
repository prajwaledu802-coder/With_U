import api from './api';

const contactService = {
  list: async () => (await api.get('/api/contacts')).data,
  create: async (payload) => (await api.post('/api/contacts', payload)).data,
  update: async (id, payload) => (await api.put(`/api/contacts/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/api/contacts/${id}`)).data,
};

export default contactService;
