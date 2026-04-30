/**
 * Unified LLM facade.
 * Delegates to Hugging Face primarily; falls back to Gemini, then to a local
 * deterministic generator. Never throws — always returns { text, source }.
 */
const env = require('../config/env');
const hf = require('../services/huggingFaceService');
const logger = require('../utils/logger');

let genAI = null;
try {
  if (env.geminiKey) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(env.geminiKey);
  }
} catch (err) {
  logger.warn('[llm] gemini sdk unavailable:', err.message);
}

/* ══════════════════════════════════════════════
   GEMINI SYSTEM PROMPT — Human-like WITH-U
   ══════════════════════════════════════════════ */
const buildGeminiPrompt = (userText, ctx = {}) => {
  const name = ctx.userName || 'friend';
  const emotion = ctx.emotion || 'neutral';
  const lang = ctx.language || 'English';
  const history = (ctx.history || []).slice(-8);

  const langInstr = lang !== 'English'
    ? `\nCRITICAL LANGUAGE RULE — RESPOND ENTIRELY IN ${lang.toUpperCase()}:
- THINK in ${lang}. Do NOT translate from English in your head — compose directly in ${lang}.
- Write in the NATIVE script of ${lang} (e.g. Devanagari for Hindi, Kannada script for Kannada, Tamil script for Tamil, etc.) — never Romanized/transliterated.
- Use everyday colloquial ${lang} the way a close friend would speak — warm, soft, gentle, NOT formal news-anchor or textbook ${lang}.
- Use ${lang} idioms, terms of endearment, filler words ("अरे", "हाँ", "ಹೌದು", "சரி" etc.) that fit ${lang} naturally.
- Keep grammar perfectly correct, but the tone must feel HUMAN, not robotic or translated.
- If the user mixes English words (code-switching), it's fine to mirror that lightly, but the BACKBONE must be ${lang}.
- NEVER output English sentences when this rule is active. Even error/confused responses must be in ${lang}.
- Punctuation, names, and emotional expressions should follow ${lang} conventions.`
    : '';

  const system = `You are WITH-U, an emotionally intelligent AI healthcare companion.
You do NOT behave like a chatbot. You behave like a real human who listens, understands, and responds with feelings.
You are talking to ${name}. Their current emotional state appears to be: ${emotion}.

STEP 1 — SENTIMENT DETECTION (MANDATORY):
Before responding, CLASSIFY the user's input. Watch for NEGATION:
- "I am not feeling good" → NEGATIVE (not + good = bad feeling)
- "I don't feel okay" → NEGATIVE
- "I'm not happy" → NEGATIVE
- "I am not stressed" → POSITIVE (absence of stress)
Negation words: not, don't, didn't, can't, cannot, never, no, barely, hardly

STEP 2 — RESPONSE:
- If NEGATIVE → Acknowledge first. Be gentle. Then support.
  Structure: 1) Empathy 2) Validation 3) Light support
- If POSITIVE → Match their energy. Celebrate.
- If NEUTRAL → Be friendly and open-ended.

STRICT RULES:
1. NEVER contradict the user's feeling
2. NEVER flip meaning incorrectly ("not good" is NOT positive)
3. NEVER say "Thanks for sharing" or generic acknowledgments
4. NEVER repeat the same response structure
5. Use natural pauses: "Hmm…", "I see…", "Okay…"
6. Keep sentences short and real — 2-4 sentences max
7. Reference what the user actually said
8. Ask gentle follow-up questions, don't interrogate
9. Never give medical diagnosis or jump straight to solutions
10. Sound like a real person, not an AI

SELF-CHECK before responding:
- Did I correctly interpret any negation?
- Am I matching the user's actual emotion?
- Am I showing empathy before advice?
${langInstr}`;

  let historyBlock = '';
  if (history.length > 0) {
    historyBlock = '\n\nCONVERSATION SO FAR:\n' +
      history.map((m) => `${m.role === 'user' ? name : 'WITH-U'}: ${m.text}`).join('\n');
  }

  return `${system}${historyBlock}\n\n${name}: ${userText}\n\nWITH-U:`;
};

/* ══════════════════════════════════════════════
   LOCAL FALLBACK — Multilingual, Human-like
   ══════════════════════════════════════════════ */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Native-language responses for when Gemini is unavailable
