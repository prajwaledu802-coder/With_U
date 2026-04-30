/**
 * Facial emotion classification.
 * Uses Gemini Vision when available (existing companionController.analyzeFrame
 * relied on the same model) and otherwise returns a neutral mock so callers
 * never see an exception.
 */
const env = require('../config/env');
const logger = require('../utils/logger');
const { stripCodeFences } = require('../utils/helpers');

let genAI = null;
try {
  if (env.geminiKey) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(env.geminiKey);
  }
} catch (err) {
  logger.warn('[emotion.api] gemini sdk unavailable:', err.message);
}

const analyseFrame = async (base64DataUrl) => {
  if (!base64DataUrl || !genAI) {
    return { stressScore: 0, emotion: 'neutral', confidence: 0, source: 'mock' };
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const data = String(base64DataUrl).replace(/^data:image\/\w+;base64,/, '');
    const part = { inlineData: { data, mimeType: 'image/jpeg' } };
    const prompt = `Analyse facial expression for emotion. Respond ONLY with JSON: {"emotion":"<calm|neutral|tired|stressed|happy|sad|angry|fear>","stressScore":<0-100>,"confidence":<0-1>}.`;
    const result = await model.generateContent([prompt, part]);
    const raw = stripCodeFences(result.response.text());
    const parsed = JSON.parse(raw);
    return {
      stressScore: Math.min(100, Math.max(0, Number(parsed.stressScore || 0))),
      emotion: parsed.emotion || 'neutral',
      confidence: Number(parsed.confidence || 0.5),
      source: 'gemini-vision',
    };
  } catch (err) {
    logger.warn('[emotion.api] frame analysis fallback:', err.message);
    return { stressScore: 20, emotion: 'neutral', confidence: 0, source: 'fallback' };
  }
};

module.exports = { analyseFrame };
