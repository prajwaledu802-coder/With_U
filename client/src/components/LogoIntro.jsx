import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoIntro({ onComplete }) {
  const [show, setShow] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if intro was already shown this session
    if (sessionStorage.getItem('withu_intro_seen')) {
      setShow(false);
      onComplete?.();
      return;
    }

    // Fallback: auto-dismiss after 8 seconds if video doesn't load
    const fallback = setTimeout(() => {
      handleDone();
    }, 8000);

    return () => clearTimeout(fallback);
  }, []);

  const handleDone = () => {
    sessionStorage.setItem('withu_intro_seen', '1');
    setShow(false);
    onComplete?.();
  };

  const handleVideoEnd = () => {
    // Small delay after video ends for smooth transition
    setTimeout(handleDone, 400);
  };

  const handleVideoError = () => {
    // If video fails to load, skip intro
    handleDone();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="logo-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: '#0a0812' }}
          onClick={handleDone}
        >
          {/* Gradient glow behind video */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 60%)',
            }}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg"
          >
            <video
              ref={videoRef}
              src="/logo-intro.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              className="w-full h-auto rounded-2xl"
              style={{ maxHeight: '70vh' }}
            />
          </motion.div>

          {/* Skip hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 text-white/40 text-xs tracking-widest uppercase cursor-pointer hover:text-white/70 transition-colors"
          >
            tap to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
