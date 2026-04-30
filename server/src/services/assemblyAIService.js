const axios = require('axios');
const logger = require('../utils/logger');

const API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ENABLED = process.env.ENABLE_REAL_STT === 'true';
const BASE = 'https://api.assemblyai.com';

const headers = () => ({ authorization: API_KEY });

const uploadAudio = async (audioBuffer) => {
  const { data } = await axios.post(`${BASE}/v2/upload`, audioBuffer, {
    headers: { ...headers(), 'Content-Type': 'application/octet-stream' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 60000,
  });
  return data.upload_url;
};

const requestTranscript = async (audioUrl) => {
  const { data } = await axios.post(
    `${BASE}/v2/transcript`,
    {
      audio_url: audioUrl,
      language_detection: true,
      speech_model: 'universal',
    },
    { headers: headers(), timeout: 30000 }
  );
  return data.id;
};

const pollTranscript = async (id, { maxMs = 60000 } = {}) => {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const { data } = await axios.get(`${BASE}/v2/transcript/${id}`, {
      headers: headers(),
      timeout: 15000,
    });
    if (data.status === 'completed') return data;
    if (data.status === 'error') throw new Error(data.error || 'Transcription error');
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error('Transcription timed out');
};

const transcribeBuffer = async (audioBuffer) => {
  if (!ENABLED || !API_KEY) {
    logger.warn('STT disabled or key missing — returning mock transcript');
    return {
      mock: true,
      text: '[Mock transcript: voice input received]',
      language: 'en',
      confidence: 1,
    };
  }
  try {
    const uploadUrl = await uploadAudio(audioBuffer);
    const id = await requestTranscript(uploadUrl);
    const result = await pollTranscript(id);
    return {
      mock: false,
      text: result.text || '',
      language: result.language_code || 'en',
      confidence: result.confidence || 0,
    };
  } catch (err) {
    logger.error('AssemblyAI error:', err.message);
    throw new Error('Speech-to-text failed');
  }
};

const transcribeUrl = async (audioUrl) => {
  if (!ENABLED || !API_KEY) {
    return { mock: true, text: '[Mock transcript from URL]', language: 'en', confidence: 1 };
  }
  const id = await requestTranscript(audioUrl);
  const result = await pollTranscript(id);
  return {
    mock: false,
    text: result.text || '',
    language: result.language_code || 'en',
    confidence: result.confidence || 0,
  };
};

module.exports = { transcribeBuffer, transcribeUrl };
