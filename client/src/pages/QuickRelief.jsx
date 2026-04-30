import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, Volume2, VolumeX, Heart, Hand, Sparkles, Eye, Brain, Footprints, Mountain } from 'lucide-react';

/* ═══ 1. Breathing Reset ═══ */
function BreathingReset() {
  const [state, setState] = useState('idle');
  const [phase, setPhase] = useState('');
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);
  const PHASES = [
    { name: 'inhale', dur: 4, label: 'Inhale slowly…' },
    { name: 'hold', dur: 4, label: 'Hold gently…' },
    { name: 'exhale', dur: 6, label: 'Exhale…' },
  ];
  const runCycle = useCallback((pi, cyc) => {
    if (cyc >= 3) { setState('done'); return; }
    if (pi >= PHASES.length) { setCycles(cyc + 1); runCycle(0, cyc + 1); return; }
    const p = PHASES[pi];
    setPhase(p.name); setTimer(p.dur);
    let rem = p.dur;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => { rem--; setTimer(rem); if (rem <= 0) { clearInterval(intervalRef.current); runCycle(pi + 1, cyc); } }, 1000);
  }, []);
  const start = () => { setState('breathing'); setCycles(0); runCycle(0, 0); };
  const stop = () => { clearInterval(intervalRef.current); setState('idle'); setPhase(''); };
  useEffect(() => () => clearInterval(intervalRef.current), []);
  const currentLabel = PHASES.find(p => p.name === phase)?.label || '';
  const scale = phase === 'inhale' ? 1.35 : phase === 'exhale' ? 0.75 : phase === 'hold' ? 1.35 : 1;
  const dur = phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0.5;
  return (
    <ExCard icon="🌬️" title="Breathing Reset" time="~1 min" gradient="from-emerald-500/20 to-teal-500/20" border="border-emerald-500/20">
      <p className="text-xs text-white/50 mb-4 text-center">{state === 'idle' ? 'A 1-minute breathing pause' : state === 'done' ? 'That was a small reset.' : currentLabel}</p>
      <div className="relative w-36 h-36 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <motion.div animate={{ scale }} transition={{ duration: dur, ease: 'easeInOut' }}
          className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-400/50 to-teal-400/50 flex items-center justify-center"
          style={{ boxShadow: state === 'breathing' ? '0 0 40px rgba(52,211,153,0.3)' : 'none' }}>
          {state === 'breathing' ? <span className="text-2xl font-bold text-white">{timer}</span> : state === 'done' ? <span className="text-xl">🤍</span> : <span className="text-xs text-white/40">Ready</span>}
        </motion.div>
      </div>
      {state === 'idle' && <Btn onClick={start}>Begin</Btn>}
      {state === 'breathing' && <Btn onClick={stop} ghost>Stop</Btn>}
      {state === 'done' && <Btn onClick={() => setState('idle')} ghost>Again</Btn>}
    </ExCard>
  );
}

/* ═══ 2. Calming Audio (Hybrid: MP3 + Web Audio API) ═══ */
const SOUNDS = [
  { id: 'rain',  label: 'Rain',  emoji: '🌧️', src: '/audio/rain.mp3' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'piano', label: 'Piano', emoji: '🎹', src: '/audio/piano.mp3' },
  { id: 'wind',  label: 'Wind',  emoji: '💨' },
];

