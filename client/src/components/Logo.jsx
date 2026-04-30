import { motion } from 'framer-motion';

export default function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2 group">
      <div 
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <span className="font-bold text-white tracking-widest" style={{ fontSize: size * 0.45 }}>
          W
        </span>
      </div>
      <span className="font-bold tracking-wide text-ink-800 dark:text-ink-50 transition-colors" style={{ fontSize: size * 0.55 }}>
        WITH<span className="text-violet-500">_</span>U
      </span>
    </div>
  );
}
