import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Pill, Plus, Phone, Bell, Check, Trash2, Edit3,
  Clock, Sparkles, X, Save, Calendar, BellRing, BellOff, AlertTriangle, MessageSquare, Mail, ToggleLeft, ToggleRight,
} from 'lucide-react';
import med from '../services/medicationService';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#fb7185'];
const ICONS = ['💊', '💉', '🩹', '🌿', '🧪', '🧬', '🟣', '🩸'];
const FREQ = [
  { id: 'once', label: 'Once', defaultTimes: ['09:00'] },
  { id: 'daily', label: 'Daily', defaultTimes: ['08:00'] },
  { id: 'twice', label: 'Twice', defaultTimes: ['08:00', '20:00'] },
  { id: 'thrice', label: 'Thrice', defaultTimes: ['08:00', '14:00', '20:00'] },
  { id: 'as_needed', label: 'As needed', defaultTimes: [] },
  { id: 'custom', label: 'Custom', defaultTimes: [] },
];
const PHONE_PRESETS = [
  { label: 'Primary (9916220476)', number: '9916220476' },
];
const MED_PRESETS = [
  { name: 'Paracetamol', dosage: '500 mg', icon: '💊' },
  { name: 'Ibuprofen', dosage: '400 mg', icon: '💊' },
  { name: 'Amoxicillin', dosage: '500 mg', icon: '💉' },
  { name: 'Cetirizine', dosage: '10 mg', icon: '💊' },
  { name: 'Omeprazole', dosage: '20 mg', icon: '🩹' },
  { name: 'Vitamin D3', dosage: '60000 IU', icon: '🌿' },
  { name: 'Vitamin B12', dosage: '1500 mcg', icon: '🌿' },
  { name: 'Iron (Ferrous Sulfate)', dosage: '325 mg', icon: '🧪' },
  { name: 'Calcium + D3', dosage: '500 mg', icon: '🧬' },
  { name: 'Metformin', dosage: '500 mg', icon: '💊' },
  { name: 'Atorvastatin', dosage: '10 mg', icon: '💊' },
  { name: 'Levothyroxine', dosage: '50 mcg', icon: '🧪' },
  { name: 'Amlodipine', dosage: '5 mg', icon: '💊' },
  { name: 'Pantoprazole', dosage: '40 mg', icon: '🩹' },
  { name: 'Multivitamin', dosage: '1 tablet', icon: '🌿' },
  { name: 'Melatonin', dosage: '3 mg', icon: '🟣' },
  { name: 'Escitalopram', dosage: '10 mg', icon: '🧬' },
  { name: 'Sertraline', dosage: '50 mg', icon: '🧬' },
];
const emptyForm = { name: '', dosage: '', notes: '', duration: '', effects: '', effectNotes: '', timing: '', frequency: 'daily', times: ['08:00'], countryCode: '+91', mobileNumber: '9916220476', reminderEmail: '', enableWhatsApp: true, enableEmail: true, enableSMS: true, color: COLORS[0], icon: ICONS[0] };

/* ─── Notification Permission Banner ─── */
function NotifBanner() {
  const [perm, setPerm] = useState('Notification' in window ? Notification.permission : 'denied');
  const ask = () => {
    if ('Notification' in window) Notification.requestPermission().then(p => setPerm(p));
  };
  if (perm === 'granted') return (
    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/20 p-4 flex items-center gap-3">
      <BellRing size={18} className="text-emerald-600 dark:text-emerald-400" />
      <div className="flex-1"><div className="text-sm font-medium text-emerald-700 dark:text-emerald-200">Notifications active</div><div className="text-[11px] text-slate-500 dark:text-white/40">You'll get browser + in-app reminders when doses are due</div></div>
      <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
    </div>
  );
  if (perm === 'denied') return (
    <div className="rounded-2xl bg-red-500/10 border border-red-400/20 p-4 flex items-center gap-3">
      <BellOff size={18} className="text-red-500 dark:text-red-400" />
      <div className="flex-1"><div className="text-sm font-medium text-red-700 dark:text-red-200">Notifications blocked</div><div className="text-[11px] text-slate-500 dark:text-white/40">Enable in browser settings for dose reminders</div></div>
      <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
    </div>
  );
  return (
    <div className="rounded-2xl bg-amber-500/10 border border-amber-400/20 p-4 flex items-center gap-3">
      <Bell size={18} className="text-amber-600 dark:text-amber-400" />
      <div className="flex-1"><div className="text-sm font-medium text-amber-800 dark:text-amber-200">Enable notifications?</div><div className="text-[11px] text-slate-500 dark:text-white/40">Get gentle reminders when your dose is due</div></div>
      <button onClick={ask} className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-800 dark:text-amber-100 hover:bg-amber-500/30 font-medium">Enable</button>
    </div>
  );
}

