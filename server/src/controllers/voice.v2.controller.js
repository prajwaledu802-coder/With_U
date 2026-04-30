const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/helpers');
const voice = require('../services/voice.service');

exports.tts = asyncHandler(async (req, res) => {
  const { text, voiceId, stability, similarity, style } = req.body || {};
  if (!text || !text.trim()) throw new ApiError(400, 'text required');
  const result = await voice.speak(text.trim(), { voiceId, stability, similarity, style });
  if (result.mock || !result.audioBuffer) {
    return ok(res, { mock: true, message: 'TTS mock', text });
  }
  res.set('Content-Type', result.contentType || 'audio/mpeg');
  res.set('Cache-Control', 'no-store');
  return res.send(result.audioBuffer);
});

exports.stt = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) throw new ApiError(400, 'audio file required');
  const r = await voice.transcribe(req.file.buffer);
  ok(res, r);
});

exports.voices = asyncHandler(async (_req, res) => {
  const live = await voice.listVoices();
  ok(res, { live: live.voices, presets: voice.presets() });
});
