import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import {
  LogOut,
  User,
  Settings as SettingsIcon,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Navbar({ onLanding = false }) {
  const { t } = useTranslation();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside to close user menu
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const navLinks = onLanding
    ? [
        { href: '#mission', label: t('nav.mission') },
        { href: '#features', label: t('nav.features') },
        { href: '#contact', label: t('nav.contact') },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40">
      <nav
        className={`mx-3 sm:mx-6 my-3 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-glass-strong'
            : 'glass'
        }`}
      >
        <Link 
          to="/" 
          className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]"
        >
          <Logo size={28} />
        </Link>

        {/* Desktop nav links */}
        {onLanding && (
          <div className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:opacity-70 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <ThemeToggle />

          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="btn-ghost !p-2 !rounded-full"
                aria-label="user menu"
                id="user-menu-btn"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white text-xs font-semibold">
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 shadow-glass-strong"
                  >
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium truncate">{user?.name || 'You'}</div>
                      <div className="text-xs opacity-60 truncate">{user?.email}</div>
                    </div>
                    <hr className="border-white/30 dark:border-white/10 my-1" />
                    <Link
                      onClick={() => setUserMenuOpen(false)}
                      to="/app/companion"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-sm transition-colors"
                    >
                      <LayoutDashboard size={16} /> {t('nav.companion')}
                    </Link>
                    <Link
                      onClick={() => setUserMenuOpen(false)}
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-sm transition-colors"
                    >
                      <User size={16} /> {t('nav.profile')}
                    </Link>
                    <Link
                      onClick={() => setUserMenuOpen(false)}
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 text-sm transition-colors"
                    >
                      <SettingsIcon size={16} /> {t('nav.settings')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm transition-colors text-red-600 dark:text-red-400"
                    >
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">
                {t('nav.login')}
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                {t('nav.getStarted')}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="btn-ghost !p-2 !rounded-full md:hidden"
            aria-label="menu"
            id="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-backdrop md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 w-72 h-full glass-strong z-50 p-6 flex flex-col gap-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <Logo size={28} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost !p-2 !rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </a>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <LanguageSelector />
              </div>

              {!session && (
                <div className="flex flex-col gap-2 mt-auto">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-ghost text-sm w-full"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary text-sm w-full"
                  >
                    {t('nav.getStarted')}
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
