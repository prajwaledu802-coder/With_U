import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { syncWithBackend, getMe } from '../services/authService';

const AuthContext = createContext(null);

// Check if current URL looks like an OAuth callback
const isOAuthCallback = () => {
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  return (
    hash.includes('access_token') ||
    hash.includes('error') ||
    params.has('code') ||
    params.has('error')
  );
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  // Stay loading longer if we're coming back from OAuth
  const [loading, setLoading] = useState(true);
  const syncingRef = useRef(false);
  const resolvedRef = useRef(false);

  const refresh = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {}
  };

  const doSync = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const me = await syncWithBackend();
      setUser(me);
    } catch (e) {
      console.warn('Sync failed:', e.message);
    } finally {
      syncingRef.current = false;
    }
  };

  const finishLoading = () => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const oauthInProgress = isOAuthCallback();

    // Safety: force loading=false after timeout
    // Give OAuth callbacks more time (8s) vs normal loads (5s)
    const timeout = setTimeout(() => {
      if (mounted) finishLoading();
    }, oauthInProgress ? 8000 : 5000);

    // For OAuth callbacks, DON'T call getSession immediately
    // Wait for onAuthStateChange to fire with the processed session
    if (!oauthInProgress) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session) await doSync();
        finishLoading();
      }).catch(() => {
        if (mounted) finishLoading();
      });
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return;
      console.log('[WITH_U] Auth event:', _event, !!sess);
      setSession(sess);
      if (sess) {
        await doSync();
        finishLoading();
        // If this was an OAuth callback, redirect to dashboard
        if (oauthInProgress && window.location.pathname !== '/dashboard') {
          window.location.replace('/dashboard');
        }
      } else {
        setUser(null);
        // Only finish loading on SIGNED_OUT if not waiting for OAuth
        if (!oauthInProgress || _event === 'SIGNED_OUT') {
          finishLoading();
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
