import { motion } from 'framer-motion';
import { Moon, Droplet, Users, Wind, Sun, Coffee, Headphones } from 'lucide-react';

const ICONS = {
  moon: Moon,
  droplet: Droplet,
  users: Users,
  wind: Wind,
  sun: Sun,
  coffee: Coffee,
  headphones: Headphones,
};

export default function SuggestionPill({ suggestion, delay = 0 }) {
  const Icon = ICONS[suggestion.icon] || Sun;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-4 flex items-start gap-3 cursor-default"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-200 to-sage-200 dark:from-warm-600/30 dark:to-sage-600/30 flex items-center justify-center text-warm-700 dark:text-warm-300 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{suggestion.title}</div>
        <div className="text-xs opacity-70 mt-0.5">{suggestion.body}</div>
      </div>
    </motion.div>
  );
}
