/**
 * Conversation memory engine.
 * Stores recent turns, tags, and stress trajectory in a per-user rolling window.
 * Uses the in-process cache (./config/redis) so it works without an external store.
 */
const cache = require('../config/redis');

const MAX_TURNS = 12;
const TTL = 60 * 60 * 6; // 6 hours

const keyFor = (userId) => `mem:user:${userId}`;

const remember = async (userId, turn) => {
  if (!userId || !turn) return;
  const k = keyFor(userId);
  const existing = (await cache.get(k)) || { turns: [], tags: [], stressTrace: [] };
  existing.turns.push({
    role: turn.role,
    text: turn.text,
    ts: turn.ts || Date.now(),
    stressScore: turn.stressScore ?? null,
    emotion: turn.emotion ?? null,
  });
  if (existing.turns.length > MAX_TURNS) existing.turns = existing.turns.slice(-MAX_TURNS);
  if (Array.isArray(turn.tags)) {
    existing.tags = Array.from(new Set([...existing.tags, ...turn.tags])).slice(-12);
  }
  if (typeof turn.stressScore === 'number') {
    existing.stressTrace.push({ score: turn.stressScore, ts: Date.now() });
    if (existing.stressTrace.length > MAX_TURNS) existing.stressTrace = existing.stressTrace.slice(-MAX_TURNS);
  }
  await cache.set(k, existing, TTL);
};

const recall = async (userId) => {
  if (!userId) return { turns: [], tags: [], stressTrace: [] };
  return (await cache.get(keyFor(userId))) || { turns: [], tags: [], stressTrace: [] };
};

const forget = async (userId) => cache.del(keyFor(userId));

const recentHistoryForLLM = async (userId, n = 6) => {
  const m = await recall(userId);
  return (m.turns || []).slice(-n).map((t) => ({ role: t.role, text: t.text }));
};

const stressDelta = async (userId) => {
  const m = await recall(userId);
  if (!m.stressTrace || m.stressTrace.length < 2) return 0;
  const first = m.stressTrace[0].score;
  const last = m.stressTrace[m.stressTrace.length - 1].score;
  return last - first;
};

module.exports = { remember, recall, forget, recentHistoryForLLM, stressDelta };
