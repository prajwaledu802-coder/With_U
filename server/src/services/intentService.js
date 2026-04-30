/**
 * Intent + Navigation Service
 *
 * Recognises when a user wants Aira to take an action — open a page,
 * start a tool, log a medication, or reach a contact — and returns a
 * structured directive the frontend can act on.
 *
 * Two-layer strategy:
 *   1) Fast keyword/regex layer (deterministic, zero-cost, multilingual seeds)
 *   2) Hugging Face zero-shot fallback when keywords miss
 */
const hf = require('./huggingFaceService');

const ROUTES = [
  { id: 'dashboard', path: '/app/dashboard', label: 'open the dashboard',
    keywords: ['dashboard', 'home', 'overview', 'main page', 'mood chart'] },
  { id: 'companion', path: '/app/companion', label: 'open the companion / Aira',
    keywords: ['companion', 'aira', 'talk to you', 'chat with you'] },
  { id: 'relief', path: '/app/relief', label: 'go to quick relief tools',
    keywords: ['quick relief', 'breathing', 'breathe', 'calm down', 'relief tools'] },
  { id: 'games', path: '/app/games', label: 'open the game zone',
    keywords: ['game', 'games', 'play', 'distract', 'fun', 'puzzle'] },
  { id: 'resources', path: '/app/resources', label: 'open the resources library',
    keywords: ['resource', 'resources', 'article', 'read', 'guide', 'practice'] },
  { id: 'gentlereach', path: '/app/gentlereach', label: 'open GentleReach',
    keywords: ['gentlereach', 'reach contact', 'reach out', 'tell someone', 'contact someone', 'support'] },
  { id: 'medications', path: '/app/medications', label: 'open my medications',
    keywords: ['medication', 'medicine', 'pill', 'pills', 'tablet', 'dose', 'reminder', 'remind me to take', 'prescription'] },
  { id: 'profile', path: '/app/profile', label: 'open my profile',
    keywords: ['profile', 'my account', 'my info'] },
  { id: 'settings', path: '/app/settings', label: 'open settings',
    keywords: ['settings', 'preferences', 'theme', 'language'] },
  { id: 'features', path: '/app/features', label: 'browse features',
    keywords: ['features', 'what can you do', 'capabilities'] },
];

const TOOL_INTENTS = [
  { id: 'breathing', label: 'start a breathing exercise',
    keywords: ['breathe', 'breathing', 'inhale', 'exhale', 'slow my breath'] },
  { id: 'audio', label: 'play calming audio',
    keywords: ['music', 'rain', 'piano', 'waves', 'calming audio', 'sounds'] },
  { id: 'reset', label: 'do a quick reset',
    keywords: ['reset', 'pause', 'short break', 'recharge'] },
  { id: 'gratitude', label: 'gratitude exercise',
    keywords: ['gratitude', 'grateful', 'thankful'] },
];

const NAV_VERBS = /\b(open|go to|take me to|navigate|show|launch|switch to|bring me to|head to|jump to|visit)\b/i;

const ALL_LABELS = [
  ...ROUTES.map((r) => r.label),
  ...TOOL_INTENTS.map((t) => t.label),
  'just talk',
];

/* ─── Phone number extraction (for smart medication / contacts) ─── */
const extractPhoneNumber = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/[^\d+\s\-()]/g, ' ');
  // Match +CC, with optional spaces/dashes/parens — at least 10 digits total
  const match = cleaned.match(/(\+?\d[\d\s\-()]{8,15}\d)/);
  if (!match) return null;
  const digits = match[1].replace(/[^\d+]/g, '');
  if (digits.replace(/^\+/, '').length < 10) return null;
  return digits;
};

