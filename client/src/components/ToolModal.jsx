import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Volume2, RotateCcw, Heart, MessageCircle, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ═══ Breathing Exercise ═══ */
function BreathingTool({ onClose }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 7000 },
      { name: 'exhale', duration: 8000 },
    ];
    let phaseIdx = 0;
    let countDown;

    const runPhase = () => {
      const p = phases[phaseIdx];
      setPhase(p.name);
      setCount(Math.ceil(p.duration / 1000));

      let c = Math.ceil(p.duration / 1000);
      countDown = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(countDown);
          phaseIdx = (phaseIdx + 1) % phases.length;
          if (phaseIdx === 0) setCycles(prev => prev + 1);
          runPhase();
        }
        setCount(Math.max(0, c));
      }, 1000);
    };

    runPhase();
    return () => clearInterval(countDown);
  }, []);

  const phaseColors = {
    inhale: 'from-violet-400/30 to-blue-400/30',
    hold: 'from-amber-400/30 to-orange-400/30',
    exhale: 'from-emerald-400/30 to-teal-400/30',
  };

  const phaseScale = { inhale: 1.4, hold: 1.4, exhale: 0.8 };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <motion.div
        animate={{
          scale: phaseScale[phase],
          transition: {
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.3 : 8,
            ease: 'easeInOut'
          }
        }}
        className="relative"
      >
        <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${phaseColors[phase]} backdrop-blur-xl border border-white/20 flex items-center justify-center transition-colors duration-1000`}>
          <div className="text-center">
            <div className="text-4xl font-light text-white/90">{count}</div>
            <div className="text-sm font-medium text-white/60 capitalize mt-1">{phase}</div>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseColors[phase]} blur-2xl -z-10`}
        />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-white/80 text-lg font-light">
          {phase === 'inhale' && t('relief.breathingIn')}
          {phase === 'hold' && t('relief.breathingHold')}
          {phase === 'exhale' && t('relief.breathingOut')}
        </p>
        <p className="text-white/40 text-xs">{t('relief.breathingCycle', { count: cycles + 1 })}</p>
      </div>
    </div>
  );
}

