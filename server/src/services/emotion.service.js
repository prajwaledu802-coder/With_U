const EmotionLog = require('../models/emotion.model');
const hf = require('../integrations/huggingface');
const emotionApi = require('../integrations/emotion.api');
const { fuse } = require('../ai/stress.engine');

const fromText = async (text) => {
  const result = await hf.classifyEmotion(text);
  return {
    source: 'text',
    emotion: result.emotion,
    stressScore: result.stressScore,
    confidence: result.score,
    raw: result,
  };
};

const fromVoiceTranscript = async (transcript) => {
  if (!transcript) return null;
  const r = await fromText(transcript);
  return { ...r, source: 'voice' };
};

const fromFrame = async (base64DataUrl) => {
  const r = await emotionApi.analyseFrame(base64DataUrl);
  return {
    source: 'face',
    emotion: r.emotion,
    stressScore: r.stressScore,
    confidence: r.confidence,
    raw: r,
  };
};

const log = async (userId, entry) => {
  if (!userId) return null;
  return EmotionLog.create({ user: userId, ...entry });
};

const fuseSources = (textEntry, voiceEntry, faceEntry) => {
  const score = fuse(textEntry?.stressScore, voiceEntry?.stressScore, faceEntry?.stressScore);
  const dominant = [textEntry, voiceEntry, faceEntry]
    .filter(Boolean)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
  return {
    source: 'fused',
    emotion: dominant?.emotion || 'neutral',
    stressScore: score,
    confidence: dominant?.confidence || 0.5,
    components: {
      text: textEntry?.stressScore ?? null,
      voice: voiceEntry?.stressScore ?? null,
      face: faceEntry?.stressScore ?? null,
    },
  };
};

const recent = async (userId, limit = 20) =>
  EmotionLog.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();

module.exports = { fromText, fromVoiceTranscript, fromFrame, log, fuseSources, recent };
