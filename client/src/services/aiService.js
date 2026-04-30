import api from './api';

export const aiService = {
  analyze: async (text) => (await api.post('/api/sentiment/analyze', { text })).data,
};