/* ═══ Calming Audio ═══ */
function AudioTool() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const nodesRef = useRef([]);

  const sounds = [
    { id: 'rain', label: t('relief.soundRain'), icon: '🌧️', src: '/audio/rain.mp3', fallback: 'noise' },
    { id: 'waves', label: t('relief.soundWaves'), icon: '🌊', src: '/audio/waves.mp3', fallback: 'wave' },
    { id: 'piano', label: t('relief.soundPiano'), icon: '🎹', src: '/audio/piano.mp3', fallback: 'piano' },
    { id: 'forest', label: 'Forest Ambience', icon: '🌿', fallback: 'forest' },
    { id: 'bowls', label: 'Tibetan Bowls', icon: '🔔', fallback: 'bowls' },
    { id: 'crickets', label: 'Night Crickets', icon: '🌙', fallback: 'crickets' },
  ];

  const playSynthetic = (type) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    nodesRef.current = [];

    if (type === 'noise') {
      // Pink noise for rain
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852; b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.3;
      source.connect(gain).connect(ctx.destination);
      source.start();
      sourceRef.current = source;
      nodesRef.current.push(source);
      return;
    }

    if (type === 'forest') {
      // Brown noise (low-pass filtered white) + gentle chirps
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer; src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 800;
      const gain = ctx.createGain(); gain.gain.value = 0.25;
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start();
      nodesRef.current.push(src);
      // Bird chirp layer
      const chirp = ctx.createOscillator();
      chirp.type = 'sine'; chirp.frequency.value = 2800;
      const chirpLfo = ctx.createOscillator();
      chirpLfo.frequency.value = 3;
      const chirpLfoGain = ctx.createGain();
      chirpLfoGain.gain.value = 600;
      chirpLfo.connect(chirpLfoGain).connect(chirp.frequency);
      const chirpGain = ctx.createGain(); chirpGain.gain.value = 0.015;
      const chirpAm = ctx.createOscillator();
      chirpAm.frequency.value = 0.4;
      const chirpAmGain = ctx.createGain(); chirpAmGain.gain.value = 0.012;
      chirpAm.connect(chirpAmGain).connect(chirpGain.gain);
      chirp.connect(chirpGain).connect(ctx.destination);
      chirp.start(); chirpLfo.start(); chirpAm.start();
      nodesRef.current.push(chirp, chirpLfo, chirpAm);
      sourceRef.current = src;
      return;
    }

    if (type === 'bowls') {
      // Tibetan singing bowls: layered sine harmonics with slow fade
      const freqs = [174, 285, 396, 528];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; osc.frequency.value = f;
        const gain = ctx.createGain();
        gain.gain.value = 0.06 / (i + 1);
        // Slow pulsing
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08 + i * 0.02;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.03 / (i + 1);
        lfo.connect(lfoGain).connect(gain.gain);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); lfo.start();
        nodesRef.current.push(osc, lfo);
      });
      sourceRef.current = nodesRef.current[0];
      return;
    }

    if (type === 'crickets') {
      // Night crickets: AM-modulated high frequency
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 4200;
      const amOsc = ctx.createOscillator();
      amOsc.frequency.value = 8;
      const amGain = ctx.createGain(); amGain.gain.value = 0.04;
      amOsc.connect(amGain).connect(osc.frequency);
      const mainGain = ctx.createGain(); mainGain.gain.value = 0.03;
      // Second layer
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine'; osc2.frequency.value = 3800;
      const amOsc2 = ctx.createOscillator();
      amOsc2.frequency.value = 6;
      const amGain2 = ctx.createGain(); amGain2.gain.value = 0.03;
      amOsc2.connect(amGain2).connect(osc2.frequency);
      const mainGain2 = ctx.createGain(); mainGain2.gain.value = 0.025;
      osc.connect(mainGain).connect(ctx.destination);
      osc2.connect(mainGain2).connect(ctx.destination);
      osc.start(); amOsc.start(); osc2.start(); amOsc2.start();
      nodesRef.current.push(osc, amOsc, osc2, amOsc2);
      sourceRef.current = osc;
      return;
    }

    if (type === 'piano') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 261.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.6;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 40;
      lfo.connect(lfoGain).connect(osc.frequency);
      const gain = ctx.createGain();
      gain.gain.value = 0.07;
      osc.connect(gain).connect(ctx.destination);
      osc.start(); lfo.start();
      sourceRef.current = osc;
      nodesRef.current.push(osc, lfo);
      return;
    }

    // Simple sine waves for other ambient sounds (wave/hum)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = type === 'wave' ? 120 : 440;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = type === 'wave' ? 0.1 : 2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = type === 'wave' ? 60 : 5;
    lfo.connect(lfoGain).connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start(); lfo.start();
    sourceRef.current = osc;
    nodesRef.current.push(osc, lfo);
  };

  const playSound = (sound) => {
    const { id, src, fallback } = sound;
    if (playing === id) {
      stopSound();
      return;
    }
    stopSound();

    if (src) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.4;
      audio.oncanplaythrough = () => {
        audio.play().catch(() => playSynthetic(fallback));
      };
      audio.onerror = () => playSynthetic(fallback);
      sourceRef.current = audio;
      setPlaying(id);
      return;
    }

    playSynthetic(fallback);
    setPlaying(id);
  };

  const stopSound = () => {
    try {
      if (sourceRef.current?.pause) {
        sourceRef.current.pause();
        sourceRef.current.currentTime = 0;
      }
      // Stop all nodes
      nodesRef.current.forEach(n => {
        try { n.stop?.(); n.disconnect?.(); } catch {}
      });
      if (sourceRef.current?.stop) {
        try { sourceRef.current.stop(); sourceRef.current.disconnect(); } catch {}
      }
      audioCtxRef.current?.close?.();
    } catch {}
    sourceRef.current = null;
    audioCtxRef.current = null;
    nodesRef.current = [];
    setPlaying(null);
  };

  useEffect(() => () => stopSound(), []);

  return (
    <div className="space-y-6 px-2">
      <div className="text-center">
        <h3 className="text-xl font-light text-white/90 mb-1">{t('relief.audioTitle')}</h3>
        <p className="text-sm text-white/40">Tap to play, tap again to stop</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {sounds.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => playSound(s)}
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 text-center ${
              playing === s.id
                ? 'bg-white/15 border-violet-400/40 shadow-lg shadow-violet-500/10 ring-2 ring-violet-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl block mb-2">{s.icon}</span>
            <span className="text-[11px] text-white/70 font-medium leading-tight block">{s.label}</span>
            {playing === s.id && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-1.5 text-[9px] text-violet-300"
              >♪ Playing</motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ═══ Quick Reset ═══ */
function ResetTool() {
  const { t } = useTranslation();
  const cues = [
    { icon: '🧊', title: t('relief.resetCold'), desc: t('relief.resetColdDesc') },
    { icon: '👐', title: t('relief.resetGround'), desc: t('relief.resetGroundDesc') },
    { icon: '💪', title: t('relief.resetTense'), desc: t('relief.resetTenseDesc') },
    { icon: '🚶', title: t('relief.resetMove'), desc: t('relief.resetMoveDesc') },
  ];

  return (
    <div className="space-y-4 px-2">
      <div className="text-center mb-4">
        <h3 className="text-xl font-light text-white/90 mb-1">{t('relief.resetTitle')}</h3>
        <p className="text-sm text-white/40">{t('relief.resetSubtitle')}</p>
      </div>
      {cues.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <span className="text-2xl mt-0.5">{c.icon}</span>
          <div>
            <h4 className="text-sm font-medium text-white/90">{c.title}</h4>
            <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{c.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══ Gratitude ═══ */
function GratitudeTool() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState('');

  const addEntry = () => {
    if (!input.trim()) return;
    setEntries(prev => [...prev, { text: input.trim(), ts: Date.now() }]);
    setInput('');
  };

  return (
    <div className="space-y-5 px-2">
      <div className="text-center">
        <h3 className="text-xl font-light text-white/90 mb-1">{t('relief.gratitudeTitle')}</h3>
        <p className="text-sm text-white/40">{t('relief.gratitudeSubtitle')}</p>
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          placeholder={t('relief.gratitudePlaceholder')}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400/30 backdrop-blur-xl"
        />
        <button onClick={addEntry} className="px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-400/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-all">
          <Heart size={16} />
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.map((e, i) => (
          <motion.div
            key={e.ts}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8"
          >
            <span className="text-pink-400">♡</span>
            <span className="text-sm text-white/70">{e.text}</span>
          </motion.div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-sm text-white/20 py-8">{t('relief.gratitudeEmpty')}</p>
        )}
      </div>
    </div>
  );
}

/* ═══ Quick Check-in Quiz ═══ */
function SoftCheckInTool({ onClose, onComplete }) {
  const { t } = useTranslation();
  const questions = [
    t('relief.checkinQ1'),
    t('relief.checkinQ2'),
    t('relief.checkinQ3'),
  ];
  const options = [
    { label: t('relief.checkinOpt0'), value: 0 },
    { label: t('relief.checkinOpt1'), value: 1 },
    { label: t('relief.checkinOpt2'), value: 2 },
    { label: t('relief.checkinOpt3'), value: 3 },
  ];
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const allAnswered = answers.every((a) => a !== null);

  const setAnswer = (idx, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const submit = () => {
    if (!allAnswered) return;
    onComplete?.({ answers });
  };

  return (
    <div className="space-y-5 px-2">
      <div className="text-center">
        <h3 className="text-xl font-light text-white/90 mb-1">{t('relief.checkinTitle')}</h3>
        <p className="text-sm text-white/40">{t('relief.checkinSubtitle')}</p>
      </div>
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q} className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-white/80 mb-3">{q}</div>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswer(idx, opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                    answers[idx] === opt.value
                      ? 'bg-violet-500/20 border-violet-400/40 text-violet-200'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-400/30 text-xs text-violet-200 disabled:opacity-40 hover:bg-violet-500/30"
        >
          {t('relief.checkinSubmit')}
        </button>
      </div>
    </div>
  );
}

/* ═══ Quiet Mode ═══ */
function QuietModeTool() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(() => localStorage.getItem('aira_quiet') === 'true');

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add('quiet-mode');
    else root.classList.remove('quiet-mode');
    localStorage.setItem('aira_quiet', enabled ? 'true' : 'false');
  }, [enabled]);

  return (
    <div className="space-y-5 px-2">
      <div className="text-center">
        <h3 className="text-xl font-light text-white/90 mb-1">{t('relief.quietTitle')}</h3>
        <p className="text-sm text-white/40">{t('relief.quietSubtitle')}</p>
      </div>
      <button
        onClick={() => setEnabled((v) => !v)}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10"
      >
        {enabled ? t('relief.quietDisable') : t('relief.quietEnable')}
      </button>
      <div className="text-[11px] text-white/35 leading-relaxed">
        {t('relief.quietNote')}
      </div>
    </div>
  );
}

export default function ToolModal({ tool, onClose, onAnimationChange, onQuizComplete }) {
  const { t } = useTranslation();

  // Set breathing animation when breathing tool is open
  useEffect(() => {
    if (tool === 'breathing' && onAnimationChange) {
      onAnimationChange('breathing');
    }
    return () => {
      if (onAnimationChange) onAnimationChange('idle');
    };
  }, [tool]);

  if (!tool || tool === 'none') return null;

  const TOOLS = {
    breathing: { title: t('relief.breathingTitle'), icon: Wind, component: BreathingTool },
    audio: { title: t('relief.audioTitle'), icon: Volume2, component: AudioTool },
    reset: { title: t('relief.resetTitle'), icon: RotateCcw, component: ResetTool },
    gratitude: { title: t('relief.gratitudeTitle'), icon: Heart, component: GratitudeTool },
    quiz: { title: t('relief.checkinTitle'), icon: MessageCircle, component: SoftCheckInTool },
    quiet: { title: t('relief.quietTitle'), icon: Moon, component: QuietModeTool },
  };

  const config = TOOLS[tool];
  if (!config) return null;
  const ToolComponent = config.component;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4 rounded-3xl bg-gradient-to-br from-[#1a1530]/95 to-[#0f0d1a]/95 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/20">
                <config.icon size={18} className="text-violet-300" />
              </div>
              <h2 className="text-lg font-medium text-white/90">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <X size={16} className="text-white/60" />
            </button>
          </div>

          {/* Tool Content */}
          <ToolComponent onClose={onClose} onComplete={onQuizComplete} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
