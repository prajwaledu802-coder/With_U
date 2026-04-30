import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { airaService } from '../services/airaService';

/**
 * Face emotion detection panel.
 * Captures one webcam frame every `intervalMs` (default 6s), posts it to
 * /api/v2/emotion/frame, and bubbles { emotion, stressScore, confidence } up
 * via onResult so the parent can fuse it with text/voice signals.
 */
export default function FaceEmotion({
  onResult,
  intervalMs = 6000,
  autoStart = false,
  compact = false,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [last, setLast] = useState(null);
  const [busy, setBusy] = useState(false);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const captureAndAnalyse = useCallback(async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return;
    setBusy(true);
    try {
      const targetW = 320;
      const ratio = v.videoHeight / v.videoWidth;
      c.width = targetW;
      c.height = Math.round(targetW * ratio);
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.7);
      const res = await airaService.emotionFromFrame(dataUrl);
      const out = {
        emotion: res.emotion || 'neutral',
        stressScore: res.stressScore ?? 0,
        confidence: res.confidence ?? 0,
        source: res.source || 'face',
      };
      setLast(out);
      onResult?.(out);
    } catch (err) {
      console.warn('[FaceEmotion] analyse failed:', err.message);
    } finally {
      setBusy(false);
    }
  }, [onResult]);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setActive(true);
      timerRef.current = setInterval(captureAndAnalyse, intervalMs);
      // Run one immediately so the user sees feedback
      setTimeout(captureAndAnalyse, 1500);
    } catch (err) {
      setError(err.message || 'Camera permission denied.');
    }
  }, [captureAndAnalyse, intervalMs]);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stressColor = last?.stressScore <= 20
    ? 'text-emerald-400'
    : last?.stressScore <= 50
      ? 'text-amber-400'
      : last?.stressScore <= 80
        ? 'text-orange-400'
        : 'text-rose-400';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={active ? stop : start}
          className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
            active
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          title={active ? 'Stop camera' : 'Detect face emotion'}
        >
          {active ? <Camera size={14} /> : <CameraOff size={14} />}
          <span>{active ? 'Camera on' : 'Camera off'}</span>
        </button>
        {last && (
          <span className={`text-[11px] ${stressColor}`}>
            {last.emotion} · {last.stressScore}%
          </span>
        )}
        <video ref={videoRef} className="hidden" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-violet-400" />
          <span className="text-xs font-semibold tracking-[0.15em] uppercase opacity-60">
            Face emotion
          </span>
        </div>
        <button
          onClick={active ? stop : start}
          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
            active
              ? 'bg-rose-500/15 border-rose-400/30 text-rose-300'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          {active ? 'Stop' : 'Enable'}
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black/30 aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${active ? '' : 'opacity-30'}`}
          muted
          playsInline
        />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
            <CameraOff size={28} />
            <span className="text-xs">Camera off</span>
          </div>
        )}
        {busy && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-500/30 text-[10px] text-violet-100">
            analysing…
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-rose-300">
          <AlertCircle size={12} /> {error}
        </div>
      )}

      {last && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="opacity-50">Emotion</span>
            <span className="font-medium capitalize">{last.emotion}</span>
          </div>
          <div className={`font-semibold ${stressColor}`}>
            {last.stressScore}% stress
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