/* ─── Today's Schedule Timeline ─── */
function TodayTimeline({ meds }) {
  const now = new Date();
  const h = now.getHours();
  const slots = [];
  meds.forEach(m => {
    (m.times || []).forEach(t => {
      const [th, tm] = t.split(':').map(Number);
      const isPast = th < h || (th === h && tm <= now.getMinutes());
      const isTaken = m.lastTakenAt && new Date(m.lastTakenAt).toDateString() === now.toDateString() && new Date(m.lastTakenAt).getHours() >= th - 1;
      slots.push({ time: t, name: m.name, icon: m.icon, color: m.color, isPast, isTaken, id: m._id });
    });
  });
  slots.sort((a, b) => a.time.localeCompare(b.time));
  if (!slots.length) return null;
  return (
    <div className="rounded-2xl border border-violet-200 dark:border-white/[0.08] backdrop-blur-xl p-5 relative overflow-hidden bg-violet-50 dark:bg-transparent" style={{ '--tw-bg-opacity': undefined }}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mb-3">Today's Schedule</div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {slots.map((s, i) => (
          <div key={i} className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${s.isTaken ? 'bg-emerald-500/15 border-emerald-400/25' : s.isPast ? 'bg-red-500/10 border-red-400/15 opacity-60' : 'bg-white/[0.04] border-white/[0.06]'}`}>
            <span className="text-lg">{s.icon}</span>
            <span className="text-[11px] font-medium text-slate-700 dark:text-white/80 max-w-[80px] truncate">{s.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-white/50">{s.time}</span>
            {s.isTaken && <Check size={12} className="text-emerald-400" />}
            {!s.isTaken && s.isPast && <span className="text-[9px] text-red-300">Missed</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Adherence Stats ─── */
function AdherenceStats({ meds }) {
  const totalStreak = Math.max(0, ...meds.map(m => m.streak || 0));
  const totalMeds = meds.length;
  const now = new Date();
  const todayStr = now.toDateString();
  const takenToday = meds.filter(m => m.lastTakenAt && new Date(m.lastTakenAt).toDateString() === todayStr).length;
  const pct = totalMeds ? Math.round((takenToday / totalMeds) * 100) : 0;
  const C = 2 * Math.PI * 30;
  const off = C - (pct / 100) * C;
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-white/[0.08] backdrop-blur-xl p-5 relative overflow-hidden bg-emerald-50 dark:bg-transparent">
      <div className="flex items-center gap-5">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <motion.circle cx="35" cy="35" r="30" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: off }} transition={{ duration: 1 }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-300">{pct}%</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800 dark:text-white/85">Today's Adherence</div>
          <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{takenToday}/{totalMeds} medications taken</div>
          {totalStreak > 0 && <div className="text-xs text-amber-600 dark:text-amber-300 mt-1">🔥 {totalStreak}-day best streak</div>}
        </div>
      </div>
    </div>
  );
}

/* ─── Med Card ─── */
function MedCard({ m, onTaken, onRemind, onEdit, onDelete, onResendConfirm }) {
  const dueIn = m.nextDoseInMinutes;
  const dueLabel = dueIn == null ? 'No schedule' : dueIn <= 0 ? 'Due now' : dueIn < 60 ? `In ${dueIn} min` : dueIn < 1440 ? `In ${Math.round(dueIn / 60)} h` : `In ${Math.round(dueIn / 1440)} d`;
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl p-5 border backdrop-blur-xl relative overflow-hidden group"
      style={{ background: `linear-gradient(135deg, ${m.color}1a 0%, rgba(255,255,255,0.04) 100%)`, borderColor: `${m.color}33` }}>
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30 blur-2xl" style={{ background: m.color }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-3xl shrink-0">{m.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-slate-800 dark:text-white/90 truncate">{m.name}</div>
            {m.dosage && <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{m.dosage}</div>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/60"><Clock size={10} className="inline mr-1" />{dueLabel}</span>
              {m.times?.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60">{m.times.map(t => { const h=parseInt(t); const mm=t.split(':')[1]; const ap=h>=12?'PM':'AM'; const h12=h===0?12:h>12?h-12:h; return `${h12}:${mm} ${ap}`; }).join(' · ')}</span>}
              {m.streak > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/20 text-amber-200">🔥 {m.streak}d</span>}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-white/40 mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1"><Phone size={10} /> {m.countryCode} {m.mobileNumber}</span>
              {m.reminderEmail && <span className="inline-flex items-center gap-1"><Mail size={10} /> {m.reminderEmail}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {m.enableWhatsApp !== false && <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/15 border border-green-400/20 text-green-300">📱 WhatsApp</span>}
              {m.enableSMS !== false && <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/20 text-orange-300">💬 SMS</span>}
              {m.enableEmail !== false && m.reminderEmail && (
                m.verified
                  ? <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300">📧 Email ✓</span>
                  : <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/20 text-amber-300 cursor-pointer" onClick={() => onResendConfirm?.(m._id)} title="Click to resend confirmation email">📧 Unverified — click to resend</span>
              )}
            </div>
            {m.notes && <div className="text-[11px] text-slate-500 dark:text-white/55 mt-2 italic">"{m.notes}"</div>}
            {(m.duration || m.effects) && (
              <div className="mt-2 text-[11px] px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-400/15 text-blue-200">
                <Sparkles size={11} className="inline mr-1" />
                {`You're taking ${m.name}${m.duration ? ` for ${m.duration}` : ''}.`}
                {m.effects === 'good' && ' Great — positive results!'}
                {m.effects === 'side_effects' && ' Some side effects noted.'}
                {m.effects === 'no_change' && ' No change yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative flex flex-wrap items-center gap-1.5 mt-4">
        <button onClick={() => onTaken(m._id)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/25 text-emerald-200 inline-flex items-center gap-1.5"><Check size={12} /> Taken</button>
        <button onClick={() => onRemind(m._id)} className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-400/25 text-violet-700 dark:text-violet-200 inline-flex items-center gap-1.5" title="Send WhatsApp + Email reminder"><Bell size={12} /> Remind All</button>
        <button onClick={() => med.openWhatsApp(m.mobileNumber, m.name, m.dosage)} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-400/25 text-green-700 dark:text-green-200 inline-flex items-center gap-1.5">📱 WhatsApp</button>
        <div className="ml-auto flex gap-1">
          <button onClick={() => onEdit(m)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/90"><Edit3 size={13} /></button>
          <button onClick={() => onDelete(m._id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-300"><Trash2 size={13} /></button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Custom Time Picker ─── */
function TimePicker({ value, onChange, onRemove }) {
  const [h24, mn] = (value || '08:00').split(':').map(Number);
  const isPM = h24 >= 12;
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const set = (hv, mv, pm) => { let hh = pm ? (hv === 12 ? 12 : hv + 12) : (hv === 12 ? 0 : hv); onChange(`${String(hh).padStart(2,'0')}:${String(mv).padStart(2,'0')}`); };
  const sel = "px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-800 dark:text-white/90 focus:outline-none focus:ring-1 focus:ring-violet-400 appearance-none cursor-pointer";
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-2">
      <Clock size={13} className="text-violet-500 dark:text-violet-300 shrink-0" />
      <select value={h12} onChange={e => set(+e.target.value, mn, isPM)} className={sel}>
        {[12,1,2,3,4,5,6,7,8,9,10,11].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <span className="text-slate-400 dark:text-white/40 font-bold">:</span>
      <select value={mn} onChange={e => set(h12, +e.target.value, isPM)} className={sel}>
        {Array.from({length:12},(_,i)=>i*5).map(v => <option key={v} value={v}>{String(v).padStart(2,'0')}</option>)}
      </select>
      <select value={isPM ? 'PM' : 'AM'} onChange={e => set(h12, mn, e.target.value === 'PM')} className={`${sel} font-semibold text-violet-600 dark:text-violet-300`}>
        <option>AM</option><option>PM</option>
      </select>
      {onRemove && <button onClick={onRemove} className="ml-auto p-0.5 text-slate-400 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400"><X size={13} /></button>}
    </div>
  );
}

/* ─── Form Modal ─── */
function MedForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFreq = (id) => { const o = FREQ.find(f => f.id === id); setForm(f => ({ ...f, frequency: id, times: o?.defaultTimes?.length ? o.defaultTimes : f.times })); };
  const updateTime = (i, v) => setForm(f => { const t = [...f.times]; t[i] = v; return { ...f, times: t }; });
  const submit = async () => {
    if (!form.name.trim()) return toast.error('Add a name');
    const d = form.mobileNumber.replace(/\D/g, '');
    if (d.length < 10 || d.length > 15) return toast.error('Mobile: 10-15 digits');
    setSubmitting(true);
    try { await onSave(form); onClose(); } catch (e) { toast.error(e.message || 'Could not save'); } finally { setSubmitting(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-gradient-to-br dark:from-violet-950/95 dark:to-slate-950/95 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2"><Pill size={18} className="text-violet-500 dark:text-violet-300" />{initial ? 'Edit' : 'Add'} Medication</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/50"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          {/* Quick pick medicine */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">Quick Pick Medicine</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {MED_PRESETS.map(p => (
                <button key={p.name} onClick={() => { sf('name', p.name); sf('dosage', p.dosage); sf('icon', p.icon); }}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${form.name === p.name ? 'bg-violet-500/15 border-violet-400/40 text-violet-700 dark:text-violet-100 font-medium' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/55 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Name *</label><input value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Or type custom…" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40" /></div>
            <div><label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Dosage</label><input value={form.dosage} onChange={e => sf('dosage', e.target.value)} placeholder="e.g. 500 mg" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40" /></div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Mobile * <span className="text-violet-500 dark:text-violet-300/70 normal-case tracking-normal">(for WhatsApp)</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PHONE_PRESETS.map(p => (
                <button key={p.number} onClick={() => sf('mobileNumber', p.number)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${form.mobileNumber === p.number ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-100 font-medium' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/55 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}>
                  📱 {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={form.countryCode} onChange={e => sf('countryCode', e.target.value)} placeholder="+91" maxLength={5} className="w-20 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
              <input value={form.mobileNumber} onChange={e => sf('mobileNumber', e.target.value)} placeholder="9876543210" className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Reminder Email <span className="text-blue-500 dark:text-blue-300/70 normal-case tracking-normal">(for email notifications)</span></label>
            <input value={form.reminderEmail} onChange={e => sf('reminderEmail', e.target.value)} placeholder="your@email.com" type="email" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-2 block font-medium">Notification Channels</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => sf('enableWhatsApp', !form.enableWhatsApp)}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all ${form.enableWhatsApp ? 'bg-green-500/15 border-green-400/40 text-green-700 dark:text-green-100' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-white/40 line-through'}`}>
                {form.enableWhatsApp ? <ToggleRight size={14} className="text-green-500 dark:text-green-400" /> : <ToggleLeft size={14} />} 📱 WhatsApp
              </button>
              <button type="button" onClick={() => sf('enableEmail', !form.enableEmail)}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all ${form.enableEmail ? 'bg-blue-500/15 border-blue-400/40 text-blue-700 dark:text-blue-100' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-white/40 line-through'}`}>
                {form.enableEmail ? <ToggleRight size={14} className="text-blue-500 dark:text-blue-400" /> : <ToggleLeft size={14} />} 📧 Email
              </button>
              <button type="button" onClick={() => sf('enableSMS', !form.enableSMS)}
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all ${form.enableSMS ? 'bg-orange-500/15 border-orange-400/40 text-orange-700 dark:text-orange-100' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-white/40 line-through'}`}>
                {form.enableSMS ? <ToggleRight size={14} className="text-orange-500 dark:text-orange-400" /> : <ToggleLeft size={14} />} 💬 SMS
              </button>
            </div>
            {form.enableEmail && !form.reminderEmail && <p className="text-[10px] text-amber-600 dark:text-amber-300/70 mt-1.5">⚠️ Add an email above to receive email reminders</p>}
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Frequency</label>
            <div className="grid grid-cols-3 gap-2">{FREQ.map(o => <button key={o.id} onClick={() => setFreq(o.id)} className={`text-xs px-3 py-2 rounded-xl border transition-all ${form.frequency === o.id ? 'bg-violet-500/15 border-violet-400/40 text-violet-700 dark:text-violet-100 font-medium' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/55 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}>{o.label}</button>)}</div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-2 block font-medium flex items-center justify-between"><span>⏰ Reminder Times</span><button onClick={() => setForm(f => ({ ...f, times: [...f.times, '08:00'] }))} className="text-[10px] text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 normal-case tracking-normal font-semibold">+ Add Time</button></label>
            <div className="space-y-2">
              {form.times.map((t, i) => (
                <TimePicker key={i} value={t} onChange={v => updateTime(i, v)} onRemove={form.times.length > 1 ? () => setForm(f => ({ ...f, times: f.times.filter((_, idx) => idx !== i) })) : null} />
              ))}
              {form.times.length === 0 && <p className="text-[11px] text-slate-400 dark:text-white/40 italic py-2">No times set — reminders off</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Color</label><div className="flex gap-1.5">{COLORS.map(c => <button key={c} onClick={() => sf('color', c)} className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-110 ring-2 ring-violet-400' : 'hover:scale-105'}`} style={{ background: c }} />)}</div></div>
            <div><label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Icon</label><div className="flex flex-wrap gap-1">{ICONS.map(i => <button key={i} onClick={() => sf('icon', i)} className={`w-8 h-8 rounded-lg text-base transition-all ${form.icon === i ? 'bg-violet-100 dark:bg-violet-500/30 ring-1 ring-violet-400' : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'}`}>{i}</button>)}</div></div>
          </div>
          <div><label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Notes</label><textarea value={form.notes} onChange={e => sf('notes', e.target.value)} placeholder="With food, before bed…" rows={2} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 resize-none focus:outline-none focus:border-violet-400/40" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Duration</label>
              <input value={form.duration} onChange={e => sf('duration', e.target.value)} placeholder="e.g. 5 days, 2 weeks" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 mb-1 block font-medium">Timing</label>
              <div className="flex gap-1.5">
                {['morning', 'afternoon', 'night'].map(t => (
                  <button key={t} onClick={() => sf('timing', form.timing === t ? '' : t)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border capitalize transition-all ${form.timing === t ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-700 dark:text-cyan-100 font-medium' : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/55 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}>
                    {t === 'morning' ? '☀️' : t === 'afternoon' ? '🌤️' : '🌙'} {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1 block">Effects</label>
            <div className="flex gap-2 mb-2">
              {[{id:'good',label:'✅ Good',cls:'emerald'},{id:'side_effects',label:'⚠️ Side Effects',cls:'amber'},{id:'no_change',label:'➖ No Change',cls:'gray'}].map(o => (
                <button key={o.id} onClick={() => sf('effects', form.effects === o.id ? '' : o.id)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${form.effects === o.id ? `bg-${o.cls}-500/15 border-${o.cls}-400/30 text-${o.cls}-700 dark:text-${o.cls}-100 font-medium` : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/55 hover:bg-slate-100 dark:hover:bg-white/[0.08]'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            {form.effects === 'side_effects' && (
              <input value={form.effectNotes} onChange={e => sf('effectNotes', e.target.value)} placeholder="Describe side effects…" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-white/90 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
            )}
          </div>
          <div className="flex gap-2 pt-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">Cancel</button>
            <button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"><Save size={14} />{submitting ? 'Saving…' : 'Save Medication'}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function Medications() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [canonicalMobile, setCanonicalMobile] = useState(null);

  const refresh = async () => { try { const r = await med.list(); setMeds(r.medications || []); setCanonicalMobile(r.canonicalMobile); } catch { toast.error('Could not load medications'); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);
  useEffect(() => { try { const raw = sessionStorage.getItem('aira_med_prefill'); if (raw) { const p = JSON.parse(raw); sessionStorage.removeItem('aira_med_prefill'); setEditing({ ...emptyForm, name: p.name || '', times: p.times?.length ? p.times : emptyForm.times, mobileNumber: p.phone?.replace(/^\+\d{1,3}/, '') || '', countryCode: p.phone?.match(/^\+\d{1,3}/)?.[0] || '+91' }); setOpen(true); toast('Aira prefilled details — review and save', { icon: '✨' }); } } catch {} }, []);

  const handleSave = async (form) => {
    if (editing?._id) {
      const r = await med.update(editing._id, form);
      setMeds(a => a.map(m => m._id === editing._id ? r.medication : m));
      toast.success('Updated');
    } else {
      const r = await med.create(form);
      setMeds(a => [r.medication, ...a]);
      if (r.confirmationEmailSent) {
        toast.success('Medication added! Check your email to confirm reminders.', { duration: 6000, icon: '📧' });
      } else if (r.message) {
        toast.success(r.message, { duration: 4000 });
      } else {
        toast.success('Added');
      }
    }
    setEditing(null);
    refresh();
  };
  const handleDelete = async (id) => { if (!confirm('Remove?')) return; try { await med.remove(id); setMeds(a => a.filter(m => m._id !== id)); toast.success('Removed'); } catch { toast.error('Could not remove'); } };
  const handleTaken = async (id) => { try { const r = await med.markTaken(id); setMeds(a => a.map(m => m._id === id ? r.medication : m)); toast.success('Logged 🌱'); } catch { toast.error('Could not log'); } };
  const handleRemind = async (id) => { try { const r = await med.remindNow(id); if ('Notification' in window && Notification.permission === 'granted' && r.notification) { try { new Notification(r.notification.title, { body: r.notification.body, tag: `med-now-${id}`, silent: true }); } catch {} } else if ('Notification' in window && Notification.permission === 'default') { Notification.requestPermission().catch(() => {}); } const ch = r.channels?.length ? r.channels.join(' + ') : 'notification'; const isMock = r.sms?.mock && (!r.whatsapp || r.whatsapp.simulated) && (!r.email || r.email.mock); toast.success(isMock ? `Reminder sent via ${ch} (demo)` : `Reminder sent via ${ch}`); } catch { toast.error('Could not send'); } };
  const handleResendConfirm = async (id) => {
    try {
      const r = await med.resendConfirmation(id);
      if (r.verified) { toast.success('Already verified!'); refresh(); }
      else toast.success(r.message || 'Confirmation email re-sent. Check your inbox.', { duration: 5000, icon: '📧' });
    } catch { toast.error('Could not resend confirmation'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
            <span>💊</span>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">Smart Medication</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-1.5 max-w-xl">Gentle reminders that travel with you. The number you save here is used everywhere.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-sm font-medium hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg shadow-violet-500/30">
          <Plus size={16} /> Add medication
        </button>
      </div>

      <NotifBanner />

      {canonicalMobile?.full && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-500/8 to-fuchsia-500/8 border border-violet-200 dark:border-violet-400/15 p-4 flex items-center gap-3">
          <Phone size={16} className="text-violet-500 dark:text-violet-300" /><div className="flex-1 min-w-0"><div className="text-xs uppercase tracking-wider text-slate-400 dark:text-white/40">Reminder number</div><div className="text-sm text-slate-700 dark:text-white/85 font-medium">{canonicalMobile.full}</div></div><Sparkles size={14} className="text-fuchsia-500 dark:text-fuchsia-300" />
        </div>
      )}

      {!loading && meds.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <TodayTimeline meds={meds} />
          <AdherenceStats meds={meds} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] animate-pulse" />)}</div>
      ) : meds.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] border-dashed">
          <div className="text-5xl mb-3">🌿</div><p className="text-base text-slate-700 dark:text-white/70 font-medium">No medications yet</p><p className="text-xs text-slate-400 dark:text-white/40 mt-1.5">Add your first one to enable gentle reminders.</p>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-400/25 text-sm text-violet-700 dark:text-violet-200 hover:bg-violet-500/25"><Plus size={14} /> Add medication</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><AnimatePresence>{meds.map(m => <MedCard key={m._id} m={m} onTaken={handleTaken} onRemind={handleRemind} onEdit={(m) => { setEditing({ ...m }); setOpen(true); }} onDelete={handleDelete} onResendConfirm={handleResendConfirm} />)}</AnimatePresence></div>
      )}

      <AnimatePresence>{open && <MedForm initial={editing} onSave={handleSave} onClose={() => { setOpen(false); setEditing(null); }} />}</AnimatePresence>
    </div>
  );
}
