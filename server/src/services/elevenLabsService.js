const axios = require('axios');
const logger = require('../utils/logger');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const ENABLED = process.env.ENABLE_REAL_TTS === 'true';

const synthesizeSpeech = async (text, opts = {}) => {
  const voiceId = opts.voiceId || VOICE_ID;

  if (!ENABLED || !API_KEY) {
    logger.warn('TTS disabled or API key missing — returning mock audio metadata');
    return {
      mock: true,
      text,
      voiceId,
      audioBuffer: null,
      contentType: 'audio/mpeg',
    };
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: opts.modelId || MODEL_ID,
        voice_settings: {
          stability: opts.stability ?? 0.55,
          similarity_boost: opts.similarity ?? 0.75,
          style: opts.style ?? 0.3,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );
    return {
      mock: false,
      audioBuffer: Buffer.from(response.data),
      contentType: 'audio/mpeg',
      voiceId,
    };
  } catch (err) {
    logger.error('ElevenLabs error:', err.response?.data?.toString?.() || err.message);
    throw new Error('Voice synthesis failed');
  }
};

const listVoices = async () => {
  if (!ENABLED || !API_KEY) return { mock: true, voices: [] };
  try {
    const { data } = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': API_KEY },
      timeout: 10000,
    });
    return { mock: false, voices: data.voices || [] };
  } catch (err) {
    logger.error('ElevenLabs list voices error:', err.message);
    return { mock: true, voices: [] };
  }
};

module.exports = { synthesizeSpeech, listVoices };
