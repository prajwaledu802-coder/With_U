import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground variant="auth" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 relative z-10">
        <GlassCard strong className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white mx-auto mb-4 shadow-glow"
          >
            <Compass size={28} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
          </motion.div>
          <h1 className="text-2xl font-semibold mb-2">A quiet corner</h1>
          <p className="opacity-70 text-sm mb-6">
            This page doesn't exist — but that's okay. Let's take you somewhere familiar.
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} /> Take me home
          </Link>
        </GlassCard>
      </main>
    </div>
  );
}
