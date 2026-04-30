import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Wind, Music, RotateCcw, Sparkles, Heart, Moon, MessageCircle } from 'lucide-react';
import ToolModal from '../components/ToolModal';

const TOOL_CARDS = [
  { id: 'breathing', icon: Wind, color: 'text-cyan-300', titleKey: 'relief.breathing', descKey: 'relief.breathingDesc' },
  { id: 'audio', icon: Music, color: 'text-violet-300', titleKey: 'relief.audio', descKey: 'relief.audioDesc' },
  { id: 'reset', icon: RotateCcw, color: 'text-amber-300', titleKey: 'relief.reset', descKey: 'relief.resetDesc' },
  { id: 'gratitude', icon: Heart, color: 'text-rose-300', titleKey: 'relief.gratitude', descKey: 'relief.gratitudeDesc' },
  { id: 'quiz', icon: MessageCircle, color: 'text-emerald-300', titleKey: 'relief.checkin', descKey: 'relief.checkinDesc' },
  { id: 'quiet', icon: Moon, color: 'text-slate-300', titleKey: 'relief.quiet', descKey: 'relief.quietDesc' },
];

export default function QuickReliefAira() {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <Sparkles size={22} className="text-cyan-300" />
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-slate-200 bg-clip-text text-transparent">
            {t('relief.title')}
          </span>
        </h1>
        <p className="text-sm text-white/50 mt-2 max-w-lg">{t('relief.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOL_CARDS.map((tool, i) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTool(tool.id)}
            className="text-left rounded-3xl border border-white/10 backdrop-blur-xl p-5 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <tool.icon size={20} className={`${tool.color} mb-3`} />
            <div className="text-sm font-semibold text-white/90">{t(tool.titleKey)}</div>
            <div className="text-[11px] text-white/45 mt-1 leading-relaxed">{t(tool.descKey)}</div>
          </motion.button>
        ))}
      </div>

      <ToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        onQuizComplete={() => setActiveTool(null)}
      />
    </div>
  );
}
