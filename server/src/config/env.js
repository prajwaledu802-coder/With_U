/**
 * Centralised environment loader and validator.
 * Fail-soft: never throws — sets sensible defaults so the server can still boot.
 */
require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI || '',

  redisUrl: process.env.REDIS_URL || '',

  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  elevenLabsKey: process.env.ELEVENLABS_API_KEY || '',
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
  elevenLabsModelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',

  assemblyAiKey: process.env.ASSEMBLYAI_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',
  openAiKey: process.env.OPENAI_API_KEY || '',
  huggingFaceKey: process.env.HUGGINGFACE_API_KEY || '',
  hfChatModel: process.env.HUGGINGFACE_CHAT_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3',
  hfEmotionModel: process.env.HUGGINGFACE_EMOTION_MODEL || 'j-hartmann/emotion-english-distilroberta-base',
  hfIntentModel: process.env.HUGGINGFACE_INTENT_MODEL || 'facebook/bart-large-mnli',

  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'Aira <noreply@aira.app>',

  twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFrom: process.env.TWILIO_FROM_NUMBER || '',

  enableRealEmail: process.env.ENABLE_REAL_EMAIL === 'true',
  enableRealTts: process.env.ENABLE_REAL_TTS === 'true',
  enableRealStt: process.env.ENABLE_REAL_STT === 'true',
  enableRealHf: process.env.ENABLE_REAL_HF !== 'false',
  enableRealSms: process.env.ENABLE_REAL_SMS === 'true',
};

const missing = [];
if (!env.mongoUri) missing.push('MONGO_URI');
if (!env.supabaseUrl) missing.push('SUPABASE_URL');
if (missing.length) {
  console.warn('[env] missing recommended vars:', missing.join(', '));
}

module.exports = env;
