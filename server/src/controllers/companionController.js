const { GoogleGenerativeAI } = require('@google/generative-ai');
const hf = require('../services/huggingFaceService');
const intentService = require('../services/intentService');
const Medication = require('../models/Medication');
const { getCanonicalMobile } = require('../services/medicationService');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/* ═══ Local fallback emotion analysis (multilingual) ═══ */
const STRESS_WORDS = {
  high: [
    // English
    'overwhelmed', 'exhausted', 'panic', 'cant cope', "can't cope", 'breaking', 'crying', 'hopeless', 'desperate', 'suicidal', 'dying', 'hate myself',
    'kill myself', 'end my life', 'want to die', 'no reason to live', 'self-harm', 'self harm', 'end it all', 'better off dead', 'nothing left', 'give up on life', 'worthless',
    // Hindi (Devanagari)
    'घबरा', 'टूट', 'बर्दाश्त नहीं', 'मरना', 'खत्म करना', 'रो रही', 'रो रहा', 'निराश', 'बेबस', 'आत्महत्या', 'जीना नहीं', 'मर जाना', 'ज़िंदगी खत्म',
    // Kannada
    'ಭಯ', 'ಅಳು', 'ನಿರಾಶ', 'ಸಹಿಸ',
    // Tamil
    'பயம்', 'அழ', 'நம்பிக்கை இல்', 'தாங்க முடிய',
    // Telugu
    'భయం', 'ఏడ్పు', 'నిరాశ', 'తట్టుకోలేక',
  ],
  moderate: [
    // English
    'stressed', 'anxious', 'worried', 'tired', 'drained', 'sleepless', 'burnout', 'burden', 'pressure', 'struggling', 'frustrated', 'angry', 'upset', 'lonely', 'isolated',
    // Hindi
    'तनाव', 'चिंता', 'परेशान', 'थक', 'थकी', 'थका', 'अकेला', 'अकेली', 'दुखी', 'गुस्सा', 'नींद नहीं', 'दबाव',
    // Kannada
    'ಒತ್ತಡ', 'ಆತಂಕ', 'ಚಿಂತೆ', 'ದಣಿ', 'ಒಂಟಿ', 'ದುಃಖ',
    // Tamil
    'டென்ஷன்', 'கவலை', 'சோர்வ', 'தனிமை', 'வருத்த', 'கோபம்',
    // Telugu
    'ఒత్తిడి', 'ఆందోళన', 'అలసట', 'ఒంటరి', 'బాధ', 'కోపం',
    // Bengali
    'চিন্তা', 'ক্লান্ত', 'একা', 'দুঃখ',
    // Marathi
    'तणाव', 'काळजी', 'थक',
  ],
  mild: [
    'busy', 'tense', 'uneasy', 'restless', 'uncomfortable', 'nervous', 'difficult', 'hard', 'tough',
    // Hindi
    'मुश्किल', 'कठिन', 'बेचैन',
    // Kannada/Tamil/Telugu basics
    'ಕಷ್ಟ', 'கடின', 'కష్టం',
  ],
  calm: [
    'fine', 'good', 'great', 'happy', 'relaxed', 'calm', 'peaceful', 'okay', 'well', 'better', 'grateful', 'thankful',
    // Hindi
    'अच्छा', 'अच्छी', 'खुश', 'ठीक', 'शांत', 'बेहतर', 'धन्यवाद',
    // Kannada
    'ಚೆನ್ನಾಗಿ', 'ಸಂತೋಷ', 'ಶಾಂತ',
    // Tamil
    'நல்ல', 'மகிழ்ச்சி', 'சந்தோஷ',
    // Telugu
    'బాగున్నా', 'సంతోషం', 'ప్రశాంత',
  ],
};

const TAG_WORDS = {
  anxiety: ['anxious', 'panic', 'nervous', 'worried', 'fear', 'scared'],
  fatigue: ['tired', 'exhausted', 'drained', 'fatigue', 'sleepy', 'burned out', 'burnout'],
  overload: ['overwhelmed', 'too much', 'pressure', 'load', 'burden', 'cant cope', "can't cope"],
  negative_thinking: ['hopeless', 'worthless', 'hate myself', 'nothing matters', 'empty', 'pointless'],
};

