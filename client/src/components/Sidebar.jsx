import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';
import Logo from './Logo';
import toast from 'react-hot-toast';
import {
  Heart, LayoutDashboard, Activity, Calendar, Music, Gamepad2,
  Pill, Phone, BookOpen, Settings, LogOut,
  ChevronLeft, ChevronRight, Wind,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_SECTIONS = [
  {
    titleKey: 'sidebar.sectionCompanion',
    items: [
      { path: '/app/companion', icon: Heart, labelKey: 'sidebar.companion', label: 'Aira Companion', accent: 'from-violet-500 to-fuchsia-500' },
      { path: '/app/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard', label: 'Dashboard', accent: 'from-cyan-400 to-blue-500' },
      { path: '/app/insights', icon: Activity, labelKey: 'sidebar.insights', label: 'Stress Insights', accent: 'from-amber-400 to-orange-500' },
    ],
  },
  {
    titleKey: 'sidebar.sectionDaily',
    items: [
      { path: '/app/routine', icon: Calendar, labelKey: 'sidebar.routine', label: 'Daily Routine', accent: 'from-emerald-400 to-teal-500' },
      { path: '/app/medications', icon: Pill, labelKey: 'sidebar.medications', label: 'Smart Medication', accent: 'from-pink-400 to-rose-500' },
    ],
  },
  {
    titleKey: 'sidebar.sectionActivities',
    items: [
      { path: '/app/relief', icon: Wind, labelKey: 'sidebar.relief', label: 'Quick Relief', accent: 'from-cyan-400 to-sky-500' },
      { path: '/app/games', icon: Gamepad2, labelKey: 'sidebar.games', label: 'Game Zone', accent: 'from-emerald-400 to-lime-500' },
      { path: '/app/music', icon: Music, labelKey: 'sidebar.music', label: 'Calming Music', accent: 'from-violet-400 to-indigo-500' },
      { path: '/app/resources', icon: BookOpen, labelKey: 'sidebar.resources', label: 'Resources', accent: 'from-amber-400 to-yellow-500' },
    ],
  },
  {
    titleKey: 'sidebar.sectionSupport',
    items: [
      { path: '/app/support', icon: Phone, labelKey: 'sidebar.support', label: 'Support & Calls', accent: 'from-rose-500 to-red-500' },
      { path: '/app/settings', icon: Settings, labelKey: 'sidebar.settings', label: 'Settings', accent: 'from-slate-400 to-zinc-500' },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand + collapse */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <Logo size={collapsed ? 28 : 24} />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm tracking-tight">Aira</span>
              <span className="text-[10px] opacity-50 tracking-[0.2em] uppercase">Companion</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Sections */}
      <nav className="flex-1 py-4 px-2 space-y-5 overflow-y-auto aira-scroll">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleKey}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase opacity-40">
                {t(section.titleKey)}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/5 shadow-sm border border-violet-400/15'
                      : 'opacity-65 hover:opacity-100 hover:bg-white/5 border border-transparent'
                    }
                    ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <motion.span
                          layoutId="sidebar-active-bar"
                          className={`absolute left-0 w-1 h-6 bg-gradient-to-b ${item.accent} rounded-r-full`}
                        />
                      )}
                      <div className={`shrink-0 ${isActive ? `text-transparent bg-clip-text bg-gradient-to-br ${item.accent}` : ''}`}>
                        <item.icon size={18} />
                      </div>
                      {!collapsed && <span className="truncate">{t(item.labelKey, item.label)}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User card + sign out */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-md shadow-violet-500/30">
            {initial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] opacity-50 truncate">{user?.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full hover:bg-red-500/10 text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>{t('nav.logout', 'Sign out')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40
          glass-strong border-r border-white/10 transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-[256px]'}`}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-[260px] z-50 glass-strong border-r border-white/10 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
