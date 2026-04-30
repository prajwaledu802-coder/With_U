/**
 * In-memory Redis-style cache.
 * If REDIS_URL is set in env, you can swap this implementation for ioredis.
 * The simple Map-backed cache lets the rest of the app code stay identical.
 */
const env = require('./env');

const store = new Map();

const cache = {
  enabled: !!env.redisUrl,
  async get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key, value, ttlSeconds = 300) {
    store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  },
  async del(key) {
    store.delete(key);
  },
  async incr(key, ttlSeconds = 60) {
    const current = (await this.get(key)) || 0;
    const next = Number(current) + 1;
    await this.set(key, next, ttlSeconds);
    return next;
  },
};

module.exports = cache;
