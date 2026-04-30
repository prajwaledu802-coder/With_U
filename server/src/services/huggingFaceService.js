/**
 * Hugging Face Inference Service
 *
 * Single source of truth for AI calls used by the companion (Aira):
 *   - generateReply(userText, context)  → empathic, short companion reply
 *   - classifyEmotion(userText)         → emotion label + score (0-100 stress)
 *   - classifyIntent(userText, labels)  → zero-shot navigation intent
 *
 * The service is fail-soft: any HF error returns a best-effort local result
 * so the chat never goes silent. Toggle with ENABLE_REAL_HF=false to force
 * local-only mode.
 */
const axios = require('axios');
const logger = require('../utils/logger');

const HF_KEY = process.env.HUGGINGFACE_API_KEY;
const ENABLED = process.env.ENABLE_REAL_HF !== 'false' && !!HF_KEY;
const CHAT_MODEL = process.env.HUGGINGFACE_CHAT_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';
const EMOTION_MODEL = process.env.HUGGINGFACE_EMOTION_MODEL || 'j-hartmann/emotion-english-distilroberta-base';
const INTENT_MODEL = process.env.HUGGINGFACE_INTENT_MODEL || 'facebook/bart-large-mnli';

const BASE = 'https://api-inference.huggingface.co/models';

const headers = () => ({
  Authorization: `Bearer ${HF_KEY}`,
  'Content-Type': 'application/json',
  'x-wait-for-model': 'true',
});

const safePost = async (url, body, { timeout = 30000 } = {}) => {
  const { data } = await axios.post(url, body, {
    headers: headers(),
    timeout,
    validateStatus: (s) => s < 500,
  });
  return data;
};

/* ─────────────────────────────────────────────
   1) EMOTION CLASSIFICATION
   ───────────────────────────────────────────── */
const EMOTION_TO_STRESS = {
  joy: 8,
  love: 10,
  surprise: 25,
  neutral: 30,
  fear: 70,
  anger: 65,
  sadness: 75,
  disgust: 60,
};

const classifyEmotion = async (text) => {
  if (!ENABLED || !text || text.trim().length < 2) {
    return { emotion: 'neutral', score: 0.5, stressScore: 25, source: 'local' };
  }

  try {
    const data = await safePost(`${BASE}/${EMOTION_MODEL}`, { inputs: text });
    const flat = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
    if (!flat.length) throw new Error('empty hf emotion result');

    flat.sort((a, b) => (b.score || 0) - (a.score || 0));
    const top = flat[0];
    const emotion = (top.label || 'neutral').toLowerCase();
    const score = Number(top.score || 0);
    const baseStress = EMOTION_TO_STRESS[emotion] ?? 30;
    const stressScore = Math.round(baseStress * (0.6 + 0.4 * score));

    return {
      emotion,
      score,
      stressScore: Math.min(100, Math.max(0, stressScore)),
      source: 'huggingface',
      raw: flat.slice(0, 3),
    };
  } catch (err) {
    logger.warn('HF emotion fallback:', err.message?.slice(0, 80));
    return { emotion: 'neutral', score: 0.5, stressScore: 25, source: 'local' };
  }
};

/* ─────────────────────────────────────────────
   2) CHAT REPLY GENERATION
   ───────────────────────────────────────────── */
const buildChatPrompt = (userText, context = {}) => {
  const userName = context.userName || 'friend';
  const emotion = context.emotion || 'neutral';
  const history = (context.history || []).slice(-6);
  const language = context.language || 'English';

  const langInstr = language !== 'English'
    ? ` You MUST respond entirely in ${language}. Be fluent and natural.`
    : '';

  const system = `You are WITH-U, an emotionally intelligent AI companion. You behave like a real human, not a chatbot.
Address the person as ${userName}. Their emotional state: ${emotion}.

RULES:
- Respond with empathy FIRST, then guidance
- Use natural pauses: "Hmm…", "I see…", "Okay…"
- Keep sentences short, warm, and real
- NEVER say "Thanks for sharing" — it's banned
- Never repeat the same sentence structure
- Ask gentle follow-up questions
- Never give medical diagnosis
- 2-4 sentences max
${langInstr}`;

  const turns = history
    .map((m) => `${m.role === 'user' ? '[INST]' : ''}${m.text}${m.role === 'user' ? '[/INST]' : ''}`)
    .join('\n');

  return `<s>[INST] ${system}\n\n${turns}\n${userText} [/INST]`;
};

