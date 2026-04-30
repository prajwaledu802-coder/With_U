import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import QuickRelief from './pages/QuickRelief';
import ERCompanion from './pages/ERCompanion';
import Medications from './pages/Medications';
import MoodSense from './pages/MoodSense';
import GentleSearch from './pages/Emergency';
import Settings from './pages/Settings';
import CallAira from './pages/CallAira';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LogoIntro from './components/LogoIntro';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

export default function App() {
  const location = useLocation();
  const [introComplete, setIntroComplete] = useState(
    () => !!sessionStorage.getItem('withu_intro_seen')
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.card-hover-glow, .btn-primary, .btn-ghost');
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        // Ensure buttons have overflow hidden for glow
        if (card.classList.contains('btn-primary') || card.classList.contains('btn-ghost')) {
          if (!card.classList.contains('card-hover-glow')) {
            card.classList.add('card-hover-glow');
          }
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Logo Intro Splash Screen */}
      {!introComplete && (
        <LogoIntro onComplete={() => setIntroComplete(true)} />
      )}

      <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={!introComplete ? { visibility: 'hidden' } : undefined}
      >
        <Routes location={location}>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Central Hub & Features */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-companion" element={<ERCompanion />} />
            <Route path="/smart-medication" element={<Medications />} />
            <Route path="/quick-relief" element={<QuickRelief />} />
            <Route path="/moodsense" element={<MoodSense />} />
            <Route path="/gentle-search" element={<GentleSearch />} />
            <Route path="/call-aira" element={<CallAira />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Legacy redirects */}
            <Route path="/smart-diagnosis" element={<Navigate to="/smart-medication" replace />} />
            <Route path="/quiet-corner" element={<Navigate to="/quick-relief" replace />} />
            <Route path="/emergency" element={<Navigate to="/gentle-search" replace />} />
            <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
