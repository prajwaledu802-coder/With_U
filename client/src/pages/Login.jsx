import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';
import { signIn, signInWithGoogle } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { session, loading: authLoading } = useAuth();

  // If already signed in, go to dashboard
  if (!authLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(form);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground variant="auth" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <GlassCard strong>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-1">{t('auth.loginTitle')}</h1>
              <p className="text-sm opacity-60">{t('hero.subtitle')}</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    className="input pl-10"
                    id="login-email"
                  />
                </div>
              </div>
              <div>
                <label className="label">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    className="input pl-10 pr-10"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity"
                    aria-label="toggle password"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button disabled={busy} className="btn-primary w-full" id="login-submit">
                {busy ? t('common.loading') : t('auth.login')}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs opacity-40">
              <div className="flex-1 h-px bg-current" /> or <div className="flex-1 h-px bg-current" />
            </div>

            <button onClick={google} className="btn-ghost w-full" id="login-google">
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.4 4 9.8 8.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.4 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.5 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
              {t('auth.google')}
            </button>

            <p className="text-sm text-center mt-6 opacity-60">
              {t('auth.noAccount')}{' '}
              <Link to="/signup" className="font-medium text-warm-500 hover:underline underline-offset-4">
                {t('auth.switchSignup')}
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}