const QUIZ_PROMPT = 'Want a quick check-in?';
const SCREEN_TIME_PROMPT = 'You have been active for a while. Want a short break?';
const LATE_NIGHT_SOFTENER = 'It is late. We can keep this gentle.';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
  ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi',
  ur: 'Urdu', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
};

const classifyStressLevel = (score) => {
  if (score <= 20) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 80) return 'high';
  return 'critical';
};

const getAnimation = (stressScore) => {
  if (stressScore <= 20) return 'nod';
  if (stressScore <= 50) return 'speaking';
  if (stressScore <= 80) return 'calming';
  return 'breathing';
};

const computeWeightedStress = (signals) => {
  const sentiment = clamp(signals.sentiment_score || 0, 0, 100);
  const typing = clamp(signals.typing_instability || 0, 0, 100);
  const session = clamp(signals.session_duration_factor || 0, 0, 100);
  const lateNight = clamp(signals.late_night_factor || 0, 0, 100);
  const interaction = clamp(signals.interaction_drop || 0, 0, 100);
  // Sentiment from the user's TEXT is the dominant driver — what they say outweighs
  // ambient signals like typing patterns or late-night usage. The other signals
  // act as small supporting context.
  const weighted = sentiment * 0.7 + typing * 0.1 + session * 0.08 + lateNight * 0.07 + interaction * 0.05;
  // Floor: if the text alone is clearly distressed, never let context dilute it below that level.
  return Math.round(clamp(Math.max(weighted, sentiment * 0.85), 0, 100));
};

const deriveSignalDefaults = (signals = {}) => {
  const d = { ...signals };
  if (d.session_duration_factor == null) {
    const mins = Number(d.session_duration || 0);
    d.session_duration_factor = mins >= 120 ? 80 : mins >= 60 ? 60 : 0;
  }
  if (d.late_night_factor == null) d.late_night_factor = d.time_of_day === 'late_night' ? 70 : 0;
  if (d.typing_instability == null) {
    if (d.typing_pattern === 'erratic') d.typing_instability = 70;
    else if (d.typing_pattern === 'paused') d.typing_instability = 55;
    else d.typing_instability = 10;
  }
  if (d.interaction_drop == null) {
    const gap = Number(d.inactivity_gaps || 0);
    d.interaction_drop = gap >= 300 ? 80 : gap >= 120 ? 60 : 0;
  }
  return d;
};

const detectTags = (text) => {
  const lower = (text || '').toLowerCase();
  const tags = new Set();
  Object.entries(TAG_WORDS).forEach(([tag, words]) => {
    if (words.some((w) => lower.includes(w))) tags.add(tag);
  });
  return Array.from(tags);
};

/* ── Negation-aware local analysis ── */
const NEGATORS_SET = new Set(['not', "n't", 'dont', "don't", "didn't", "didnt", "can't", "cant", "cannot", 'never', 'no', 'barely', 'hardly', "isn't", "isnt", "wasn't", "wasnt", "won't", "wont"]);
const POS_WORDS_SET = new Set(['good', 'great', 'fine', 'okay', 'ok', 'happy', 'well', 'better', 'nice', 'calm', 'relaxed', 'peaceful', 'wonderful', 'amazing']);

const hasNegatedPositive = (text) => {
  const words = (text || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (NEGATORS_SET.has(words[i]) || words[i].endsWith("n't")) {
      for (let j = i + 1; j <= Math.min(i + 3, words.length - 1); j++) {
        if (POS_WORDS_SET.has(words[j])) return true;
      }
    }
  }
  return false;
};