/* ─── Time extraction for medication ─── */
const extractTimes = (text) => {
  if (!text) return [];
  const out = new Set();
  // 8am, 8 am, 08:00, 8:00, 8 pm
  const re = /(\b\d{1,2}):?(\d{2})?\s?(am|pm|AM|PM|a\.m\.|p\.m\.)?\b/g;
  let m;
  while ((m = re.exec(text))) {
    let h = parseInt(m[1], 10);
    const mins = m[2] ? parseInt(m[2], 10) : 0;
    const ap = (m[3] || '').toLowerCase().replace(/\./g, '');
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (h >= 0 && h < 24 && mins >= 0 && mins < 60) {
      out.add(`${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    }
  }
  // Spoken hints
  if (/morning/i.test(text)) out.add('08:00');
  if (/noon|midday|lunch/i.test(text)) out.add('13:00');
  if (/evening/i.test(text)) out.add('19:00');
  if (/night|bedtime/i.test(text)) out.add('22:00');
  return Array.from(out);
};

const extractMedicationName = (text) => {
  if (!text) return null;
  // "take/takes/taking <name>" or "remind me about <name>"
  const m =
    text.match(/\b(?:take|taking|takes|of)\s+([A-Z][A-Za-z0-9\-]{2,}(?:\s+[A-Za-z0-9\-]{2,})?)/) ||
    text.match(/\bmedicine\s+(?:called|named)\s+([A-Za-z0-9\-]+)/i) ||
    text.match(/\bremind me about\s+([A-Za-z0-9\-]+)/i);
  return m ? m[1].trim() : null;
};

/* ─── Keyword scoring ─── */
const scoreKeywords = (text, keywords) => {
  const lower = text.toLowerCase();
  let score = 0;
  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) score += k.split(' ').length;
  }
  return score;
};

const matchByKeywords = (text) => {
  const lower = text.toLowerCase();
  const verbBoost = NAV_VERBS.test(text) ? 0.5 : 0;

  let best = null;

  for (const r of ROUTES) {
    const s = scoreKeywords(lower, r.keywords);
    if (s > 0) {
      const total = s + verbBoost;
      if (!best || total > best.score) {
        best = { kind: 'navigate', target: r.id, path: r.path, score: total };
      }
    }
  }

  for (const t of TOOL_INTENTS) {
    const s = scoreKeywords(lower, t.keywords);
    if (s > 0) {
      const total = s + 0.2;
      if (!best || total > best.score) {
        best = { kind: 'tool', target: t.id, score: total };
      }
    }
  }

  return best;
};

/* ─── Public: detect intent ─── */
const detectIntent = async (text, { useHF = true } = {}) => {
  if (!text || text.trim().length < 2) return null;

  const phone = extractPhoneNumber(text);
  const times = extractTimes(text);
  const medName = extractMedicationName(text);

  // Smart medication detection
  const isMedication =
    /\b(medic|medicine|pill|tablet|dose|prescription|remind me to take)\b/i.test(text);
  if (isMedication) {
    return {
      kind: 'medication',
      action: phone || medName ? 'create' : 'open',
      path: '/app/medications',
      extracted: {
        name: medName,
        times,
        phone,
        rawText: text,
      },
      confidence: 0.85,
      source: 'keywords',
    };
  }

  const kw = matchByKeywords(text);
  if (kw && kw.score >= 1) {
    return {
      kind: kw.kind,
      target: kw.target,
      path: kw.path,
      confidence: Math.min(1, kw.score / 3),
      source: 'keywords',
      extracted: { phone, times },
    };
  }

  if (!useHF) return null;

  // HF zero-shot fallback
  const result = await hf.classifyIntent(text, ALL_LABELS);
  if (!result || result.score < 0.45) return null;

  const route = ROUTES.find((r) => r.label === result.label);
  if (route) {
    return {
      kind: 'navigate',
      target: route.id,
      path: route.path,
      confidence: result.score,
      source: 'huggingface',
      extracted: { phone, times },
    };
  }

  const tool = TOOL_INTENTS.find((t) => t.label === result.label);
  if (tool) {
    return {
      kind: 'tool',
      target: tool.id,
      confidence: result.score,
      source: 'huggingface',
      extracted: { phone, times },
    };
  }

  return null;
};

const listRoutes = () => ROUTES.map(({ id, path, label }) => ({ id, path, label }));

module.exports = {
  detectIntent,
  listRoutes,
  extractPhoneNumber,
  extractTimes,
  extractMedicationName,
  ROUTES,
  TOOL_INTENTS,
};