// Procedural sound generators using Web Audio API
function createRainSound(ctx, masterGain) {
  // White noise through bandpass filter = realistic rain
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 3000;
  bandpass.Q.value = 0.5;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 800;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  noise.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(gain);
  gain.connect(masterGain);
  noise.start();

  // Subtle droplet patter with random pings
  const dropInterval = setInterval(() => {
    if (ctx.state === 'closed') { clearInterval(dropInterval); return; }
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 2000 + Math.random() * 4000;
    osc.type = 'sine';
    g.gain.setValueAtTime(0.02 + Math.random() * 0.03, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, 50 + Math.random() * 100);

  return { nodes: [noise], interval: dropInterval };
}

function createOceanSound(ctx, masterGain) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Low frequency rumble
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 400;

  // LFO for wave-like modulation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.12; // slow wave rhythm
  lfo.type = 'sine';
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(lowpass.frequency);
  lfo.start();

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  noise.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(masterGain);
  noise.start();

  // Surf layer — higher hiss
  const surf = ctx.createBufferSource();
  surf.buffer = buffer;
  surf.loop = true;
  const surfFilter = ctx.createBiquadFilter();
  surfFilter.type = 'bandpass';
  surfFilter.frequency.value = 1200;
  surfFilter.Q.value = 0.3;
  const surfGain = ctx.createGain();
  surfGain.gain.value = 0.12;

  const lfo2 = ctx.createOscillator();
  const lfo2Gain = ctx.createGain();
  lfo2.frequency.value = 0.08;
  lfo2.type = 'sine';
  lfo2Gain.gain.value = 0.1;
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(surfGain.gain);
  lfo2.start();

  surf.connect(surfFilter);
  surfFilter.connect(surfGain);
  surfGain.connect(masterGain);
  surf.start();

  return { nodes: [noise, surf, lfo, lfo2] };
}

function createPianoSound(ctx, masterGain) {
  // Pentatonic scale notes for peaceful melody
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  const nodes = [];

  function playNote() {
    if (ctx.state === 'closed') return;
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    // Warm piano-like tone (fundamental + harmonics)
    osc.type = 'triangle';
    osc.frequency.value = freq;

    // Second harmonic for warmth
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.04, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    // Piano envelope: quick attack, long decay
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

    // Reverb-like effect via delay
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.15;

    osc.connect(g);
    osc2.connect(g2);
    g.connect(masterGain);
    g2.connect(masterGain);
    g.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 3.5);
    osc2.stop(ctx.currentTime + 3.5);
  }

  // Play notes at random intervals
  playNote();
  const interval = setInterval(() => {
    if (ctx.state === 'closed') { clearInterval(interval); return; }
    playNote();
    // Occasionally play a chord (2 notes together)
    if (Math.random() > 0.6) {
      setTimeout(() => { if (ctx.state !== 'closed') playNote(); }, 150);
    }
  }, 1200 + Math.random() * 1800);

  return { nodes, interval };
}

function createWindSound(ctx, masterGain) {
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  let lastOut = 0;
  node.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < 4096; i++) {
      const w = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * w) / 1.02;
      out[i] = lastOut * 3.5;
    }
  };
  node.connect(gain);
  gain.connect(masterGain);
  return { nodes: [], scriptNode: node };
}

