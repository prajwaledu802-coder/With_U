import { motion } from 'framer-motion';

const CIRCUMFERENCE = 2 * Math.PI * 70;

export default function StressMeter({ stress = 0, level = 'low', color = '#22c55e' }) {
  const offset = CIRCUMFERENCE - (stress / 100) * CIRCUMFERENCE;
  const label = level === 'high' ? 'High Stress' : level === 'medium' ? 'Moderate' : 'Calm';
  const glowColor = level === 'high'
    ? 'rgba(239,68,68,0.25)'
    : level === 'medium'
      ? 'rgba(234,179,8,0.15)'
      : 'rgba(34,197,94,0.15)';

  return (
    <div className="rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/[0.06] p-6 flex flex-col items-center shadow-soft">
      <div className="text-[10px] uppercase tracking-[0.15em] text-black/40 dark:text-white/40 font-semibold mb-4 self-start">
        Stress Level
      </div>

      {/* Circular gauge */}
      <div className="relative w-44 h-44">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          animate={{ background: glowColor, scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 160 160">
          {/* Track */}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(128,128,128,0.08)" strokeWidth="8" />
          {/* Progress — CSS transition for smooth updates */}
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-4xl font-black transition-colors duration-500" style={{ color }}>
            {stress}
            <span className="text-lg font-medium opacity-60">%</span>
          </span>
          <span className="text-xs font-semibold mt-1 capitalize transition-colors duration-500" style={{ color }}>
            {label}
          </span>
        </div>
      </div>

      {/* Bar visualizer */}
      <div className="flex items-end gap-[3px] mt-5 h-8">
        {[...Array(20)].map((_, i) => {
          const active = i < Math.round(stress / 5);
          const barColor = i < 6 ? '#22c55e' : i < 12 ? '#eab308' : '#ef4444';
          return (
            <div
              key={i}
              className="w-[5px] rounded-full"
              style={{
                height: active ? `${14 + (i % 3) * 6}px` : '4px',
                background: active ? barColor : 'rgba(128,128,128,0.1)',
                transition: `height 0.4s ease ${i * 20}ms, background 0.3s ease`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
