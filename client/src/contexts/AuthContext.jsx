import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { syncWithBackend, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncingRef = useRef(false);

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

  useEffect(() => {
    let mounted = true;

    // Safety: force loading=false after 5s to prevent infinite spinner
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) await doSync();
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess) {
        await doSync();
      } else {
        setUser(null);
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
