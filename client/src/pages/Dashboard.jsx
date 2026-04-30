import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Pill, Wind, Brain, Search, Clock, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';
import toast from 'react-hot-toast';

const FEATURE_CARDS = (t) => [
  {
    to: '/ai-companion',
    title: t('dashCards.companion'),
    desc: t('dashCards.companionDesc'),
    icon: Heart,
    color: 'from-violet-500 to-purple-500',
    shadow: 'shadow-[0_8px_30px_rgba(139,92,246,0.2)]',
    text: 'text-violet-500'
  },
  {
    to: '/smart-medication',
    title: t('dashCards.medication'),
    desc: t('dashCards.medicationDesc'),
    icon: Pill,
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
    text: 'text-blue-500'
  },
  {
    to: '/quick-relief',
    title: t('dashCards.relief'),
    desc: t('dashCards.reliefDesc'),
    icon: Wind,
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
    text: 'text-emerald-500'
  },
  {
    to: '/moodsense',
    title: t('dashCards.moodsense'),
    desc: t('dashCards.moodsenseDesc'),
    icon: Brain,
    color: 'from-rose-400 to-pink-500',
    shadow: 'shadow-[0_8px_30px_rgba(244,63,94,0.2)]',
    text: 'text-rose-500'
  },
  {
    to: '/gentle-search',
    title: t('dashCards.gentleSearch'),
    desc: t('dashCards.gentleSearchDesc'),
    icon: Search,
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
    text: 'text-amber-500'
  },
];

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.goodMorning');
  if (hour < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t('nav.logout'));
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      
      {/* Left: Main Features Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black/80 dark:text-white/90">{getGreeting(t)}{user?.name ? `, ${user.name}` : ''}</h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">{t('dashboard.welcomeMsg')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200/50 dark:border-red-500/20 transition-all duration-300 hover:-translate-y-0.5"
            id="dashboard-logout-btn"
          >
            <LogOut size={16} />
            {t('nav.logout')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURE_CARDS(t).map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link to={card.to} className="block group h-full">
                  <div className={`card-hover-glow relative h-full bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/10 dark:hover:border-white/10 ${card.shadow}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon size={24} strokeWidth={2} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/30 dark:text-white/30 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-black/80 dark:text-white/90 mb-1">{card.title}</h3>
                    <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">{card.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right: Activity & Status Panel */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
        
        {/* Emotional Status Card */}
        <div className="card-hover-glow bg-white/60 dark:bg-gradient-to-b dark:from-[#1a1625]/80 dark:to-[#0f0c1e]/80 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <Brain size={18} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wider">{t('erCompanion.currentState')}</h3>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-[2px] mb-4">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0f0c1e] flex items-center justify-center">
                <span className="text-3xl">🌤️</span>
              </div>
            </div>
            <h4 className="text-lg font-bold text-black/80 dark:text-white/90 mb-2">{t('dashboard.stressMid')}</h4>
            <p className="text-sm text-black/50 dark:text-white/50 mb-6">{t('dashboard.reliefDesc')}</p>
            <Link to="/quick-relief" className="w-full py-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium text-sm hover:bg-violet-500/20 transition-colors text-center block">
              {t('dashCards.tryRelief')}
            </Link>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card-hover-glow bg-white/60 dark:bg-gradient-to-b dark:from-[#1a1625]/80 dark:to-[#0f0c1e]/80 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-soft flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wider">{t('dashboard.recent')}</h3>
          </div>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">
            
            {/* Activity Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/50 bg-violet-100 dark:bg-violet-500/20 text-violet-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Heart size={14} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-black/80 dark:text-white/80">{t('dashCards.companion')}</div>
                  <time className="text-[10px] text-black/40 dark:text-white/40">2h {t('dashCards.ago')}</time>
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">{t('dashCards.completedSession')}</div>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/50 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Wind size={14} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-black/80 dark:text-white/80">{t('dashCards.relief')}</div>
                  <time className="text-[10px] text-black/40 dark:text-white/40">{t('dashCards.yesterday')}</time>
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">{t('dashCards.breathingExercise')}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