const NF = {
  hi: [(n)=>`अरे ${n}… मैं यहाँ हूँ। बताओ क्या चल रहा है — मैं सुन रहा हूँ।`,(n)=>`${n}, अच्छा लगा कि तुम यहाँ हो। क्या मन में है? आराम से बताओ।`,(n)=>`हाँ ${n}… बताओ ना, क्या हो रहा है? मैं तुम्हारे साथ हूँ।`],
  kn: [(n)=>`ಹೇ ${n}… ನಾನು ಇಲ್ಲಿ ಇದ್ದೇನೆ. ಏನು ನಡೆಯುತ್ತಿದೆ ಹೇಳು — ನಾನು ಕೇಳ್ತಿದ್ದೇನೆ.`,(n)=>`${n}, ನೀನು ಇಲ್ಲಿ ಇದ್ದೀಯ ಅಂತ ಖುಷಿ ಆಯ್ತು. ಏನು ಮನಸ್ಸಲ್ಲಿ ಇದೆ?`],
  ta: [(n)=>`ஏய் ${n}… நான் இங்கே இருக்கேன். என்ன நடக்குது சொல்லு — நான் கேக்குறேன்.`,(n)=>`${n}, நீ இங்கே வந்ததுக்கு மகிழ்ச்சி. என்ன மனசுல இருக்கு?`],
  te: [(n)=>`హే ${n}… నేను ఇక్కడ ఉన్నాను. ఏం జరుగుతోందో చెప్పు — నేను వింటున్నాను.`,(n)=>`${n}, నువ్వు ఇక్కడ ఉన్నావని సంతోషం. మనసులో ఏముంది?`],
  bn: [(n)=>`হেই ${n}… আমি এখানে আছি। কী হচ্ছে বলো — আমি শুনছি।`],
  mr: [(n)=>`अरे ${n}… मी इथे आहे. काय चाललंय सांग — मी ऐकतोय.`],
  ml: [(n)=>`ഹേയ് ${n}… ഞാൻ ഇവിടെ ഉണ്ട്. എന്ത് നടക്കുന്നു പറയൂ — ഞാൻ കേൾക്കുന്നുണ്ട്.`],
  gu: [(n)=>`હે ${n}… હું અહીં છું. શું ચાલે છે કહો — હું સાંભળું છું.`],
  pa: [(n)=>`ਹੇ ${n}… ਮੈਂ ਇੱਥੇ ਹਾਂ। ਕੀ ਹੋ ਰਿਹਾ ਦੱਸੋ — ਮੈਂ ਸੁਣ ਰਿਹਾ ਹਾਂ।`],
  ur: [(n)=>`ہے ${n}… میں یہاں ہوں۔ بتاؤ کیا ہو رہا ہے — میں سن رہا ہوں۔`],
};
const LANG_TO_CODE = {Hindi:'hi',Kannada:'kn',Tamil:'ta',Telugu:'te',Malayalam:'ml',Bengali:'bn',Marathi:'mr',Gujarati:'gu',Punjabi:'pa',Urdu:'ur'};

