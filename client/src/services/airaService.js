import api from './api';

const v2 = '/api/v2';

export const airaService = {
  // Conversation
  send: (text, opts = {}) =>
    api.post(`${v2}/conversation/send`, { text, ...opts }).then((r) => r.data),
  startSession: (language) =>
    api.post(`${v2}/conversation/start`, { language }).then((r) => r.data),
  listSessions: () => api.get(`${v2}/conversation`).then((r) => r.data),
  getSession: (id) => api.get(`${v2}/conversation/${id}`).then((r) => r.data),
  archiveSession: (id) => api.post(`${v2}/conversation/${id}/archive`).then((r) => r.data),
  removeSession: (id) => api.delete(`${v2}/conversation/${id}`).then((r) => r.data),
  health: () => api.get(`${v2}/conversation/health`).then((r) => r.data),

  // Emotion
  emotionFromText: (text) =>
    api.post(`${v2}/emotion/text`, { text }).then((r) => r.data),
  emotionFromFrame: (image) =>
    api.post(`${v2}/emotion/frame`, { image }).then((r) => r.data),
  emotionFuse: (payload) =>
    api.post(`${v2}/emotion/fuse`, payload).then((r) => r.data),
  emotionRecent: () => api.get(`${v2}/emotion/recent`).then((r) => r.data),

  // Stress
  computeStress: (signals, sentimentScore = 0, source = 'text') =>
    api.post(`${v2}/stress/compute`, { signals, sentimentScore, source }).then((r) => r.data),
  stressRecent: () => api.get(`${v2}/stress/recent`).then((r) => r.data),
  stressDaily: (days = 14) =>
    api.get(`${v2}/stress/daily`, { params: { days } }).then((r) => r.data),

  // Recommendation
  recommend: (stressLevel, tags = []) =>
    api.post(`${v2}/recommendation/suggest`, { stressLevel, tags }).then((r) => r.data),
  playlist: () => api.get(`${v2}/recommendation/playlist`).then((r) => r.data),
  games: () => api.get(`${v2}/recommendation/games`).then((r) => r.data),

  // Call / SOS
  helplines: (region = 'IN') =>
    api.get(`${v2}/call/helplines`, { params: { region } }).then((r) => r.data),
  triggerSOS: (payload) => api.post(`${v2}/call/sos`, payload).then((r) => r.data),
  startVideoCall: (peerId) =>
    api.post(`${v2}/call/start`, { peerId }).then((r) => r.data),

  // Voice
  voices: () => api.get(`${v2}/voice/voices`).then((r) => r.data),
  speak: async (text, voiceId) => {
    const res = await api.post(
      `${v2}/voice/tts`,
      { text, voiceId },
      { responseType: 'blob' }
    );
    if (res.headers['content-type']?.includes('application/json')) {
      const reader = new FileReader();
      return await new Promise((resolve) => {
        reader.onload = () => resolve(JSON.parse(reader.result));
        reader.readAsText(res.data);
      });
    }
    const url = URL.createObjectURL(res.data);
    const audio = new Audio(url);
    return { audio, url, mock: false };
  },

  // Dashboard
  dashboardOverview: () => api.get(`${v2}/dashboard/overview`).then((r) => r.data),
  dashboardStreak: () => api.get(`${v2}/dashboard/streak`).then((r) => r.data),

  // Languages + helplines
  languages: () => api.get(`${v2}/lang`).then((r) => r.data),
};