function CalmingAudio() {
  const [playing, setPlaying] = useState(null);
  const [vol, setVol] = useState(0.6);
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const activeRef = useRef(null);
  const audioRef = useRef(null);

  const stopSound = useCallback(() => {
    // Stop MP3 audio element
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    // Stop Web Audio nodes
    if (activeRef.current?.interval) clearInterval(activeRef.current.interval);
    if (activeRef.current?.nodes) activeRef.current.nodes.forEach(n => { try { n.stop?.(); } catch {} });
    if (activeRef.current?.scriptNode) { try { activeRef.current.scriptNode.disconnect(); } catch {} }
    activeRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {});
    }
    ctxRef.current = null;
    masterGainRef.current = null;
    setPlaying(null);
  }, []);

  const startSound = useCallback((sound) => {
    stopSound();

    // If MP3 file exists, play it directly
    if (sound.src) {
      const audio = new Audio(sound.src);
      audio.loop = true;
      audio.volume = vol;
      audio.addEventListener('canplaythrough', () => audio.play(), { once: true });
      audio.addEventListener('error', (e) => console.error('Audio load error:', e));
      audio.load();
      audioRef.current = audio;
      setPlaying(sound.id);
      return;
    }

    // Otherwise use Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = vol;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    let result;
    switch (sound.id) {
      case 'ocean': result = createOceanSound(ctx, masterGain); break;
      case 'wind':  result = createWindSound(ctx, masterGain); break;
      default: return;
    }
    activeRef.current = result;
    setPlaying(sound.id);
  }, [vol, stopSound]);

  // Update volume live
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
    if (masterGainRef.current) masterGainRef.current.gain.value = vol;
  }, [vol]);

  useEffect(() => () => stopSound(), [stopSound]);

  return (
    <ExCard icon="🎧" title="Calming Audio" time="Any time" gradient="from-violet-500/20 to-purple-500/20" border="border-violet-500/20">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {SOUNDS.map(s => (
          <button key={s.id} onClick={() => playing === s.id ? stopSound() : startSound(s)}
            className={`rounded-xl p-3 text-center transition-all border ${playing === s.id ? 'bg-violet-500/20 border-violet-400/40 scale-[1.02]' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'}`}>
            <div className="text-lg mb-1">{s.emoji}</div>
            <div className="text-[11px] font-medium text-white/70">{s.label}</div>
            {playing === s.id && (
              <div className="text-[9px] text-violet-300 mt-1 flex items-center justify-center gap-1">
                <Volume2 size={9} className="animate-pulse" /> Playing
              </div>
            )}
          </button>
        ))}
      </div>
      {playing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <VolumeX size={12} className="text-white/30" />
            <input type="range" min="0" max="1" step="0.05" value={vol} onChange={e => setVol(parseFloat(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none bg-white/10 accent-violet-400 cursor-pointer" />
            <Volume2 size={12} className="text-white/30" />
          </div>
          <Btn onClick={stopSound} ghost><VolumeX size={14} /> Stop</Btn>
        </div>
      )}
    </ExCard>
  );
}

/* ═══ 3. Reset Pause ═══ */
function ResetPause() {
  const [step, setStep] = useState(0);
  const timerRef = useRef(null);
  const CUES = [{ text: 'Relax your shoulders.', delay: 4000 }, { text: 'Unclench your jaw.', delay: 4000 }, { text: '…', delay: 5000 }];
  const start = () => { setStep(1); let s = 1; const advance = () => { if (s < CUES.length) { s++; setStep(s); timerRef.current = setTimeout(advance, CUES[s - 1]?.delay || 4000); } else { setStep(4); } }; timerRef.current = setTimeout(advance, CUES[0].delay); };
  useEffect(() => () => clearTimeout(timerRef.current), []);
  return (
    <ExCard icon="🧘" title="Reset Pause" time="~30 sec" gradient="from-amber-500/20 to-orange-500/20" border="border-amber-500/20">
      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm text-white/60 mb-4 h-6 text-center">
          {step === 0 && 'A quick body reset'}{step >= 1 && step <= 3 && CUES[step - 1]?.text}{step === 4 && 'Just a small pause.'}
        </motion.p>
      </AnimatePresence>
      {step >= 1 && step <= 3 && <div className="flex justify-center gap-1 mb-3">{[1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= step ? 'bg-amber-400' : 'bg-white/20'}`} />)}</div>}
      {step === 0 && <Btn onClick={start}>Begin</Btn>}
      {step === 4 && <Btn onClick={() => setStep(0)} ghost>Again</Btn>}
    </ExCard>
  );
}

/* ═══ 4. Gratitude ═══ */
function SmallGratitude() {
  const [state, setState] = useState('ask');
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const RESPONSES = ["That's a nice moment.", "Even small things matter.", "I'm glad you noticed that."];
  const submit = () => { setResponse(text.trim() ? RESPONSES[Math.floor(Math.random() * RESPONSES.length)] : 'That counts too.'); setState('done'); };
  return (
    <ExCard icon="✨" title="One Small Gratitude" time="~1 min" gradient="from-rose-500/20 to-pink-500/20" border="border-rose-500/20">
      {state === 'ask' && <><p className="text-xs text-white/50 mb-3 text-center">Name one small thing that felt okay today</p><div className="flex gap-2 justify-center"><Btn onClick={() => setState('input')}>Sure</Btn><Btn onClick={() => { setResponse('No worries.'); setState('done'); }} ghost>Skip</Btn></div></>}
      {state === 'input' && <div className="space-y-3"><textarea value={text} onChange={e => setText(e.target.value)} placeholder="Just a word or sentence…" rows={2} className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/90 resize-none focus:outline-none focus:border-rose-400/40" autoFocus /><Btn onClick={submit}>Share</Btn></div>}
      {state === 'done' && <><p className="text-sm text-white/70 mb-3 text-center">{response}</p><Btn onClick={() => { setState('ask'); setText(''); }} ghost>Again</Btn></>}
    </ExCard>
  );
}

/* ═══ 5. Progressive Muscle Relaxation ═══ */
function MuscleRelax() {
  const [step, setStep] = useState(-1);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);
  const GROUPS = [
    { name: 'Hands', emoji: '✊', inst: 'Clench your fists tightly…', rel: 'Now release…' },
    { name: 'Arms', emoji: '💪', inst: 'Tense your biceps…', rel: 'Let them go heavy…' },
    { name: 'Shoulders', emoji: '🤷', inst: 'Shrug up to your ears…', rel: 'Drop them down…' },
    { name: 'Face', emoji: '😣', inst: 'Scrunch your face tight…', rel: 'Relax every muscle…' },
    { name: 'Legs', emoji: '🦵', inst: 'Press your feet into the floor…', rel: 'Release all tension…' },
  ];
  const [sub, setSub] = useState('tense');
  const runStep = (i) => {
    if (i >= GROUPS.length) { setStep(99); clearInterval(intervalRef.current); return; }
    setStep(i); setSub('tense'); setTimer(5);
    let rem = 5;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      rem--;
      setTimer(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current);
        setSub('release'); setTimer(5); rem = 5;
        intervalRef.current = setInterval(() => { rem--; setTimer(rem); if (rem <= 0) { clearInterval(intervalRef.current); runStep(i + 1); } }, 1000);
      }
    }, 1000);
  };
  useEffect(() => () => clearInterval(intervalRef.current), []);
  const g = step >= 0 && step < GROUPS.length ? GROUPS[step] : null;
  return (
    <ExCard icon="💆" title="Muscle Relaxation" time="~3 min" gradient="from-sky-500/20 to-blue-500/20" border="border-sky-500/20">
      {step === -1 && <><p className="text-xs text-white/50 mb-3 text-center">Tense and release each muscle group</p><Btn onClick={() => runStep(0)}>Begin</Btn></>}
      {g && (
        <div className="text-center">
          <div className="text-3xl mb-2">{g.emoji}</div>
          <div className="text-sm font-medium text-white/80 mb-1">{g.name}</div>
          <p className="text-xs text-white/50 mb-2">{sub === 'tense' ? g.inst : g.rel}</p>
          <div className={`text-2xl font-bold mb-2 ${sub === 'tense' ? 'text-sky-300' : 'text-emerald-300'}`}>{timer}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/40">{sub === 'tense' ? 'Tense…' : 'Release…'}</div>
          <div className="flex justify-center gap-1 mt-3">{GROUPS.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= step ? 'bg-sky-400' : 'bg-white/15'}`} />)}</div>
        </div>
      )}
      {step === 99 && <><p className="text-sm text-white/70 mb-3 text-center">Your body feels lighter now.</p><Btn onClick={() => setStep(-1)} ghost>Again</Btn></>}
    </ExCard>
  );
}

