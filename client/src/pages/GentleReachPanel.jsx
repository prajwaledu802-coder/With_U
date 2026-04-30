import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HeartHandshake,
  Power,
  Plus,
  Trash2,
  X,
  Loader2,
  History,
  Send,
  AlertCircle,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

/* ─── Toggle ─── */
function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} id={id} />
      <div className="toggle-track" />
    </label>
  );
}

export default function GentleReachPanel() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', relation: '' });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, h] = await Promise.all([
          api.get('/api/users/settings').catch(() => ({ data: { settings: {} } })),
          api.get('/api/contacts').catch(() => ({ data: { items: [] } })),
          api.get('/api/gentlereach/history').catch(() => ({ data: { items: [] } })),
        ]);
        setEnabled(s.data.settings?.gentleReachEnabled || false);
        setContacts(c.data.items || []);
        setEvents(h.data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleEnabled = async (val) => {
    setEnabled(val);
    try {
      await api.put('/api/users/settings', { gentleReachEnabled: val });
      toast.success(val ? 'GentleReach enabled' : 'GentleReach disabled');
    } catch {
      setEnabled(!val);
      toast.error('Could not update');
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.email.trim()) return;
    setAdding(true);
    try {
      const res = await api.post('/api/contacts', {
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        relation: newContact.relation.trim() || 'Friend',
        notifyOnHighStress: true,
      });
      setContacts(c => [...c, res.data.contact]);
      setNewContact({ name: '', email: '', relation: '' });
      setAddOpen(false);
      toast.success('Contact added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const removeContact = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/contacts/${id}`);
      setContacts(c => c.filter(x => x._id !== id));
      toast.success('Contact removed');
    } catch {
      toast.error('Could not remove');
    } finally {
      setDeletingId(null);
    }
  };

  const triggerManual = async () => {
    setTriggering(true);
    try {
      const res = await api.post('/api/gentlereach/trigger');
      toast.success(res.data.mock
        ? 'GentleReach triggered (mock — no real email sent)'
        : 'GentleReach sent successfully');
      // Refresh history
      const h = await api.get('/api/gentlereach/history').catch(() => ({ data: { items: [] } }));
      setEvents(h.data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not trigger');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-warm-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <HeartHandshake size={24} className="text-warm-500" />
          GentleReach
        </h1>
        <p className="text-sm opacity-60 mt-2 max-w-lg">
          When stress builds over days, a trusted person gets a soft, anonymous note. You stay in control.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Toggle card */}
          <GlassCard strong delay={0.05}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${enabled ? 'bg-sage-400 animate-pulse-soft' : 'bg-white/30 dark:bg-white/10'}`} />
                <div>
                  <h3 className="text-base font-semibold">
                    {enabled ? 'GentleReach is ON' : 'GentleReach is OFF'}
                  </h3>
                  <p className="text-xs opacity-60">
                    {enabled
                      ? 'A trusted person will be notified if your stress worsens over several days.'
                      : 'Turn on to enable automatic notifications to your trusted contacts.'}
                  </p>
                </div>
              </div>
              <Toggle checked={enabled} onChange={toggleEnabled} id="gr-toggle" />
            </div>
          </GlassCard>

          {/* Trusted contacts */}
          <GlassCard delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Trusted Contacts</h3>
              <button onClick={() => setAddOpen(o => !o)} className="btn-ghost !py-1.5 text-xs">
                {addOpen ? <X size={14} /> : <Plus size={14} />}
                {addOpen ? 'Cancel' : 'Add'}
              </button>
            </div>

            <AnimatePresence>
              {addOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={addContact}
                  className="space-y-2 mb-4 overflow-hidden"
                >
                  <input className="input" placeholder="Name" value={newContact.name} onChange={e => setNewContact(s => ({ ...s, name: e.target.value }))} required />
                  <input type="email" className="input" placeholder="Email" value={newContact.email} onChange={e => setNewContact(s => ({ ...s, email: e.target.value }))} required />
                  <input className="input" placeholder="Relation (e.g. Sister)" value={newContact.relation} onChange={e => setNewContact(s => ({ ...s, relation: e.target.value }))} />
                  <button disabled={adding} className="btn-primary text-sm">
                    {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add contact
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {contacts.length ? (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c._id} className="flex items-center justify-between glass-subtle rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white text-xs font-semibold">
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs opacity-50">{c.email}</div>
                      </div>
                    </div>
                    <button onClick={() => removeContact(c._id)} disabled={deletingId === c._id} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
                      {deletingId === c._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-50 text-center py-4">No trusted contacts yet.</p>
            )}
          </GlassCard>

          {/* Manual trigger */}
          <GlassCard delay={0.15}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-warm-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Send a note now</h3>
                <p className="text-xs opacity-60 mb-3">
                  Manually send a gentle notification to your primary trusted contact.
                </p>
                <button
                  onClick={triggerManual}
                  disabled={triggering || !contacts.length}
                  className="btn-primary text-sm"
                >
                  {triggering ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {triggering ? 'Sending...' : 'Send GentleReach'}
                </button>
                {!contacts.length && (
                  <p className="text-xs text-warm-500 mt-2">Add a contact first.</p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right column — History */}
        <GlassCard delay={0.2}>
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
            <History size={18} className="text-sage-500" />
            GentleReach History
          </h3>

          {events.length ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {events.map(e => (
                <div key={e._id} className="glass-subtle rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {e.contact?.name || 'Unknown contact'}
                    </span>
                    <span className={`chip !text-[10px] ${
                      e.status === 'sent' ? '!border-sage-400/40 text-sage-600' :
                      e.status === 'failed' ? '!border-red-400/40 text-red-500' :
                      ''
                    }`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="text-xs opacity-50">
                    {new Date(e.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                    {' · '}
                    {e.trigger === 'manual' ? 'Manual' : 'Auto (stress trend)'}
                    {e.channel === 'mock' && ' · Mock'}
                  </div>
                  {e.error && (
                    <p className="text-xs text-red-500 mt-1">{e.error}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm opacity-60">No GentleReach events yet.</p>
              <p className="text-xs opacity-40 mt-1">
                Events appear here when stress trends trigger notifications.
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
