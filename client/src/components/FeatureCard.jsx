import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const COLORS = [
  'from-warm-300 to-warm-400',
  'from-sage-300 to-sage-400',
  'from-warm-400 to-sage-300',
  'from-sage-400 to-warm-300',
  'from-warm-300 to-sage-400',
  'from-sage-300 to-warm-400',
];

export default function FeatureCard({ icon: Icon, title, body, delay = 0, index = 0 }) {
  const gradient = COLORS[index % COLORS.length];
  return (
    <GlassCard delay={delay} className="h-full" hoverable>
      <motion.div className="flex flex-col gap-3 relative z-10">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-soft`}
        >
          <Icon size={22} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-75 leading-relaxed">{body}</p>
      </motion.div>
    </GlassCard>
  );
}
