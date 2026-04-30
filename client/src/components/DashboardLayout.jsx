import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { LayoutDashboard, Heart, Pill, Wind, Brain, Search, Settings, Menu, X, User, PhoneCall } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { preloadAiraModel } from './AiraModel3D';

const SIDEBAR_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'nav.dashboard' },
  { path: '/ai-companion', icon: Heart, label: 'AI Companion', key: 'nav.companion' },
  { path: '/smart-medication', icon: Pill, label: 'Smart Medication', key: 'nav.medications' },
  { path: '/quick-relief', icon: Wind, label: 'Quick Relief', key: 'nav.relief' },
  { path: '/moodsense', icon: Brain, label: 'MoodSense Companion', key: 'nav.moodsense' },
  { path: '/gentle-search', icon: Search, label: 'Gentle Search', key: 'nav.gentleSearch' },
  { path: '/call-aira', icon: PhoneCall, label: 'Call Aira', key: 'nav.callAira' },
  { path: '/settings', icon: Settings, label: 'Settings', key: 'nav.settings' },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isCompanion = location.pathname === '/ai-companion';

  // Preload 3D model in background so companion opens instantly
  useEffect(() => { preloadAiraModel(); }, []);

  // Fallback translation handling
  const safeT = (key, fallback) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  return (
    /* ── OUTER SHELL: exactly 100vh, never scrolls ── */
    <div className="h-screen flex flex-col md:flex-row relative bg-[#fafafa] dark:bg-[#0a0812] transition-colors duration-300 overflow-hidden">
      
      {/* ─── Desktop Left Sidebar (FIXED — never scrolls with page) ─── */}
      <aside className="hidden md:flex flex-col w-[260px] h-screen flex-shrink-0 z-30 border-r border-black/5 dark:border-white/[0.06] bg-white/60 dark:bg-[#0f0c1e]/90 backdrop-blur-2xl">
        <div className="px-6 py-6 border-b border-black/5 dark:border-white/[0.06] flex-shrink-0">
          <div className="text-xl font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            WITH_U
          </div>
          <div className="text-xs text-black/40 dark:text-white/40 mt-1 uppercase tracking-widest font-medium">{safeT('greeting.supporting', 'Supporting you, always')}</div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-500/20'
                      : 'text-black/60 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white border border-transparent'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2.5} />
                <span>{safeT(item.key, item.label)}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[260px] z-50 bg-white/95 dark:bg-[#0f0c1e]/95 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col gap-2 md:hidden">
            <div className="px-4 py-4 mb-4">
              <div className="text-xl font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                WITH_U
              </div>
            </div>
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                        : 'text-black/60 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{safeT(item.key, item.label)}</span>
                </NavLink>
              );
            })}
          </div>
        </>
      )}

      {/* ─── Main Area (Header + Content) — takes remaining width, height = 100vh ─── */}
      <div className="flex-1 flex flex-col h-screen max-w-full overflow-hidden">
        
        {/* TOP HEADER — fixed height, never scrolls */}
        <header className="flex-shrink-0 z-20 w-full px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/[0.06] bg-white/60 dark:bg-[#0f0c1e]/80 backdrop-blur-xl">
          
          {/* Left: Mobile Menu Toggle / Greeting */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-black/80 dark:text-white/90">
                {safeT('greeting.supporting', 'Supporting you, always')}
              </h2>
              {user?.name && <p className="text-xs text-black/50 dark:text-white/50">{safeT('dashboard.hello', 'Hello')}, {user.name}</p>}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            <div className="w-px h-6 bg-black/10 dark:bg-white/10 hidden sm:block"></div>
            <ThemeToggle />
            <button 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 ml-2 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors"
            >
              <User size={18} />
            </button>
          </div>
        </header>

        {/* ─── Page Content ─── 
             For companion: no padding, no scroll (companion handles its own layout)
             For everything else: padding + scroll so only THIS area scrolls, not sidebar
        */}
        <main className={`flex-1 relative z-10 w-full min-h-0 ${isCompanion ? 'p-0 overflow-hidden' : 'p-6 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
