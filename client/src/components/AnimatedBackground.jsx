import { useEffect, useRef } from 'react';

export default function AnimatedBackground({ variant = 'landing' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];
    const count = variant === 'landing' ? 20 : 8;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;

      Object.assign(p.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        background: i % 2 === 0
          ? 'rgba(220, 169, 122, 0.6)'
          : 'rgba(148, 180, 145, 0.6)',
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      });

      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [variant]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Primary warm orb */}
      <div
        className="orb orb-warm animate-orb-1"
        style={{ width: '600px', height: '600px', top: '-10%', left: '-5%' }}
      />
      {/* Secondary sage orb */}
      <div
        className="orb orb-sage animate-orb-2"
        style={{ width: '500px', height: '500px', bottom: '-5%', right: '-5%' }}
      />
      {/* Subtle amber accent */}
      {variant === 'landing' && (
        <div
          className="orb orb-amber animate-breathe"
          style={{ width: '400px', height: '400px', top: '40%', left: '30%' }}
        />
      )}
    </div>
  );
}
