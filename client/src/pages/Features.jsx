import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Activity,
  Bell,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const FEATURES = [
  { icon: BookOpen, key: 'journal', color: 'from-warm-300 to-warm-400' },
  { icon: Activity, key: 'stress', color: 'from-sage-300 to-sage-400' },
  { icon: Bell, key: 'nudges', color: 'from-warm-400 to-sage-300' },
  { icon: Sparkles, key: 'resources', color: 'from-sage-400 to-warm-300' },
  { icon: HeartHandshake, key: 'gentleReach', color: 'from-warm-300 to-sage-400' },
  { icon: ShieldCheck, key: 'privacy', color: 'from-sage-300 to-warm-400' },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <Sparkles size={24} className="text-warm-500" />
          {t('features.title')}
        </h1>
        <p className="text-sm opacity-60 mt-2 max-w-lg">
          Everything WITH_U does — gently, quietly, and on your terms.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <GlassCard key={f.key} hoverable delay={i * 0.08}>
            <div className="flex flex-col h-full">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4`}>
                <f.icon size={22} />
              </div>
              <h3 className="text-base font-semibold mb-2">
                {t(`features.items.${f.key}.title`)}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed flex-1">
                {t(`features.items.${f.key}.body`)}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <h2 className="text-xl font-semibold mb-6">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { step: '1', title: 'Share a moment', desc: 'Type or speak a sentence. No prompts, no forms.', emoji: '💬' },
            { step: '2', title: 'We listen softly', desc: 'Your words are gently analyzed for patterns — never judged.', emoji: '🤍' },
            { step: '3', title: 'Small kindnesses', desc: 'A breath exercise. A glass of water. A soft word when you need it.', emoji: '🌿' },
          ].map((s, i) => (
            <GlassCard key={s.step} delay={0.6 + i * 0.1}>
              <div className="text-center">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="text-xs font-medium text-warm-500 mb-1">Step {s.step}</div>
                <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
                <p className="text-xs opacity-60">{s.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