const stripPromptEcho = (raw, prompt) => {
  if (!raw) return '';
  let out = String(raw);
  if (out.startsWith(prompt)) out = out.slice(prompt.length);
  return out
    .replace(/<\/?s>/g, '')
    .replace(/\[\/?INST\]/g, '')
    .split(/\n\s*\n/)[0]
    .trim()
    .slice(0, 500);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateReply = async (userText, context = {}) => {
  const name = context.userName || 'friend';
  const lower = (userText || '').toLowerCase();

  // Human-like fallbacks that adapt to the user's words
  const getFallback = () => {
    // ── NEGATION DETECTION (MUST BE FIRST) ──
    const negators = ['not', "n't", "don't", "dont", "didn't", "can't", "cant", "cannot", 'never', 'barely', 'hardly'];
    const posWords = ['good', 'great', 'fine', 'okay', 'ok', 'happy', 'well', 'better', 'nice', 'calm', 'wonderful'];
    const words = lower.replace(/[^a-z' ]/g, ' ').split(/\s+/);
    let negated = false;
    for (let i = 0; i < words.length; i++) {
      if (negators.some((n) => words[i] === n || words[i].endsWith("n't"))) {
        for (let j = i + 1; j <= Math.min(i + 3, words.length - 1); j++) {
          if (posWords.includes(words[j])) { negated = true; break; }
        }
      }
      if (negated) break;
    }
    if (negated) {
      return pick([
        `Hey… I'm really sorry you're feeling this way, ${name}. That sounds tough. Do you want to talk about what's been bothering you?`,
        `I hear you, ${name}… that doesn't sound easy at all. What's been going on? I'm here to listen.`,
        `Hmm… I can tell things aren't great right now, ${name}. What's weighing on you?`,
        `${name}… I'm sorry. It's okay to not feel okay. What's been happening? I'm right here.`,
      ]);
    }

    if (lower.includes('stress') || lower.includes('pressure') || lower.includes('overwhelm')) {
      return pick([
        `Hey ${name}… I can tell this is weighing on you. Let's slow this down for a moment, okay? What's been the hardest part?`,
        `Hmm… that sounds like a lot, ${name}. You don't have to carry all of it at once. What's pressing you the most right now?`,
        `I hear you, ${name}. Stress has a way of piling up quietly, doesn't it? Tell me what's going on.`,
      ]);
    }
    if (lower.includes('sad') || lower.includes('cry') || lower.includes('depress') || lower.includes('unhappy') || lower.includes('down')) {
      return pick([
        `Hey… that sounds really heavy, ${name}. I'm here with you. Do you want to talk about what's been making you feel this way?`,
        `${name}… I'm sorry you're going through this. You don't have to pretend everything's fine. What happened?`,
        `I see… something's really been pulling you down, hasn't it? I'm listening, ${name}. What's on your heart?`,
      ]);
    }
    if (lower.includes('anxious') || lower.includes('worried') || lower.includes('panic') || lower.includes('nervous') || lower.includes('scared')) {
      return pick([
        `Okay ${name}, let's slow this down together. You don't have to figure everything out right now. What's the main thing worrying you?`,
        `Hey… I can feel the worry in your words, ${name}. You're safe right now. What's on your mind?`,
        `${name}… anxiety can make everything feel so urgent. But right now, you're okay. What's been triggering this?`,
      ]);
    }
    if (lower.includes('tired') || lower.includes('exhaust') || lower.includes('drain') || lower.includes('sleep')) {
      return pick([
        `${name}… you've been carrying a lot, haven't you? What's been taking the most out of you?`,
        `I can hear how tired you are, ${name}. When was the last time you did something just for yourself?`,
        `Hmm… it sounds like you're running on empty. That's not easy, ${name}. What's been draining you?`,
      ]);
    }
    if (lower.includes('angry') || lower.includes('frustrat') || lower.includes('annoyed') || lower.includes('furious') || lower.includes('mad')) {
      return pick([
        `I get why that would be frustrating, ${name}. Your feelings make sense. What happened?`,
        `${name}… yeah, that sounds really frustrating. What's going on?`,
        `Hmm… I can feel the frustration in your words, ${name}. Do you want to talk about what triggered it?`,
      ]);
    }
    if (lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('amazing')) {
      return pick([
        `That's really nice to hear, ${name} 🙂 What made it feel good?`,
        `${name}! That energy is contagious. What's been making your day so good?`,
        `Ahh, I love hearing that, ${name}. You deserve these moments. What's the highlight?`,
      ]);
    }
    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody')) {
      return pick([
        `Hey ${name}… right now, right here — you're not alone. I'm with you. What's been going on?`,
        `${name}… that must feel heavy. I want you to know — I'm here, and I care. When did this start?`,
      ]);
    }
    // Default
    return pick([
      `Hey ${name}… I'm here. Tell me what's going on — whatever it is, I'm listening.`,
      `${name}, I'm glad you're here. What's been on your mind? Take your time.`,
      `Hmm… tell me more, ${name}. What's been happening? I want to understand.`,
    ]);
  };

  if (!ENABLED || !userText) {
    return { text: getFallback(), source: 'local' };
  }

  try {
    const prompt = buildChatPrompt(userText, context);
    const data = await safePost(
      `${BASE}/${CHAT_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 120,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
          do_sample: true,
        },
        options: { wait_for_model: true },
      },
      { timeout: 45000 }
    );

    const generated = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    const cleaned = stripPromptEcho(generated, prompt);
    if (!cleaned || cleaned.length < 4) throw new Error('empty hf generation');

    return { text: cleaned, source: 'huggingface' };
  } catch (err) {
    logger.warn('HF chat fallback:', err.message?.slice(0, 80));
    return { text: getFallback(), source: 'local' };
  }
};

/* ─────────────────────────────────────────────
   3) INTENT (ZERO-SHOT)
   ───────────────────────────────────────────── */
const classifyIntent = async (text, candidateLabels) => {
  if (!ENABLED || !text || !candidateLabels?.length) return null;

  try {
    const data = await safePost(`${BASE}/${INTENT_MODEL}`, {
      inputs: text,
      parameters: {
        candidate_labels: candidateLabels,
        multi_label: false,
      },
    });
    if (!data?.labels?.length) return null;
    const topIdx = 0;
    return {
      label: data.labels[topIdx],
      score: data.scores[topIdx],
      ranking: data.labels.map((l, i) => ({ label: l, score: data.scores[i] })),
      source: 'huggingface',
    };
  } catch (err) {
    logger.warn('HF intent fallback:', err.message?.slice(0, 80));
    return null;
  }
};

const isHealthy = () => ENABLED;

module.exports = {
  generateReply,
  classifyEmotion,
  classifyIntent,
  isHealthy,
};