/* ═══ 6. 5-4-3-2-1 Grounding ═══ */
function Grounding() {
  const STEPS = [
    { count: 5, sense: 'SEE', emoji: '👁️', color: 'text-violet-300' },
    { count: 4, sense: 'TOUCH', emoji: '✋', color: 'text-blue-300' },
    { count: 3, sense: 'HEAR', emoji: '👂', color: 'text-emerald-300' },
    { count: 2, sense: 'SMELL', emoji: '👃', color: 'text-amber-300' },
    { count: 1, sense: 'TASTE', emoji: '👅', color: 'text-rose-300' },
  ];
  const [step, setStep] = useState(-1);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const s = step >= 0 && step < STEPS.length ? STEPS[step] : null;
  const addItem = () => {
    if (!input.trim()) return;
    const next = [...items, input.trim()];
    setInput('');
    if (next.length >= (s?.count || 1)) { setItems([]); setStep(step + 1); } else { setItems(next); }
  };
  return (
    <ExCard icon="🌍" title="5-4-3-2-1 Grounding" time="~2 min" gradient="from-indigo-500/20 to-violet-500/20" border="border-indigo-500/20">
      {step === -1 && <><p className="text-xs text-white/50 mb-3 text-center">Ground yourself through your senses</p><Btn onClick={() => { setStep(0); setItems([]); }}>Begin</Btn></>}
      {s && (
        <div className="text-center">
          <div className="text-2xl mb-1">{s.emoji}</div>
          <div className={`text-lg font-bold ${s.color} mb-1`}>{s.count} things you can {s.sense}</div>
          <div className="text-[10px] text-white/40 mb-3">{items.length}/{s.count} named</div>
          <div className="flex gap-2 mb-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={`Name something you ${s.sense.toLowerCase()}…`}
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/90 focus:outline-none" autoFocus />
            <button onClick={addItem} className="px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm">+</button>
          </div>
          {items.length > 0 && <div className="flex flex-wrap gap-1 justify-center">{items.map((it, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60">{it}</span>)}</div>}
          <div className="flex justify-center gap-1 mt-3">{STEPS.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= step ? 'bg-indigo-400' : 'bg-white/15'}`} />)}</div>
        </div>
      )}
      {step >= STEPS.length && <><p className="text-sm text-white/70 mb-3 text-center">You're here. You're grounded.</p><Btn onClick={() => setStep(-1)} ghost>Again</Btn></>}
    </ExCard>
  );
}

/* ═══ 7. Visualization Journey ═══ */
function Visualization() {
  const SCENES = [
    { name: 'Forest Path', emoji: '🌲', steps: ['You stand at the edge of a quiet forest…', 'Sunlight filters through the canopy above…', 'You hear birdsong and rustling leaves…', 'A gentle path winds deeper into the trees…', 'You breathe in cool, fresh forest air…', 'Peace settles into your shoulders…'] },
    { name: 'Beach Sunset', emoji: '🌅', steps: ['Warm sand beneath your feet…', 'The ocean stretches to the horizon…', 'Waves lap gently at the shore…', 'Golden light paints the clouds…', 'The air smells of salt and warmth…', 'Everything slows down…'] },
    { name: 'Mountain Lake', emoji: '🏔️', steps: ['A still lake mirrors the sky…', 'Mountains rise quietly around you…', 'The water is perfectly calm…', 'A soft breeze touches your face…', 'Silence wraps around you like a blanket…', 'You feel small, and that feels okay…'] },
  ];
  const [scene, setScene] = useState(null);
  const [step, setStep] = useState(-1);
  const timerRef = useRef(null);
  const startScene = (s) => {
    setScene(s); setStep(0);
    let i = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { i++; if (i >= s.steps.length) { clearInterval(timerRef.current); setStep(99); } else { setStep(i); } }, 5000);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);
  return (
    <ExCard icon="🌄" title="Visualization Journey" time="~2 min" gradient="from-teal-500/20 to-emerald-500/20" border="border-teal-500/20">
      {!scene && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 mb-3 text-center">Pick a scene and close your eyes</p>
          {SCENES.map(s => (
            <button key={s.name} onClick={() => startScene(s)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left">
              <span className="text-xl">{s.emoji}</span>
              <span className="text-sm font-medium text-white/70">{s.name}</span>
            </button>
          ))}
        </div>
      )}
      {scene && step >= 0 && step < scene.steps.length && (
        <div className="text-center">
          <div className="text-2xl mb-2">{scene.emoji}</div>
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="text-sm text-white/70 italic mb-4 min-h-[40px]">{scene.steps[step]}</motion.p>
          </AnimatePresence>
          <div className="flex justify-center gap-1">{scene.steps.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= step ? 'bg-teal-400' : 'bg-white/15'}`} />)}</div>
          <Btn onClick={() => { clearInterval(timerRef.current); setScene(null); setStep(-1); }} ghost>Stop</Btn>
        </div>
      )}
      {step === 99 && <><p className="text-sm text-white/70 mb-3 text-center">Welcome back.</p><Btn onClick={() => { setScene(null); setStep(-1); }} ghost>Another</Btn></>}
    </ExCard>
  );
}

/* ═══ Shared Components ═══ */
function ExCard({ children, icon, title, time, gradient, border }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`rounded-2xl p-5 border backdrop-blur-xl relative overflow-hidden ${border}`}
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-40 pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="text-base font-semibold text-white/90">{title}</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/40">{time}</span>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function Btn({ children, onClick, ghost }) {
  return (
    <button onClick={onClick}
      className={`w-full text-sm px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 transition-all ${
        ghost
          ? 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]'
          : 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-medium hover:brightness-110 shadow-lg shadow-violet-500/20'
      }`}>
      {children}
    </button>
  );
}

