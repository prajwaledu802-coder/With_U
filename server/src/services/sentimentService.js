const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

const STRESS_LEXICON = {
  exhaustion: ['tired', 'exhausted', 'drained', 'fatigue', 'sleepless', 'no sleep', 'burned out', 'thaka', 'thak'],
  overwhelm: ['overwhelmed', 'too much', 'cant cope', "can't cope", 'breaking', 'pressure', 'load', 'bojh'],
  isolation: ['alone', 'lonely', 'no one', 'nobody', 'isolated', 'akela'],
  worry: ['worried', 'anxious', 'fear', 'scared', 'panic', 'nervous', 'chinta', 'pareshan'],
};

/* ── Negation detection ── */
const NEGATORS = ['not', "n't", 'dont', "don't", "didn't", "didnt", "can't", "cant", "cannot", 'never', 'no', 'barely', 'hardly', "isn't", "isnt", "wasn't", "wasnt", "won't", "wont", "wouldn't", "wouldnt", "aren't", "arent"];
const POSITIVE_WORDS = ['good', 'great', 'fine', 'okay', 'ok', 'happy', 'well', 'better', 'nice', 'calm', 'relaxed', 'peaceful', 'wonderful', 'amazing', 'excellent'];

const hasNegatedPositive = (text) => {
  const lower = (text || '').toLowerCase();
  const words = lower.replace(/[^a-z' ]/g, ' ').split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const isNegator = NEGATORS.some((n) => words[i] === n || words[i].endsWith("n't"));
    if (isNegator) {
      // Check the next 3 words for a positive word
      for (let j = i + 1; j <= Math.min(i + 3, words.length - 1); j++) {
        if (POSITIVE_WORDS.includes(words[j])) return true;
      }
    }
  }
  return false;
};

const labelFor = (score) => {
  if (score <= -3) return 'very_low';
  if (score < 0) return 'low';
  if (score === 0) return 'neutral';
  if (score < 3) return 'positive';
  return 'very_positive';
};

const detectStressIndicators = (text) => {
  const lower = (text || '').toLowerCase();
  const indicators = { exhaustion: 0, overwhelm: 0, isolation: 0, worry: 0 };
  for (const [key, words] of Object.entries(STRESS_LEXICON)) {
    for (const w of words) {
      if (lower.includes(w)) indicators[key] += 1;
    }
  }
  return indicators;
};

const extractKeywords = (text) => {
  const stop = new Set([
    'the','a','an','and','or','but','i','am','is','are','was','were','to','of','in','on','for','my','me','it','this','that','have','has','had','be','been','do','does','did','so','very','just','really','today','feel','feeling',
  ]);
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w))
    .slice(0, 10);
};

const analyzeText = (text) => {
  const result = sentimentAnalyzer.analyze(text || '');
  const indicators = detectStressIndicators(text);
  const stressBoost =
    indicators.exhaustion + indicators.overwhelm + indicators.isolation + indicators.worry;

  let adjustedScore = result.score - stressBoost;

  // CRITICAL: If user said "not good", "not happy", etc. — force negative
  if (hasNegatedPositive(text)) {
    adjustedScore = Math.min(adjustedScore, -2);
  }

  return {
    score: adjustedScore,
    rawScore: result.score,
    comparative: result.comparative,
    label: labelFor(adjustedScore),
    keywords: extractKeywords(text),
    stressIndicators: indicators,
    positiveWords: result.positive,
    negativeWords: result.negative,
    negatedPositive: hasNegatedPositive(text),
  };
};

const computeStressLevel = (logs) => {
  if (!logs || !logs.length) return 0;
  let total = 0;
  for (const log of logs) {
    const s = log.stressIndicators || {};
    total += (s.exhaustion || 0) + (s.overwhelm || 0) + (s.isolation || 0) + (s.worry || 0);
    if ((log.sentimentScore ?? 0) < 0) total += Math.abs(log.sentimentScore);
  }
  const raw = (total / logs.length) * 12;
  return Math.min(100, Math.round(raw));
};

const detectStressTrend = (sentiments) => {
  if (!sentiments || sentiments.length < 3) return { trend: 'stable', worsening: false };
  const recent = sentiments.slice(0, 3);
  const older = sentiments.slice(3, 6);
  if (!older.length) return { trend: 'stable', worsening: false };
  const recentAvg = recent.reduce((a, b) => a + (b.stressLevel || 0), 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + (b.stressLevel || 0), 0) / older.length;
  const delta = recentAvg - olderAvg;
  if (delta > 15) return { trend: 'worsening', worsening: true, delta };
  if (delta < -15) return { trend: 'improving', worsening: false, delta };
  return { trend: 'stable', worsening: false, delta };
};