const localAnalyze = (text) => {
  let score = 20;
  let emotion = 'neutral';
  let confidence = 0.4;

  // STEP 1: Check for negated positive ("not good", "don't feel happy") → treat as NEGATIVE
  if (hasNegatedPositive(text)) {
    score = 55;
    emotion = 'stressed';
    confidence = 0.65;
    return {
      sentimentScore: clamp(Math.round(score), 0, 100),
      emotion,
      dominantFeeling: emotion,
      tags: detectTags(text),
      confidence,
      negatedPositive: true,
    };
  }

  // For native scripts (Hindi, Kannada, Tamil, etc.) we need to match against the
  // ORIGINAL text since toLowerCase() is a no-op for those scripts but case-insensitive
  // match still works on the raw characters.
  const haystack = (text || '').toLowerCase() + ' ' + (text || '');

  // STEP 2: Check for explicitly negative words (highest priority first)
  for (const w of STRESS_WORDS.high) {
    if (haystack.includes(w)) { score = Math.max(score, 80); emotion = 'overwhelmed'; confidence = 0.85; }
  }
  if (confidence < 0.8) for (const w of STRESS_WORDS.moderate) {
    if (haystack.includes(w)) { score = Math.max(score, 55); emotion = 'stressed'; confidence = 0.75; }
  }
  if (confidence < 0.7) for (const w of STRESS_WORDS.mild) {
    if (haystack.includes(w)) { score = Math.max(score, 35); emotion = 'tense'; confidence = 0.65; }
  }

  // STEP 3: Only classify as calm if NO negation detected and no stress words matched
  if (confidence < 0.6) for (const w of STRESS_WORDS.calm) {
    if (haystack.includes(w)) { score = 12; emotion = 'calm'; confidence = 0.6; }
  }

  return {
    sentimentScore: clamp(Math.round(score), 0, 100),
    emotion,
    dominantFeeling: emotion,
    tags: detectTags(text),
    confidence,
  };
};

const selectToolFromTags = (tags = []) => {
  if (tags.includes('anxiety')) return 'breathing';
  if (tags.includes('fatigue')) return 'audio';
  if (tags.includes('overload')) return 'reset';
  if (tags.includes('negative_thinking')) return 'gratitude';
  return null;
};

const decideAction = (stressLevel, tags, options) => {
  if (options.forceQuiz) return 'quiz';
  if (options.forceScreenTimeBreak) return 'reset';
  if (stressLevel === 'critical') return 'external_help';
  if (stressLevel === 'high') return selectToolFromTags(tags) || 'breathing';
  if (stressLevel === 'moderate') return selectToolFromTags(tags) || 'audio';
  return 'none';
};

/* ═══════════════════════════════════════════
   GEMINI EMOTION ANALYSIS — multi-model fallback
   ═══════════════════════════════════════════ */
const GEMINI_EMOTION_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];

const geminiAnalyze = async (text, langName) => {
  if (!genAI) throw new Error('gemini disabled');
  const langInstr = langName && langName !== 'English'
    ? `\nIMPORTANT: The user is writing in ${langName}. Read and reason about their text in ${langName} — do not translate it.`
    : '';
  const prompt = `You are an emotional-stress analyst. Score this user message on the 0-100 stress scale.${langInstr}
User text: "${text}"

SCORING GUIDE:
- 0-15: clearly calm / positive ("I'm feeling great", "all good")
- 16-35: mild tension / neutral with slight worry
- 36-55: clearly stressed, anxious, frustrated, tired
- 56-80: overwhelmed, panic, hopelessness, can't cope
- 81-100: critical / crisis (suicidal ideation, complete breakdown)
Watch for negation: "not good" / "not feeling okay" → NEGATIVE feeling, score 50-70.

Respond ONLY with a JSON object (no markdown, no code fences):
{"emotion":"<calm|neutral|tired|stressed|anxious|overwhelmed|sad|happy>","sentimentScore":<0-100>,"dominantFeeling":"<1-2 words>","tags":["anxiety","fatigue","overload","negative_thinking"],"confidence":<0-1>}`;

  let lastErr = null;
  for (const modelName of GEMINI_EMOTION_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(raw);
      return {
        sentimentScore: clamp(Number(parsed.sentimentScore || 0), 0, 100),
        emotion: parsed.emotion || 'neutral',
        dominantFeeling: parsed.dominantFeeling || parsed.emotion || 'neutral',
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean) : [],
        confidence: clamp(Number(parsed.confidence || 0.7), 0, 1),
      };
    } catch (err) {
      lastErr = err;
      const msg = (err && err.message) || '';
      const quota = msg.includes('429') || msg.includes('quota');
      if (quota) continue; // try next model
      // for transient or parse errors, try the next model too
    }
  }
  throw lastErr || new Error('all gemini emotion models failed');
};

