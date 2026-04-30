import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

/**
 * Handles Supabase OAuth callback (Google sign-in).
 * Supabase redirects here with ?code=xxx or #access_token=xxx.
 * This page processes the auth tokens and redirects to /dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase auto-detects URL tokens via detectSessionInUrl: true
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          navigate('/dashboard', { replace: true });
        } else {
          // Wait a moment for onAuthStateChange to process
          const timeout = setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);

          const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              clearTimeout(timeout);
              navigate('/dashboard', { replace: true });
            }
          });

          return () => {
            clearTimeout(timeout);
            sub.subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('[WITH_U] Auth callback error:', err);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0812',
      color: 'white',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.3)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '14px', opacity: 0.6 }}>Signing you in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}
