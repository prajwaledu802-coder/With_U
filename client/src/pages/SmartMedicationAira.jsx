import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Upload, Check, Bell, Phone } from 'lucide-react';
import med from '../services/medicationService';

const emptyForm = {
  name: '',
  dosage: '',
  times: '08:00',
  countryCode: '+91',
  mobileNumber: '',
};

const normalizeTimes = (raw) =>
  raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)?$/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const mm = m[2] ? parseInt(m[2], 10) : 0;
      const ap = (m[3] || '').toLowerCase();
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
      return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    })
    .filter(Boolean);

export default function SmartMedicationAira() {
  const { t } = useTranslation();
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [parseText, setParseText] = useState('');
  const [parseFile, setParseFile] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  const refresh = async () => {
    try {
      const r = await med.list();
      setMeds(r.medications || []);
    } catch {
      setMeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.mobileNumber.trim()) return;
    const times = normalizeTimes(form.times);
    const payload = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      times,
      countryCode: form.countryCode.trim(),
      mobileNumber: form.mobileNumber.trim(),
    };
    const res = await med.create(payload);
    setMeds((prev) => [res.medication, ...prev]);
    setForm(emptyForm);
  };

  const handleParse = async () => {
    if (!parseText.trim() && !parseFile) return;
    setParsing(true);
    try {
      const res = await med.parse({ text: parseText.trim(), file: parseFile });
      setParsedItems(res.items || []);
    } catch {
      setParsedItems([]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedItems.length) return;
    setImporting(true);
    try {
      for (const item of parsedItems) {
        await med.create({
          name: item.name,
          dosage: item.dosage || '',
          times: item.times || [],
          countryCode: form.countryCode.trim(),
          mobileNumber: form.mobileNumber.trim() || form.mobileNumber,
        });
      }
      setParsedItems([]);
      setParseText('');
      setParseFile(null);
      await refresh();
    } finally {
      setImporting(false);
    }
  };

  const schedule = useMemo(() => {
    const slots = [];
    meds.forEach((m) => {
      (m.times || []).forEach((t) => {
        slots.push({ time: t, name: m.name, id: m._id });
      });
    });
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [meds]);

  const sendWhatsApp = (phone, name, dosage) => {
    const msg = encodeURIComponent(`${t('meds.whatsappMsg', { name, dosage: dosage || '' })}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-semibold">
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-rose-300 bg-clip-text text-transparent">
            {t('meds.title')}
          </span>
        </h1>
        <p className="text-sm text-white/50 mt-2 max-w-lg">{t('meds.subtitle')}</p>
      </motion.div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Upload size={12} /> {t('meds.uploadTitle')}
          </div>
          <textarea
            value={parseText}
            onChange={(e) => setParseText(e.target.value)}
            placeholder={t('meds.uploadPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              onChange={(e) => setParseFile(e.target.files?.[0] || null)}
              className="text-xs text-white/50"
            />
            <button
              onClick={handleParse}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-xs text-cyan-200"
            >
              {parsing ? t('common.loading') : t('meds.parse')}
            </button>
          </div>
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-white/40">{t('meds.preview')}</div>
              {parsedItems.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                  <div>
                    <div className="text-xs text-white/80">{item.name}</div>
                    <div className="text-[10px] text-white/40">
                      {item.dosage || t('meds.noDosage')} · {(item.times || []).join(', ') || t('meds.noTimes')}
                    </div>
                  </div>
                  <Check size={12} className="text-emerald-300" />
                </div>
              ))}
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-100 disabled:opacity-50"
              >
                {importing ? t('common.loading') : t('meds.import')}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5 space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">{t('meds.addTitle')}</div>
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder={t('meds.namePlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
            />
            <input
              value={form.dosage}
              onChange={(e) => handleFormChange('dosage', e.target.value)}
              placeholder={t('meds.dosagePlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
            />
            <input
              value={form.times}
              onChange={(e) => handleFormChange('times', e.target.value)}
              placeholder={t('meds.timesPlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                value={form.countryCode}
                onChange={(e) => handleFormChange('countryCode', e.target.value)}
                placeholder="+91"
                className="w-20 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
              />
              <input
                value={form.mobileNumber}
                onChange={(e) => handleFormChange('mobileNumber', e.target.value)}
                placeholder={t('meds.phonePlaceholder')}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full px-3 py-2 rounded-xl bg-violet-500/20 border border-violet-400/30 text-xs text-violet-100"
            >
              <span className="inline-flex items-center gap-1"><Plus size={12} /> {t('meds.add')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">{t('meds.scheduleTitle')}</div>
        {loading ? (
          <div className="text-sm text-white/40">{t('common.loading')}</div>
        ) : schedule.length === 0 ? (
          <div className="text-sm text-white/40">{t('meds.noSchedule')}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {schedule.map((s) => (
              <div key={`${s.id}-${s.time}`} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70">
                {s.time} · {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {meds.map((m) => (
          <div key={m._id} className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5 space-y-2">
            <div className="text-sm text-white/80 font-medium">{m.name}</div>
            <div className="text-[11px] text-white/40">{m.dosage || t('meds.noDosage')}</div>
            <div className="text-[11px] text-white/40">{(m.times || []).join(', ') || t('meds.noTimes')}</div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => med.markTaken(m._id).then(refresh)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/25 text-[11px] text-emerald-200"
              >
                {t('meds.taken')}
              </button>
              <button
                onClick={() => med.remindNow(m._id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/25 text-[11px] text-amber-200"
              >
                <Bell size={12} className="inline mr-1" />{t('meds.remind')}
              </button>
              <button
                onClick={() => sendWhatsApp(`${m.countryCode}${m.mobileNumber}`, m.name, m.dosage)}
                className="px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-400/25 text-[11px] text-green-200"
              >
                <Phone size={12} className="inline mr-1" />{t('meds.whatsapp')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