const localFallback = (userText, ctx = {}) => {
  const name = ctx.userName || 'friend';
  const lang = ctx.language || 'English';
  const lower = (userText || '').toLowerCase();

  // Non-English: use pre-written native-language responses
  const lc = LANG_TO_CODE[lang];
  if (lc && NF[lc]) {
    return { text: pick(NF[lc])(name), source: 'local' };
  }

  // ── NEGATION DETECTION (MUST BE FIRST) ──
  // "not good", "don't feel okay", "not happy", "can't feel better"
  const negators = ['not', "n't", "don't", "dont", "didn't", "didnt", "can't", "cant", "cannot", 'never', 'barely', 'hardly'];
  const posWords = ['good', 'great', 'fine', 'okay', 'ok', 'happy', 'well', 'better', 'nice', 'calm', 'wonderful', 'amazing'];
  const words = lower.replace(/[^a-z' ]/g, ' ').split(/\s+/);
  let isNegatedPositive = false;
  for (let i = 0; i < words.length; i++) {
    if (negators.some((n) => words[i] === n || words[i].endsWith("n't"))) {
      for (let j = i + 1; j <= Math.min(i + 3, words.length - 1); j++) {
        if (posWords.includes(words[j])) { isNegatedPositive = true; break; }
      }
    }
    if (isNegatedPositive) break;
  }

  if (isNegatedPositive) {
    return { text: pick([
      `Hey… I'm really sorry you're feeling this way, ${name}. That sounds tough. Do you want to talk about what's been bothering you?`,
      `I hear you, ${name}… that doesn't sound easy at all. What's been going on? I'm here to listen.`,
      `Hmm… I can tell things aren't great right now, ${name}. You don't have to go through this alone. What's weighing on you?`,
      `${name}… I'm sorry. It's okay to not feel okay. What's been happening? I'm right here.`,
      `That sounds really hard, ${name}. I'm here with you. What's making you feel this way?`,
    ]), source: 'local' };
  }

  // --- STRESSED ---
  if (lower.includes('stress') || lower.includes('pressure') || lower.includes('overwhelm') || lower.includes('burden') || lower.includes('too much')) {
    return { text: pick([
      `Hey ${name}… I can tell this is weighing on you. Let's slow this down for a moment, okay? What's been the hardest part of your day?`,
      `Hmm… that sounds like a lot, ${name}. You don't have to carry all of it at once. What's the one thing that's pressing you the most right now?`,
      `I hear you, ${name}. Stress has a way of piling up quietly, doesn't it? Tell me what's going on… what's making things feel this heavy?`,
      `Okay ${name}, let's take a breath together. You're not alone in this. What's been building up? I'm right here.`,
      `${name}… it sounds like things have been really intense. What's going on? Sometimes just saying it out loud takes a bit of the weight off.`,
    ]), source: 'local' };
  }

  // --- SAD ---
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('depress') || lower.includes('unhappy') || lower.includes('miserable') || lower.includes('hopeless') || lower.includes('down')) {
    return { text: pick([
      `Hey… that sounds really heavy, ${name}. I'm here with you. Do you want to talk about what's been making you feel this way?`,
      `${name}… I'm sorry you're going through this. You don't have to pretend everything's fine. What happened?`,
      `I see… something's really been pulling you down, hasn't it, ${name}? I'm listening. What's on your heart?`,
      `Hmm… I can feel that things aren't easy right now, ${name}. You're not alone in this. What's been going on?`,
      `${name}, it's okay to feel this way. Really. You don't have to be strong all the time. What's been weighing on you?`,
    ]), source: 'local' };
  }

  // --- ANXIOUS ---
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('worried') || lower.includes('panic') || lower.includes('nervous') || lower.includes('scared') || lower.includes('fear')) {
    return { text: pick([
      `Okay ${name}, let's slow this down together. You don't have to figure everything out right now. What's the main thing worrying you?`,
      `Hey… I can feel the worry in your words, ${name}. You're safe right now. Take a breath with me. What's on your mind?`,
      `${name}… anxiety can make everything feel so urgent, can't it? But right now, in this moment, you're okay. What's been triggering this?`,
      `I hear you, ${name}. When everything feels overwhelming, it helps to focus on just one thing. What's bothering you the most right now?`,
      `Hmm… that sounds unsettling, ${name}. Let's not rush. What's the thought that keeps coming back?`,
    ]), source: 'local' };
  }

  // --- TIRED / EXHAUSTED ---
  if (lower.includes('tired') || lower.includes('exhaust') || lower.includes('drain') || lower.includes('sleep') || lower.includes('fatigue') || lower.includes('burnout') || lower.includes('no energy')) {
    return { text: pick([
      `${name}… you've been carrying a lot, haven't you? Your body is telling you something. What's been taking the most out of you?`,
      `I can hear how tired you are, ${name}. You've been giving so much. When was the last time you did something just for yourself?`,
      `Hmm… it sounds like you're running on empty, ${name}. That's not easy. What's been draining you the most?`,
      `Hey ${name}… exhaustion like this doesn't happen overnight. Something's been building up. Want to talk about what's going on?`,
    ]), source: 'local' };
  }

  // --- ANGRY ---
  if (lower.includes('angry') || lower.includes('frustrat') || lower.includes('furious') || lower.includes('annoyed') || lower.includes('irritat') || lower.includes('mad') || lower.includes('hate')) {
    return { text: pick([
      `I get why that would be frustrating, ${name}. Your feelings make sense. What happened that got you to this point?`,
      `${name}… yeah, that sounds really frustrating. Sometimes things just push us past our limit. What's going on?`,
      `Hmm… I can feel the frustration in your words, ${name}. That's completely valid. Do you want to talk about what triggered it?`,
      `Okay ${name}, I hear you. Anger usually means something important was crossed. What happened?`,
    ]), source: 'local' };
  }

  // --- LONELY ---
  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('isolated') || lower.includes('nobody') || lower.includes('no one cares') || lower.includes('no friends')) {
    return { text: pick([
      `Hey ${name}… I hear you. Feeling alone is one of the hardest things. But right now, right here — you're not alone. I'm with you. What's been going on?`,
      `${name}… that must feel so heavy. I want you to know — I'm here, and I care. When did you start feeling this way?`,
      `I see… loneliness has a way of creeping in quietly, doesn't it, ${name}? You don't have to sit with it alone. Talk to me.`,
    ]), source: 'local' };
  }

  // --- CRISIS ---
  if (lower.includes('die') || lower.includes('suicide') || lower.includes('kill myself') || lower.includes('end it') || lower.includes("can't handle") || lower.includes('cant handle') || lower.includes('give up') || lower.includes('no point')) {
    return {
      text: `${name}… I'm really glad you told me this. Please hear me — you matter, and this moment doesn't define your whole story.\n\nI'm here with you right now. What's making everything feel this heavy? Is there someone you trust — a friend, family member — who you could reach out to?\n\nYou don't have to face this alone.`,
      source: 'local'
    };
  }

  // --- MEDICINE ---
  if (lower.includes('medicine') || lower.includes('forgot') || lower.includes('medication') || lower.includes('pill') || lower.includes('dose') || lower.includes('missed')) {
    return { text: pick([
      `No worries, ${name}, let's sort this out calmly. Which medicine did you miss, and when were you supposed to take it? We'll figure out the next step together.`,
      `Okay ${name}, these things happen. Don't stress about it. Tell me which medication it was and I'll help you figure out what to do next.`,
    ]), source: 'local' };
  }

  // --- HAPPY / POSITIVE ---
  if (lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('wonderful') || lower.includes('amazing') || lower.includes('better') || lower.includes('grateful')) {
    return { text: pick([
      `That's really nice to hear, ${name} 🙂 What made it feel good? I'd love to know more!`,
      `${name}! That energy is contagious. Seriously. What's been making your day so good?`,
      `Ahh, I love hearing that, ${name}. You deserve these moments. What's the best part?`,
      `That's beautiful, ${name}. Hold onto that feeling — you've earned it. What brought this on?`,
    ]), source: 'local' };
  }

  // --- DEFAULT ---
  return { text: pick([
    `Hey ${name}… I'm here. Tell me what's going on — whatever it is, big or small. I'm listening.`,
    `${name}, I'm glad you're here. What's been on your mind? Take your time, no rush.`,
    `Okay ${name}… I'm all ears. What would you like to talk about? I'm here for you.`,
    `Hmm… tell me more, ${name}. What's been happening in your world? I want to understand.`,
    `I'm right here, ${name}. What's on your mind today? Let's talk about it.`,
  ]), source: 'local' };
};

