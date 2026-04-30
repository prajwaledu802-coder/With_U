import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * VoiceInput using browser's native Web Speech API.
 * No server dependency — works entirely client-side.
 * Supports multilingual recognition.
 */
export default function VoiceInput({ onTranscript, onSpeakingChange, lang = 'en' }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
  }, []);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const start = () => {
    if (recording || busy) return;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    // Map companion language code to BCP-47 for speech recognition
    const langMap = { en:'en-US', hi:'hi-IN', kn:'kn-IN', ta:'ta-IN', te:'te-IN', ml:'ml-IN', bn:'bn-IN', mr:'mr-IN', gu:'gu-IN', pa:'pa-IN', ur:'ur-PK' };
    recognition.lang = langMap[lang] || 'en-US';

    recognition.onstart = () => {
      setRecording(true);
      onSpeakingChange?.(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript && transcript.trim()) {
        onTranscript?.(transcript.trim());
      } else {
        toast('Didn\'t catch that — try again?', { icon: '🤫' });
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied. Please enable it.');
      } else if (event.error === 'no-speech') {
        toast('No speech detected. Try again.', { icon: '🎤' });
      } else if (event.error !== 'aborted') {
        toast.error('Speech recognition error: ' + event.error);
      }
    };

    recognition.onend = () => {
      setRecording(false);
      onSpeakingChange?.(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setRecording(false);
  };

  return (
    <div className="relative">
      <button
        onClick={recording ? stop : start}
        disabled={busy}
        title={recording ? 'Stop recording' : 'Speak'}
        className={`relative p-2 rounded-lg border transition-all flex-shrink-0
          ${recording
            ? 'mic-listening bg-red-500/20 border-red-400/40 text-red-300'
            : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white/90'
          }
          ${busy ? 'opacity-60 cursor-wait' : ''}
          disabled:opacity-40
        `}
      >
        {busy ? <Loader2 size={14} className="animate-spin" />
          : recording ? <Square size={14} className="opacity-0" />
          : <Mic size={14} />}

        {recording && !busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
            <motion.div className="w-[3px] bg-red-400 rounded-full" animate={{ height: [6, 18, 6] }} transition={{ duration: 0.6, repeat: Infinity }} />
            <motion.div className="w-[3px] bg-red-400 rounded-full" animate={{ height: [10, 24, 10] }} transition={{ duration: 0.5, repeat: Infinity }} />
            <motion.div className="w-[3px] bg-red-400 rounded-full" animate={{ height: [6, 18, 6] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} />
          </div>
        )}
      </button>
    </div>
  );
}
