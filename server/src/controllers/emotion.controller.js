const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/helpers');
const emotionService = require('../services/emotion.service');

exports.analyseText = asyncHandler(async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) throw new ApiError(400, 'text required');
  const r = await emotionService.fromText(text.trim());
  if (req.user) await emotionService.log(req.user._id, r);
  ok(res, r);
});

exports.analyseFrame = asyncHandler(async (req, res) => {
  const { image } = req.body || {};
  if (!image) throw new ApiError(400, 'image (data URL) required');
  const r = await emotionService.fromFrame(image);
  if (req.user) await emotionService.log(req.user._id, r);
  ok(res, r);
});

exports.fuse = asyncHandler(async (req, res) => {
  const { text, image, voiceTranscript } = req.body || {};
  const textEntry = text ? await emotionService.fromText(text) : null;
  const voiceEntry = voiceTranscript ? await emotionService.fromVoiceTranscript(voiceTranscript) : null;
  const faceEntry = image ? await emotionService.fromFrame(image) : null;
  const fused = emotionService.fuseSources(textEntry, voiceEntry, faceEntry);
  if (req.user) await emotionService.log(req.user._id, fused);
  ok(res, { fused, components: { textEntry, voiceEntry, faceEntry } });
});

exports.recent = asyncHandler(async (req, res) => {
  if (!req.user) return ok(res, { items: [] });
  const items = await emotionService.recent(req.user._id);
  ok(res, { items });
});