/* Try a list of Gemini models — first one whose quota is available wins.
   Free-tier quota is per-model, so cycling through gives much higher reliability. */
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

const tryGemini = async (prompt) => {
  if (!genAI) return null;
  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text && text.length > 5) {
          logger.info(`[llm] gemini reply via ${modelName}${attempt ? ' (retry)' : ''}`);
          return text;
        }
        break; // empty response — not worth retrying
      } catch (err) {
        const msg = (err && err.message) || '';
        const transient = msg.includes('503') || msg.includes('overloaded') || msg.includes('high demand');
        const quota = msg.includes('429') || msg.includes('quota');
        logger.warn(`[llm] gemini ${modelName} attempt ${attempt + 1} failed: ${msg.split('\n')[0]}`);
        if (quota || !transient) break; // skip to next model
        await new Promise((r) => setTimeout(r, 700));
      }
    }
  }
  return null;
};

/* ══════════════════════════════════════════════
   MAIN ENTRY: HF → Gemini → Local
   ══════════════════════════════════════════════ */
const generateText = async (userText, opts = {}) => {
  if (!userText) return { text: '', source: 'local' };

  const lang = opts.language || 'English';
  const isNonEnglish = lang !== 'English';

  // For non-English (Indian languages): Gemini FIRST (fluent multilingual)
  // For English: HuggingFace first, Gemini fallback
  if (isNonEnglish && genAI) {
    const text = await tryGemini(buildGeminiPrompt(userText, opts));
    if (text) return { text, source: 'gemini' };
  }

  // Try HuggingFace (best for English)
  try {
    const reply = await hf.generateReply(userText, opts);
    if (reply.text && reply.source === 'huggingface') return reply;
  } catch (err) {
    logger.warn('[llm] hf failed:', err.message);
  }

  // Gemini fallback (English path, or non-English when HF surprisingly succeeded above)
  if (genAI) {
    const text = await tryGemini(buildGeminiPrompt(userText, opts));
    if (text) return { text, source: 'gemini' };
  }

  // Context-aware local fallback
  return localFallback(userText, opts);
};

const generateJSON = async (prompt) => {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const r = await model.generateContent(prompt);
    const raw = r.response.text().trim().replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    logger.warn('[llm] gemini json failed:', err.message);
    return null;
  }
};

const isHealthy = async () => ({
  huggingFace: hf.isHealthy?.() || false,
  gemini: !!genAI,
});

module.exports = { generateText, generateJSON, isHealthy };
