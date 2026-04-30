import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneCall, PhoneOff, Mic, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const WAVE_BARS = 24;

export default function CallAira() {
  const { t } = useTranslation();
  const [callState, setCallState] = useState('idle'); // idle | calling | connected | error
  const [phone, setPhone] = useState('9916220476');
  const [callError, setCallError] = useState('');
  const [callResult, setCallResult] = useState(null);

  const handleCall = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { setCallError(t('callAira.invalidPhone')); return; }
    setCallState('calling'); setCallError('');
    try {
      const { data } = await api.post('/api/call/call-aira', { phone: cleaned });
      if (data.success) {
        setCallState('connected');
        setCallResult(data);
      } else {
        setCallState('error');
        setCallError(data.message || 'Call failed');
      }
    } catch (err) {
      setCallState('error');
      setCallError(err.response?.data?.message || err.message || 'Could not connect');
    }
  };

  const handleEndCall = () => {
    setCallState('idle');
    setCallResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
          📞 {t('callAira.title')}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-2">
          {t('callAira.subtitle')}
        </p>
      </div>

      {/* Call Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white/80 dark:bg-white/[0.04] border border-black/5 dark:border-white/[0.08] backdrop-blur-xl p-8 shadow-xl"
      >
        {/* Visual */}
        <div className="flex flex-col items-center space-y-6">
          {/* Aira Avatar */}
          <motion.div
            animate={callState === 'connected' ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 0 20px rgba(139,92,246,0.15)', '0 0 0 0 rgba(139,92,246,0)'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl ${
              callState === 'connected' ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-2 border-green-400/40'
              : callState === 'calling' ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border-2 border-amber-400/40'
              : 'bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border-2 border-violet-400/30'
            }`}
          >
            {callState === 'connected' ? '🗣️' : callState === 'calling' ? '📡' : '🤖'}
          </motion.div>

          {/* Status Text */}
          <AnimatePresence mode="wait">
            <motion.div key={callState} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
              {callState === 'idle' && (
                <p className="text-lg font-semibold text-black/70 dark:text-white/80">{t('callAira.readyToCall')}</p>
              )}
              {callState === 'calling' && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-300">{t('callAira.callingPhone')}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{t('callAira.pickUp')}</p>
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex justify-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </motion.div>
                </div>
              )}
              {callState === 'connected' && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-600 dark:text-green-300">📱 {t('callAira.callInitiated')}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{t('callAira.phoneRinging')}</p>
                  {/* Audio wave animation */}
                  <div className="flex items-center justify-center gap-[2px] h-8 mt-3">
                    {Array.from({ length: WAVE_BARS }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, Math.random() * 20 + 8, 4] }}
                        transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 }}
                        className="w-1 rounded-full bg-green-400/60"
                      />
                    ))}
                  </div>
                </div>
              )}
              {callState === 'error' && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-red-600 dark:text-red-300">{t('callAira.callFailed')}</p>
                  <p className="text-xs text-red-500/70">{callError}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Phone Input */}
          {(callState === 'idle' || callState === 'error') && (
            <div className="w-full max-w-sm space-y-3">
              <label className="text-xs text-black/50 dark:text-white/40 uppercase tracking-wider font-medium block">{t('callAira.phoneLabel')}</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 rounded-xl bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/[0.1] text-sm text-black/60 dark:text-white/60 font-mono">+91</span>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t('callAira.phonePlaceholder')}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/[0.1] text-sm text-black/80 dark:text-white/90 placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400/40 font-mono tracking-wider"
                />
              </div>
            </div>
          )}

          {/* Call Buttons */}
          <div className="flex gap-3">
            {(callState === 'idle' || callState === 'error') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCall}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 flex items-center gap-3 text-base hover:shadow-violet-500/40 transition-shadow"
              >
                <PhoneCall size={20} />
                {t('callAira.callNow')}
              </motion.button>
            )}
            {callState === 'calling' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndCall}
                className="px-8 py-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-600 dark:text-red-300 font-semibold flex items-center gap-3"
              >
                <PhoneOff size={20} />
                {t('callAira.cancel')}
              </motion.button>
            )}
            {callState === 'connected' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndCall}
                className="px-8 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-600 dark:text-emerald-300 font-semibold flex items-center gap-3"
              >
                <Phone size={20} />
                {t('callAira.done')}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Phone size={18} />, title: t('callAira.realCall'), desc: t('callAira.realCallDesc') },
          { icon: <Mic size={18} />, title: t('callAira.naturalConvo'), desc: t('callAira.naturalConvoDesc') },
          { icon: <Volume2 size={18} />, title: t('callAira.aiPowered'), desc: t('callAira.aiPoweredDesc') },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.06] p-5 text-center space-y-2">
            <div className="inline-flex p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">{card.icon}</div>
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80">{card.title}</h3>
            <p className="text-[11px] text-black/40 dark:text-white/40">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
