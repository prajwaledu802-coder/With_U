import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
});

// Cache token to avoid repeated getSession calls
let cachedToken = null;
let tokenExpiry = 0;

// Listen for auth state changes to update cached token
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.access_token) {
    cachedToken = session.access_token;
    tokenExpiry = (session.expires_at || 0) * 1000;
  } else {
    cachedToken = null;
    tokenExpiry = 0;
  }
});

// Initialize token from existing session
supabase.auth.getSession().then(({ data }) => {
  if (data?.session?.access_token) {
    cachedToken = data.session.access_token;
    tokenExpiry = (data.session.expires_at || 0) * 1000;
  }
}).catch(() => {});

api.interceptors.request.use(async (config) => {
  // Use cached token (fast path, no async lock)
  if (cachedToken && Date.now() < tokenExpiry) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  } else {
    // Fallback: try fresh getSession with a timeout
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000)),
      ]);
      const token = result?.data?.session?.access_token;
      if (token) {
        cachedToken = token;
        tokenExpiry = (result.data.session.expires_at || 0) * 1000;
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.message || err.message;
    return Promise.reject(Object.assign(err, { message: msg }));
  }
);

export default api;
