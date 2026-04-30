/**
 * OpenAI integration shim — only used if OPENAI_API_KEY is present.
 * The companion currently runs HF + Gemini; this stub exists so adding
 * an OpenAI fallback later is a one-file change.
 */
const env = require('../config/env');

const isEnabled = () => !!env.openAiKey;

const generateText = async (_prompt) => {
  if (!isEnabled()) return { text: '', source: 'openai-disabled' };
  return { text: '', source: 'openai-stub' };
};

module.exports = { isEnabled, generateText };