/* ═══════════════════════════════════════════
   TEXT DECISION ENGINE — HF primary, Gemini fallback, local last
   ═══════════════════════════════════════════ */
exports.analyzeText = async (req, res) => {
  try {
    const { text, signals = {}, previous_state = {}, quiz, history = [], language = 'en' } = req.body || {};
    const trimmed = (text || '').trim();
    const hasText = trimmed.length >= 2;
    const derivedSignals = deriveSignalDefaults(signals);
    const langName = LANG_NAMES[language] || LANG_NAMES.en;

    /* ── 1) Emotion + Tags ── */
    let analysis = null;
    let aiSource = 'local';

    if (hasText) {
      const hfResult = await hf.classifyEmotion(trimmed);
      if (hfResult.source === 'huggingface') {
        analysis = {
          sentimentScore: hfResult.stressScore,
          emotion: hfResult.emotion,
          dominantFeeling: hfResult.emotion,
          tags: detectTags(trimmed),
          confidence: hfResult.score,
        };
        aiSource = 'huggingface';
      }
    }

    if (!analysis && hasText && genAI) {
      try { analysis = await geminiAnalyze(trimmed, langName); aiSource = 'gemini'; } catch {}
    }
    if (!analysis) { analysis = localAnalyze(trimmed); aiSource = 'local'; }

    let sentimentScore = analysis.sentimentScore || 0;
    if (quiz && Array.isArray(quiz.answers) && quiz.answers.length) {
      const quizAvg = quiz.answers.reduce((a, b) => a + Number(b || 0), 0) / quiz.answers.length;
      const quizScore = clamp(Math.round((quizAvg / 3) * 100), 0, 100);
      sentimentScore = hasText ? Math.round((sentimentScore + quizScore) / 2) : quizScore;
    }

    const scoredSignals = { ...derivedSignals, sentiment_score: sentimentScore };
    let stressScore = computeWeightedStress(scoredSignals);
    
    // Crisis keyword override — force high stress if crisis words detected
    const CRISIS_WORDS = ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'no reason to live', 'self-harm', 'self harm', 'end it all', 'better off dead', 'nothing left', 'give up on life', 'आत्महत्या', 'जीना नहीं', 'मर जाना', 'ಆತ್ಮಹತ್ಯೆ', 'தற்கொலை', 'ఆత్మహత్య'];
    const lowerTrimmed = (trimmed || '').toLowerCase();
    const isCrisis = CRISIS_WORDS.some(w => lowerTrimmed.includes(w));
    if (isCrisis) {
      stressScore = Math.max(stressScore, 95);
    }
    
    const stressLevel = classifyStressLevel(stressScore);

    const lateNight = Number(scoredSignals.late_night_factor || 0) >= 40;
    const screenTimeBreak =
      !previous_state?.screenTimePrompted && Number(scoredSignals.session_duration_factor || 0) >= 60;
    const quizPrompt =
      !previous_state?.quizOffered && (stressLevel === 'moderate' || stressLevel === 'high');
    const lowConfidence = Number(analysis.confidence || 0) < 0.2;

    const action = lowConfidence
      ? 'none'
      : decideAction(stressLevel, analysis.tags, {
          forceQuiz: quizPrompt,
          forceScreenTimeBreak: screenTimeBreak,
        });

    /* ── 2) Generate companion reply via LLM (HF → Gemini → local) ── */
    const userName = req.user?.name?.split(' ')[0] || (req.body?.userName || 'friend');
    let replyText = '';
    let replySource = 'local';

    if (quizPrompt) replyText = QUIZ_PROMPT;
    else if (screenTimeBreak) replyText = SCREEN_TIME_PROMPT;
    else if (lowConfidence) replyText = `${userName}, I'm right here. Tell me what's on your mind — even one word is enough to start.`;
    else if (hasText) {
      const llm = require('../ai/llm');
      const reply = await llm.generateText(trimmed, {
        userName,
        emotion: analysis.emotion,
        history,
        language: langName,
      });
      replyText = reply.text;
      replySource = reply.source;
    } else {
      replyText = `${userName}, I'm right here with you. How are you really feeling right now? Tell me what's going on — I want to help.`;
    }

    if (lateNight && !replyText.includes('late')) replyText += ` ${LATE_NIGHT_SOFTENER}`;

    /* ── 3) Detect navigation / tool / medication intent ── */
    let intent = null;
    if (hasText) {
      try { intent = await intentService.detectIntent(trimmed, { useHF: !lowConfidence }); }
      catch { intent = null; }
    }

    /* ── 4) Pull canonical mobile (smart medication source) ── */
    let canonicalMobile = null;
    if (req.user) {
      try { canonicalMobile = await getCanonicalMobile(req.user._id); } catch {}
    }

    /* ── 5) UI directive (modal or navigation) ── */
    const openModal = action === 'quiz';
    let uiType = openModal ? 'quiz' : action;
    let navigateTo = null;

    if (intent) {
      if (intent.kind === 'navigate' && intent.path) navigateTo = intent.path;
      else if (intent.kind === 'tool' && intent.target) uiType = intent.target;
      else if (intent.kind === 'medication') {
        navigateTo = intent.path;
      }
    }

    return res.json({
      message: replyText,
      animation: getAnimation(stressScore),
      stress_score: stressScore,
      stress_level: stressLevel,
      emotion: analysis.emotion,
      tags: analysis.tags,
      confidence: analysis.confidence,
      action: isCrisis ? 'external_help' : action,
      crisis: isCrisis,
      ai: { emotion: aiSource, reply: replySource },
      ui: {
        openModal: openModal || (uiType !== 'none' && uiType !== action && intent?.kind === 'tool'),
        type: uiType || 'none',
        navigateTo,
      },
      intent,
      canonicalMobile,
    });
  } catch (err) {
    console.error('Companion decision error:', err.message);
    return res.json({
      message: 'I am here with you.',
      animation: 'idle',
      stress_score: 15,
      stress_level: 'low',
      emotion: 'neutral',
      tags: [],
      action: 'none',
      ai: { emotion: 'error', reply: 'error' },
      ui: { openModal: false, type: 'none', navigateTo: null },
      intent: null,
      canonicalMobile: null,
    });
  }
};

