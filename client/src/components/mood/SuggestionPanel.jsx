import { motion } from 'framer-motion';
import { Sparkles, Wind, MessageSquare, BookOpen, Gamepad2, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_MAP = {
  gratitude: Sparkles, affirmation: Sparkles, music: Music,
  journal: BookOpen, stretch: Wind, game: Gamepad2,
  breathing: Wind, meditation: Wind, companion: MessageSquare,
};

const LINK_MAP = {
  breathing: null, // handled by onBreathing
  companion: '/ai-companion',
  game: '/quick-relief',
  journal: '/ai-companion',
  music: '/quick-relief',
  meditation: null,
  stretch: '/quick-relief',
};

export default function SuggestionPanel({ suggestions, level = 'low', onBreathing }) {
  if (!suggestions) return null;

  const borderColor = level === 'high' ? 'border-rose-500/15' : level === 'medium' ? 'border-amber-500/15' : 'border-emerald-500/15';

  return (
    <div className={`rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border ${borderColor} p-5 shadow-soft`}>
      <div className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold mb-1">
        <Sparkles size={12} className="inline mr-1" /> Suggestions
      </div>
      <h3 className="text-sm font-bold text-black/80 dark:text-white/80 mb-4">{suggestions.title}</h3>

      <div className="space-y-2.5">
        {suggestions.items.map((item, i) => {
          const Icon = ICON_MAP[item.type] || Sparkles;
          const link = LINK_MAP[item.type];
          const isBreathing = item.type === 'breathing' || item.type === 'meditation';

          const content = (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-500/20 transition-colors shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-black/70 dark:text-white/70">{item.icon} {item.text}</span>
              </div>
            </motion.div>
          );

          if (isBreathing) {
            return <div key={i} onClick={onBreathing}>{content}</div>;
          }
          if (link) {
            return <Link key={i} to={link}>{content}</Link>;
          }
          return <div key={i}>{content}</div>;
        })}
      </div>
    </div>
  );
}
