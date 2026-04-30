import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const EMOJIS = ['🌿', '☀️', '🌤️', '🌥️', '🌧️'];

export default function StressMeter({ level = 0 }) {
  const { t } = useTranslation();
  const pct = Math.max(0, Math.min(100, level));
  const label =
    pct < 33 ? t('dashboard.stressLow') : pct < 66 ? t('dashboard.stressMid') : t('dashboard.stressHigh');
  const emoji = pct < 20 ? EMOJIS[0] : pct < 40 ? EMOJIS[1] : pct < 60 ? EMOJIS[2] : pct < 80 ? EMOJIS[3] : EMOJIS[4];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.span
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg"
          >
            {emoji}
          </motion.span>
          <span className="text-sm opacity-70">{label}</span>
        </div>
        <span className="text-sm font-medium">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/40 dark:bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: pct < 33
              ? 'linear-gradient(90deg, #94b491, #bdd1bb)'
              : pct < 66
              ? 'linear-gradient(90deg, #ecc9a1, #dca97a)'
              : 'linear-gradient(90deg, #c08a5a, #9a6c44)',
          }}
        >
          {pct >= 60 && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