/* ═══════════════════════════════════════════
   NAVIGATION-ONLY ENDPOINT
   ═══════════════════════════════════════════ */
exports.navigate = async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.json({ intent: null, routes: intentService.listRoutes() });
  try {
    const intent = await intentService.detectIntent(text, { useHF: true });
    res.json({ intent, routes: intentService.listRoutes() });
  } catch (err) {
    res.json({ intent: null, routes: intentService.listRoutes(), error: err.message });
  }
};

/* ═══════════════════════════════════════════
   CAMERA FRAME ANALYSIS (Gemini Vision — kept)
   ═══════════════════════════════════════════ */
exports.analyzeFrame = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || !genAI) return res.json({ stressScore: 0, emotion: 'neutral' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
    const prompt = `Analyze facial expression for emotion. JSON only: {"emotion":"<calm|neutral|tired|stressed|happy>","stressScore":<0-100>,"confidence":<0-1>}.`;
    const result = await model.generateContent([prompt, imagePart]);
    const raw = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(raw);
    res.json({
      stressScore: Math.min(100, Math.max(0, parsed.stressScore || 0)),
      emotion: parsed.emotion || 'neutral',
      confidence: parsed.confidence || 0.5,
    });
  } catch (err) {
    res.json({ stressScore: 20, emotion: 'neutral', confidence: 0 });
  }
};

/* ═══════════════════════════════════════════
   TTS proxy (kept)
   ═══════════════════════════════════════════ */
exports.speak = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'No text provided' });
    if (process.env.ENABLE_REAL_TTS !== 'true') return res.json({ audio: null, mock: true });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
          voice_settings: { stability: 0.75, similarity_boost: 0.7, style: 0.3 },
        }),
      }
    );
    if (!response.ok) throw new Error(`ElevenLabs: ${response.status}`);
    const buf = await response.arrayBuffer();
    res.json({ audio: `data:audio/mpeg;base64,${Buffer.from(buf).toString('base64')}`, mock: false });
  } catch (err) {
    res.json({ audio: null, mock: true });
  }
};
