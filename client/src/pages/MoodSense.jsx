import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Brain, Wind, Sparkles, Activity, RefreshCw, ShieldCheck } from 'lucide-react';
import * as faceapi from 'face-api.js';
import StressMeter from '../components/mood/StressMeter';
import BreathingExercise from '../components/mood/BreathingExercise';
import AiraAvatar from '../components/mood/AiraAvatar';
import SuggestionPanel from '../components/mood/SuggestionPanel';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MODEL_PATH = '/models';
const DETECT_INTERVAL = 500;
const API_THROTTLE = 2500;

const EMOTION_EMOJI = {
  happy: '😊', sad: '😢', angry: '😠', fearful: '😰',
  neutral: '😐', surprised: '😮', disgusted: '🤢',
};

export default function MoodSense() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectRef = useRef(null);
  const lastApiCall = useRef(0);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('permission');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelProgress, setModelProgress] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [stress, setStress] = useState(0);
  const [level, setLevel] = useState('low');
  const [message, setMessage] = useState('Allow camera access to begin mood detection.');
  const [suggestions, setSuggestions] = useState(null);
  const [stressColor, setStressColor] = useState('#22c55e');
  const [showBreathing, setShowBreathing] = useState(false);
  const [history, setHistory] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);

  /* ── Load face-api models from public/models ── */
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return true;
    try {
      setModelProgress('Loading face detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH);
      setModelProgress('Loading expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH);
      setModelsLoaded(true);
      setModelProgress('Models ready');
      return true;
    } catch (err) {
      console.error('[MoodSense] Model load failed:', err);
      setModelProgress('Failed to load AI models');
      return false;
    }
  }, [modelsLoaded]);

  /* ── Call backend for stress analysis (throttled) ── */
  const analyzeEmotion = useCallback(async (emo, conf) => {
    const now = Date.now();
    if (now - lastApiCall.current < API_THROTTLE) return;
    lastApiCall.current = now;

    try {
      const res = await fetch(`${API}/api/mood/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: emo, confidence: conf }),
      });
      const data = await res.json();
      if (data.success) {
        setStress(data.stress);
        setLevel(data.level);
        setMessage(data.message);
        setSuggestions(data.suggestions);
        setStressColor(data.color);
        setHistory(h => [
          { emotion: emo, stress: data.stress, time: Date.now() },
          ...h,
        ].slice(0, 20));
      }
    } catch (err) {
      console.warn('[MoodSense] API error:', err.message);
    }
  }, []);

  /* ── Detection loop — runs every 500ms ── */
  const startDetection = useCallback(() => {
    if (detectRef.current) clearInterval(detectRef.current);

    detectRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2) return;

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.4,
          }))
          .withFaceExpressions();

        if (detection) {
          setFaceDetected(true);
          const exprs = detection.expressions;
          const sorted = Object.entries(exprs).sort((a, b) => b[1] - a[1]);
          const [topEmo, topConf] = sorted[0];
          setEmotion(topEmo);
          setConfidence(topConf);
          analyzeEmotion(topEmo, topConf);

          // Draw face overlay
          const canvas = canvasRef.current;
          if (canvas) {
            const dims = faceapi.matchDimensions(canvas, video, true);
            const resized = faceapi.resizeResults(detection, dims);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, dims.width, dims.height);
            faceapi.draw.drawDetections(canvas, resized);
          }
        } else {
          setFaceDetected(false);
        }
      } catch (err) {
        console.warn('[MoodSense] Detection error:', err.message);
      }
    }, DETECT_INTERVAL);
  }, [analyzeEmotion]);

  /* ── Start camera ── */
  const startCamera = async () => {
    setPhase('loading');
    setModelProgress('Loading AI models...');

    const modelsOk = await loadModels();
    if (!modelsOk) {
      setPhase('error');
      return;
    }

    try {
      setModelProgress('Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;

      setPhase('active');

      // Wait for React to render the active phase and the video element
      setTimeout(async () => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          video.setAttribute('autoplay', 'true');
          video.muted = true;

          // Wait for video to be playing
          await new Promise((resolve, reject) => {
            video.onloadeddata = resolve;
            video.onerror = reject;
            setTimeout(reject, 8000); // 8s timeout
          });

          await video.play().catch(() => {});
          startDetection();
        }
      }, 100);
    } catch (err) {
      console.error('[MoodSense] Camera error:', err);
      setPhase('error');
    }
  };

  /* ── Stop camera ── */
  const stopCamera = () => {
    if (detectRef.current) clearInterval(detectRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setPhase('permission');
    setFaceDetected(false);
  };

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (detectRef.current) clearInterval(detectRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-80px)]">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${139 + Math.random() * 60}, ${92 + Math.random() * 80}, ${246}, ${0.15 + Math.random() * 0.15})`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-10, 10, -10],
              opacity: [0.15, 0.4, 0.15],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 5 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Brain size={22} />
          </span>
          <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            MoodSense Companion
          </span>
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1.5 ml-[52px]">
          Real-time emotion detection & AI-powered wellness support
        </p>
      </div>

      {/* ── Permission Phase ── */}
      <AnimatePresence mode="wait">
        {phase === 'permission' && (
          <motion.div key="perm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="relative z-10 flex flex-col items-center justify-center py-16 rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/[0.06]">
            <motion.div
              animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 0 20px rgba(139,92,246,0.1)', '0 0 0 0 rgba(139,92,246,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 border border-violet-500/20">
              <Camera size={44} className="text-violet-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-black/80 dark:text-white/90 mb-2">Allow Camera Access</h2>
            <p className="text-sm text-black/50 dark:text-white/50 max-w-sm text-center mb-2">
              Allow camera to understand your mood. We'll scan your facial expressions to provide real-time wellness support.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mb-6">
              <ShieldCheck size={14} />
              <span>Your camera feed stays on-device. Nothing is recorded or sent.</span>
            </div>
            <button onClick={startCamera}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 text-[15px]">
              <Camera size={20} /> Enable Camera
            </button>
          </motion.div>
        )}

        {/* ── Loading Phase ── */}
        {phase === 'loading' && (
          <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center py-24 rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/[0.06]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={36} className="text-violet-500" />
            </motion.div>
            <p className="text-sm text-black/60 dark:text-white/60 mt-5 font-medium">{modelProgress}</p>
            <div className="mt-3 w-48 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                animate={{ width: ['0%', '70%', '100%'] }}
                transition={{ duration: 4, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}

        {/* ── Error Phase ── */}
        {phase === 'error' && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center py-16 rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-red-500/20">
            <CameraOff size={44} className="text-red-400 mb-4" />
            <h2 className="text-lg font-bold text-black/80 dark:text-white/80 mb-2">Camera Not Available</h2>
            <p className="text-sm text-black/50 dark:text-white/50 text-center max-w-sm mb-1">
              Camera access is required for mood detection. Please allow camera permissions in your browser settings.
            </p>
            <p className="text-xs text-black/30 dark:text-white/30 mb-5">{modelProgress}</p>
            <button onClick={() => setPhase('permission')}
              className="px-6 py-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium hover:bg-violet-500/20 transition-colors">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Phase — 3-column layout ── */}
      {phase === 'active' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ─── LEFT: Camera + Emotion History ─── */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* Camera Feed Card */}
            <div className="rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/[0.06] p-4 shadow-soft overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 dark:text-white/40 font-semibold">Live Feed</span>
                </div>
                <button onClick={stopCamera}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium">
                  Stop
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 aspect-[4/3]">
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
                />

                {/* Emotion badge overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <motion.div key={emotion}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                    <span className="text-base">{EMOTION_EMOJI[emotion] || '😐'}</span>
                    <span className="capitalize">{emotion}</span>
                    <span className="text-white/50 ml-1">{Math.round(confidence * 100)}%</span>
                  </motion.div>
                  {!faceDetected && (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/80 text-white text-[10px] font-medium">
                      No face
                    </div>
                  )}
                </div>

                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Emotion History Timeline */}
            {history.length > 0 && (
              <div className="rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-black/5 dark:border-white/[0.06] p-4">
                <div className="text-[10px] uppercase tracking-[0.15em] text-black/40 dark:text-white/40 font-semibold mb-3 flex items-center gap-1.5">
                  <Activity size={12} /> Emotion Timeline
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {history.slice(0, 14).map((h, i) => (
                    <motion.div key={`${h.time}-${i}`}
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all"
                      style={{
                        background: h.stress > 60 ? 'rgba(239,68,68,0.12)' : h.stress > 30 ? 'rgba(234,179,8,0.12)' : 'rgba(34,197,94,0.12)',
                        borderColor: h.stress > 60 ? 'rgba(239,68,68,0.2)' : h.stress > 30 ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                      }}
                      title={`${h.emotion} — ${h.stress}% stress`}>
                      {EMOTION_EMOJI[h.emotion] || '😐'}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── CENTER: Stress Meter + AI Avatar ─── */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <StressMeter stress={stress} level={level} color={stressColor} emotion={emotion} />
            <AiraAvatar level={level} message={message} emotion={emotion} />
          </div>

          {/* ─── RIGHT: Suggestions + Breathing ─── */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <SuggestionPanel suggestions={suggestions} level={level} onBreathing={() => setShowBreathing(true)} />

            <AnimatePresence mode="wait">
              {showBreathing ? (
                <BreathingExercise key="breathing" onClose={() => setShowBreathing(false)} />
              ) : (
                <motion.div key="breathe-cta"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-3xl bg-white/60 dark:bg-[#1a1625]/60 backdrop-blur-xl border border-emerald-500/15 p-6 flex flex-col items-center text-center cursor-pointer hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all"
                  onClick={() => setShowBreathing(true)}>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 border border-emerald-500/20">
                    <Wind size={26} className="text-emerald-500" />
                  </motion.div>
                  <h3 className="text-sm font-bold text-black/80 dark:text-white/80 mb-1">Breathing Exercise</h3>
                  <p className="text-xs text-black/40 dark:text-white/40">4-7-8 technique • Tap to start</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
