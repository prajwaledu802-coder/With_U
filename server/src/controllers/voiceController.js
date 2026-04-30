const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { synthesizeSpeech, listVoices } = require('../services/elevenLabsService');
const { transcribeBuffer } = require('../services/assemblyAIService');

exports.tts = asyncHandler(async (req, res) => {
  const { text, voiceId, stability, similarity, style } = req.body || {};
  if (!text || !text.trim()) throw new ApiError(400, 'text is required');

  const result = await synthesizeSpeech(text.trim(), { voiceId, stability, similarity, style });

  if (result.mock || !result.audioBuffer) {
    return res.json({ success: true, mock: true, message: 'TTS mock — no audio generated', text });
  }

  res.set('Content-Type', result.contentType || 'audio/mpeg');
  res.set('Cache-Control', 'no-store');
  return res.send(result.audioBuffer);
});

exports.stt = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) throw new ApiError(400, 'audio file required (multipart field "audio")');
  const result = await transcribeBuffer(req.file.buffer);
  res.json({ success: true, ...result });
});

exports.voices = asyncHandler(async (_req, res) => {
  const result = await listVoices();
  res.json({ success: true, ...result });
});
