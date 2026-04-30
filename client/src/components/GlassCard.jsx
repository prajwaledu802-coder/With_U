import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  delay = 0,
  strong = false,
  hoverable = false,
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverable ? { y: -4, transition: { duration: 0.25 } } : undefined}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-3xl p-6 ${
        hoverable ? 'card-hover-glow cursor-default' : ''
      } ${className}`}
      onMouseMove={hoverable ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
