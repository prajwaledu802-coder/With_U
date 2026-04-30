import { motion } from 'framer-motion';

const AVATAR_STATES = {
  low:    { emoji: '😊', bg: 'from-emerald-400/20 to-teal-400/20', border: 'border-emerald-500/20', pulse: 'bg-emerald-400' },
  medium: { emoji: '🤔', bg: 'from-amber-400/20 to-orange-400/20', border: 'border-amber-500/20', pulse: 'bg-amber-400' },
  high:   { emoji: '🫂', bg: 'from-rose-400/20 to-red-400/20', border: 'border-rose-500/20', pulse: 'bg-rose-400' },
};

export default function AiraAvatar({ level = 'low', message = '', emotion = 'neutral' }) {
  const s = AVATAR_STATES[level] || AVATAR_STATES.low;

  return (
    <div className={`rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border ${s.border} p-6 shadow-soft`}>
      <div className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-semibold mb-4">AI Companion</div>

      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${s.bg} flex items-center justify-center border-2 ${s.border}`}>
            <motion.span key={level} initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-4xl">
              {s.emoji}
            </motion.span>
          </motion.div>
          <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full ${s.pulse} opacity-20`} />
        </div>

        <h3 className="text-sm font-bold text-black/80 dark:text-white/90 mb-1">WITH-U</h3>

        {/* Message */}
        <AnimatedMessage message={message} />
      </div>
    </div>
  );
}

function AnimatedMessage({ message }) {
  if (!message) return null;
  return (
    <motion.p key={message} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="text-sm text-black/60 dark:text-white/60 leading-relaxed mt-2 max-w-[240px]" style={{ whiteSpace: 'pre-line' }}>
      {message}
    </motion.p>
  );
}