const buildGentleResponse = (analysis, language = 'en') => {
  const { label, stressIndicators } = analysis;
  const top = Object.entries(stressIndicators).sort((a, b) => b[1] - a[1])[0];
  const dominant = top && top[1] > 0 ? top[0] : null;

  const en = {
    very_low: "Hey… that sounds really heavy. I can feel it. You're still here though, and that takes real strength. What's been weighing on you the most?",
    low: "Hmm… some days just hit different, don't they? You don't have to carry it alone. What's been on your mind?",
    neutral: "Hey, I'm here. How are you really doing? Not the polite answer — the real one. I'm listening.",
    positive: "That's really nice to hear 🙂 What made it feel good? I'd love to know more.",
    very_positive: "That energy is beautiful! You deserve these moments. What's been making things feel so good?",
  };

  const hi = {
    very_low: 'अरे… आज बहुत भारी लग रहा है, मुझे पता है। लेकिन आप अभी भी यहाँ हैं — यह बड़ी बात है। क्या हो रहा है? बताइए।',
    low: 'हम्म… कुछ दिन बस मुश्किल होते हैं। आपको अकेले नहीं सहना है। क्या मन में चल रहा है?',
    neutral: 'मैं यहाँ हूँ। सच में कैसा महसूस हो रहा है? बताइए — मैं सुन रहा हूँ।',
    positive: 'यह सुनकर अच्छा लगा 🙂 क्या बात है जो आज अच्छी लगी?',
    very_positive: 'वाह, यह ऊर्जा सुंदर है! आप इसके हकदार हैं। क्या खास रहा आज?',
  };

  const map = language === 'hi' ? hi : en;
  let message = map[label] || map.neutral;

  const nudgeMapEn = {
    exhaustion: ' Maybe a small pause — even five minutes — would feel kind today.',
    overwhelm: ' One thing at a time is enough. The rest can wait.',
    isolation: ' A quick message to someone who knows you might lighten this a little.',
    worry: " The mind is loud right now. A slow breath, then another — that's plenty.",
  };
  const nudgeMapHi = {
    exhaustion: ' शायद थोड़ा रुकना — पाँच मिनट भी — आज अच्छा लगेगा।',
    overwhelm: ' एक बार में एक काम काफी है। बाकी रुक सकता है।',
    isolation: ' किसी अपने को एक छोटा संदेश भेजना थोड़ा हल्का कर सकता है।',
    worry: ' अभी मन शोर में है। एक धीमी साँस, फिर एक और — इतना ही बहुत है।',
  };

  if (dominant) {
    message += (language === 'hi' ? nudgeMapHi : nudgeMapEn)[dominant] || '';
  }

  return message.trim();
};

const buildSuggestions = (analysis, language = 'en') => {
  const { stressIndicators } = analysis;
  const en = [
    { id: 'rest', icon: 'moon', title: 'Rest a little', body: 'Step away for ten minutes. Just sit.' },
    { id: 'hydrate', icon: 'droplet', title: 'A glass of water', body: 'Small acts count. So does this one.' },
    { id: 'delegate', icon: 'users', title: 'Ask for help', body: 'You don\'t have to hold it all today.' },
    { id: 'breathe', icon: 'wind', title: 'A slow breath', body: 'Four counts in. Six counts out.' },
    { id: 'walk', icon: 'sun', title: 'A short walk', body: 'Even to the door and back.' },
  ];
  const hi = [
    { id: 'rest', icon: 'moon', title: 'थोड़ा आराम', body: 'दस मिनट के लिए रुक जाइए। बस बैठिए।' },
    { id: 'hydrate', icon: 'droplet', title: 'एक गिलास पानी', body: 'छोटी चीज़ें भी मायने रखती हैं।' },
    { id: 'delegate', icon: 'users', title: 'मदद माँगिए', body: 'सब कुछ आज ही नहीं करना।' },
    { id: 'breathe', icon: 'wind', title: 'धीमी साँस', body: 'चार गिनकर अंदर। छह गिनकर बाहर।' },
    { id: 'walk', icon: 'sun', title: 'छोटी सैर', body: 'दरवाज़े तक भी काफी है।' },
  ];
  const list = language === 'hi' ? hi : en;
  const sorted = [...list];
  if (stressIndicators?.exhaustion) sorted.sort((a) => (a.id === 'rest' ? -1 : 0));
  else if (stressIndicators?.overwhelm) sorted.sort((a) => (a.id === 'delegate' ? -1 : 0));
  else if (stressIndicators?.worry) sorted.sort((a) => (a.id === 'breathe' ? -1 : 0));
  return sorted.slice(0, 3);
};

module.exports = {
  analyzeText,
  computeStressLevel,
  detectStressTrend,
  buildGentleResponse,
  buildSuggestions,
  labelFor,
};
