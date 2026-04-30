import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Pill, Check, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import med from '../services/medicationService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mounted once in DashboardLayout. Polls /api/medications/due every 30s.
 * When a dose is due:
 *   1) shows a fixed in-app banner (top-right)
 *   2) plays a soft chime
 *   3) fires a Web Notification (if permission granted)
 *   4) ack's the reminder so it doesn't fire again for the same slot
 */
const POLL_MS = 15 * 1000;

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.frequency.value = 880;
    o2.frequency.value = 1320;
    o1.type = 'sine';
    o2.type = 'sine';
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
    o1.connect(g); o2.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start(ctx.currentTime + 0.18);
    o1.stop(ctx.currentTime + 1.5);
    o2.stop(ctx.currentTime + 1.5);
    setTimeout(() => ctx.close(), 1700);
  } catch {}
};

export default function MedicationReminders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [due, setDue] = useState([]);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const seenSlotRef = useRef(new Set()); // medId+slot -> shown

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const poll = async () => {
      try {
        const { due: list = [] } = await med.due();
        if (!mounted) return;
        const fresh = list.filter((m) => {
          const key = `${m._id}|${m.dueSlot || m.nextDoseAt}`;
          if (seenSlotRef.current.has(key)) return false;
          seenSlotRef.current.add(key);
          return true;
        });

        if (fresh.length) {
          setDue((prev) => [...fresh, ...prev].slice(0, 4));
          playChime();
          fresh.forEach((m) => {
            // Acknowledge so the server stops returning it
            med.acknowledge(m._id).catch(() => {});
            // Web Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                const n = new Notification(`💊 Time for ${m.name}`, {
                  body: m.dosage ? `${m.dosage} · WITH_U reminder` : 'WITH_U reminder',
                  tag: `med-${m._id}`,
                  silent: true,
                });
                n.onclick = () => {
                  window.focus();
                  navigate('/app/medications');
                  n.close();
                };
              } catch {}
            }
            toast.custom(
              (tt) => (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-2xl shadow-violet-900/40 max-w-sm">
                  <span className="text-xl">{m.icon || '💊'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">Time for {m.name}</div>
                    <div className="text-[11px] opacity-85">
                      {m.dosage || 'Take when you can'} · tap to open
                    </div>
                  </div>
                  <button
                    onClick={() => { navigate('/app/medications'); toast.dismiss(tt.id); }}
                    className="text-[11px] px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25"
                  >Open</button>
                </div>
              ),
              { duration: 8000, position: 'top-right' }
            );
          });
        }
      } catch {}
    };

    // ask permission once after the user clicks anywhere
    if ('Notification' in window && Notification.permission === 'default' && !permissionAsked) {
      const handler = () => {
        setPermissionAsked(true);
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', handler);
      };
      window.addEventListener('click', handler, { once: true });
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { mounted = false; clearInterval(id); };
  }, [user, permissionAsked, navigate]);

  const dismiss = (id) => setDue((arr) => arr.filter((m) => m._id !== id));

  const handleTaken = async (m) => {
    try {
      await med.markTaken(m._id);
      toast.success(`Logged ${m.name} 🌱`);
      dismiss(m._id);
    } catch {
      toast.error('Could not log');
    }
  };

  if (!due.length) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {due.map((m) => (
          <motion.div
            key={m._id}
            layout
            initial={{ x: 80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="pointer-events-auto rounded-2xl border backdrop-blur-2xl p-4 shadow-2xl shadow-violet-900/40 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${m.color}33, rgba(20,15,40,0.92))`,
              borderColor: `${m.color}55`,
            }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-40 blur-2xl"
              style={{ background: m.color }} />

            <div className="relative flex items-start gap-3">
              <div className="text-3xl">{m.icon || '💊'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Bell size={11} className="text-amber-300 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-amber-300/80">Due now</span>
                </div>
                <div className="text-sm font-semibold text-white truncate">{m.name}</div>
                {m.dosage && <div className="text-[11px] text-white/70 mt-0.5">{m.dosage}</div>}
                {m.notes && <div className="text-[11px] text-white/55 italic mt-1">{m.notes}</div>}
              </div>
              <button
                onClick={() => dismiss(m._id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40"
                aria-label="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            <div className="relative flex gap-2 mt-3">
              <button
                onClick={() => handleTaken(m)}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-emerald-400/25 hover:bg-emerald-400/35 border border-emerald-300/40 text-emerald-50 inline-flex items-center justify-center gap-1.5"
              >
                <Check size={12} /> Mark taken
              </button>
              <button
                onClick={() => { navigate('/app/medications'); dismiss(m._id); }}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/85 inline-flex items-center justify-center gap-1.5"
              >
                <Pill size={12} /> Open
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
