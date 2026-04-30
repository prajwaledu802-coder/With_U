import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const PHASES = [
  { name: 'Inhale',  duration: 4, scale: 1.4, color: '#8b5cf6' },
  { name: 'Hold',    duration: 7, scale: 1.4, color: '#6366f1' },
  { name: 'Exhale',  duration: 8, scale: 1.0, color: '#22c55e' },
];

export default function BreathingExercise({ onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % PHASES.length;
          if (nextIdx === 0) setCycles(c => c + 1);
          setPhaseIdx(nextIdx);
          return PHASES[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phaseIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-3xl bg-white/60 dark:bg-[#1a1625]/80 backdrop-blur-xl border border-violet-500/20 p-6 flex flex-col items-center relative"
      style={{ boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
        <X size={16} />
      </button>

      <div className="text-[10px] uppercase tracking-[0.15em] text-black/40 dark:text-white/40 font-semibold mb-5 self-start">
        4-7-8 Breathing
      </div>

      {/* Breathing circle */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-5">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${phase.color}30 0%, transparent 70%)`,
            transform: `scale(${phase.scale})`,
            transition: `transform ${phase.duration}s ease-in-out, background 0.5s ease`,
            boxShadow: `0 0 60px ${phase.color}20`,
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute inset-3 rounded-full border-2"
          style={{
            borderColor: `${phase.color}40`,
            transform: `scale(${phase.scale})`,
            transition: `transform ${phase.duration}s ease-in-out, border-color 0.5s ease`,
          }}
        />
        {/* Inner circle */}
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background: `${phase.color}15`,
            transform: `scale(${phase.scale})`,
            transition: `transform ${phase.duration}s ease-in-out, background 0.5s ease`,
          }}
        />

        {/* Center text */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.span
            key={phaseIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-black/80 dark:text-white/90"
          >
            {phase.name}
          </motion.span>
          <span className="text-3xl font-black mt-1" style={{ color: phase.color, transition: 'color 0.5s ease' }}>
            {countdown}
          </span>
        </div>
      </div>

      {/* Phase indicator pills */}
      <div className="flex gap-2 mb-3">
        {PHASES.map((p, i) => (
          <div key={i}
            className="px-3 py-1 rounded-full text-[10px] font-semibold border"
            style={{
              background: i === phaseIdx ? `${p.color}20` : 'transparent',
              borderColor: i === phaseIdx ? `${p.color}40` : 'rgba(128,128,128,0.1)',
              color: i === phaseIdx ? p.color : 'rgba(128,128,128,0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            {p.name} ({p.duration}s)
          </div>
        ))}
      </div>

      <p className="text-xs text-black/40 dark:text-white/40">
        Cycle {cycles + 1} • Follow the expanding circle
      </p>
    </motion.div>
  );
}
