import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoIntro({ onComplete }) {
  const [show, setShow] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if intro was already shown this session
    if (sessionStorage.getItem('withu_intro_seen')) {
      setShow(false);
      onComplete?.();
      return;
    }

    // Fallback: auto-dismiss after 7 seconds if video doesn't play
    const fallback = setTimeout(() => {
      handleDone();
    }, 7000);

    return () => clearTimeout(fallback);
  }, []);

  const handleDone = () => {
    sessionStorage.setItem('withu_intro_seen', '1');
    setShow(false);
    onComplete?.();
  };

  const handleVideoEnd = () => {
    setTimeout(handleDone, 300);
  };

  const handleVideoError = () => {
    handleDone();
  };

  const handleCanPlay = () => {
    setVideoReady(true);
    videoRef.current?.play().catch(() => {});
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="logo-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDone}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            cursor: 'pointer',
          }}
        >
          <video
            ref={videoRef}
            src="/logo-intro.mp4"
            autoPlay
            muted
            playsInline
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              background: '#000000',
              display: videoReady ? 'block' : 'none',
            }}
          />

          {/* Loading pulse while video loads */}
          {!videoReady && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>W</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '0.2em' }}>
                WITH_U
              </span>
            </div>
          )}

          {/* Skip hint */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            tap to skip
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
