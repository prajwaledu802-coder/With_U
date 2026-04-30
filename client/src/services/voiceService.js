import api from './api';

export const voiceService = {
  speak: async (text) => {
    const res = await api.post(
      '/api/voice/tts',
      { text },
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
    audio.play().catch(() => {});
    return { mock: false, audio, url };
  },

  transcribe: async (audioBlob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    const { data } = await api.post('/api/voice/stt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
