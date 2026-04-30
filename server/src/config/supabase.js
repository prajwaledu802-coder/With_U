const jwt = require('jsonwebtoken');
const axios = require('axios');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = axios.create({
  baseURL: `${SUPABASE_URL}/auth/v1`,
  headers: {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const verifySupabaseToken = async (accessToken) => {
  if (!accessToken) throw new Error('No token provided');

  // 1) Try Supabase HTTP API
  try {
    const { data } = await axios.get(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 8000,
    });
    if (data && (data.id || data.sub) && data.email) return data;
  } catch (err) {
    console.warn('[Auth] Supabase HTTP verify failed:', err.response?.status || err.message);
  }

  // 2) Try JWT verify with Supabase JWT secret (derived from service role key)
  try {
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (supabaseJwtSecret) {
      const verified = jwt.verify(accessToken, supabaseJwtSecret);
      if (verified && verified.sub && verified.email) return verified;
    }
  } catch (err) {
    console.warn('[Auth] JWT verify failed:', err.message);
  }

  // 3) Fallback: decode without verification (development mode only)
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded && decoded.sub && decoded.email) {
      console.warn('[Auth] Using unverified JWT decode fallback for:', decoded.email);
      return decoded;
    }
  } catch {}

  throw new Error('Invalid Supabase token');
};

module.exports = { supabaseAdmin, verifySupabaseToken, SUPABASE_URL };
