import api from './api';

const med = {
  list: async () => (await api.get('/api/medications')).data,
  create: async (payload) => (await api.post('/api/medications', payload)).data,
  update: async (id, payload) => (await api.put(`/api/medications/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/api/medications/${id}`)).data,
  markTaken: async (id) => (await api.post(`/api/medications/${id}/taken`)).data,
  remindNow: async (id) => (await api.post(`/api/medications/${id}/remind`)).data,
  acknowledge: async (id) => (await api.post(`/api/medications/${id}/ack`)).data,
  due: async () => (await api.get('/api/medications/due')).data,
  canonicalMobile: async () => (await api.get('/api/medications/canonical-mobile')).data,
  // WhatsApp deep link (client-side fallback)
  openWhatsApp: (phone, medName, dosage) => {
    const msg = encodeURIComponent(`💊 Reminder: Time for ${medName}${dosage ? ` (${dosage})` : ''}. Take whenever you're ready. — WITH_U`);
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  },
  resendConfirmation: async (id) => (await api.post(`/api/medications/${id}/resend-confirm`)).data,
  parse: async ({ text, file }) => {
    if (file) {
      const form = new FormData();
      form.append('file', file);
      return (await api.post('/api/medications/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data;
    }
    return (await api.post('/api/medications/parse', { text })).data;
  },
};

export default med;