/* ═══ Condition Cards ═══ */
const CONDITIONS = [
  { id: 'anxiety', label: '😰 Anxiety', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/20',
    tips: ['Focus on your breathing — slow exhales calm the nervous system', 'Name 5 things you can see around you', 'Place your hand on your chest and feel it rise and fall'],
    exercises: ['Breathing Reset', '5-4-3-2-1 Grounding', 'Muscle Relaxation'] },
  { id: 'depression', label: '🌧️ Depression', color: 'from-slate-500/20 to-gray-500/20', border: 'border-slate-400/20',
    tips: ['You don\'t have to feel better right now — just be here', 'Even getting out of bed was something today', 'One small act of kindness to yourself counts'],
    exercises: ['One Small Gratitude', 'Visualization Journey', 'Calming Audio'] },
  { id: 'stress', label: '🔥 Stress', color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/20',
    tips: ['Drop your shoulders — they\'re probably near your ears', 'Nothing is urgent enough to sacrifice your health', 'Take 3 deep breaths before your next task'],
    exercises: ['Reset Pause', 'Breathing Reset', 'Muscle Relaxation'] },
  { id: 'sleep', label: '🌙 Sleep Issues', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20',
    tips: ['Dim your screen and slow your breathing', 'Count backwards from 100 by 3s', 'Tense each muscle group then release — head to toe'],
    exercises: ['Calming Audio', 'Visualization Journey', 'Muscle Relaxation'] },
  { id: 'anger', label: '💢 Anger', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/20',
    tips: ['Pause before you respond — 10 seconds changes everything', 'Squeeze your fists tight for 5 sec, then release', 'Splash cold water on your face to reset'],
    exercises: ['Breathing Reset', 'Reset Pause', '5-4-3-2-1 Grounding'] },
  { id: 'loneliness', label: '🫂 Loneliness', color: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/20',
    tips: ['You\'re not alone in feeling alone', 'Reach out to one person today — even a text counts', 'Be the friend to yourself that you wish you had'],
    exercises: ['One Small Gratitude', 'Visualization Journey', 'Calming Audio'] },
];

function ConditionCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 border backdrop-blur-xl relative overflow-hidden cursor-pointer ${c.border}`}
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
      onClick={() => setOpen(!open)}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.color} blur-2xl opacity-40 pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-white/90">{c.label}</h3>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-white/40 text-sm">▼</motion.span>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2 mt-3">
                {c.tips.map((tip, i) => (
                  <div key={i} className="text-xs text-white/60 flex gap-2 items-start">
                    <span className="text-white/30 mt-0.5">•</span><span>{tip}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Recommended exercises</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.exercises.map(ex => (
                    <span key={ex} className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60">✦ {ex}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══ Main Page ═══ */
export default function QuickRelief() {
  const [tab, setTab] = useState('exercises');
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <Wind size={24} className="text-emerald-400" />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Quick Relief</span>
        </h1>
        <p className="text-sm text-white/50 mt-2 max-w-lg">Small tools for overwhelmed moments. Use them anytime.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'exercises', label: '🧘 Exercises' }, { id: 'conditions', label: '💡 By Condition' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-sm px-4 py-2 rounded-xl border transition-all ${tab === t.id ? 'bg-violet-500/20 border-violet-400/40 text-violet-100' : 'bg-white/[0.04] border-white/[0.06] text-white/50 hover:bg-white/[0.08]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'exercises' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <BreathingReset />
          <CalmingAudio />
          <ResetPause />
          <SmallGratitude />
          <MuscleRelax />
          <Grounding />
          <Visualization />
        </div>
      )}

      {tab === 'conditions' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {CONDITIONS.map(c => <ConditionCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
