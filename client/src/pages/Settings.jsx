import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Palette,
  Globe,
  Bell,
  Users,
  ShieldCheck,
  Trash2,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/authService';

/* ─── Toggle switch ─── */
function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={id}
      />
      <div className="toggle-track" />
    </label>
  );
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { refresh } = useAuth();
  const [settings, setSettings] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', relation: '' });
  const [addingContact, setAddingContact] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* ─── Load settings + contacts ─── */
  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          api.get('/api/users/settings'),
          api.get('/api/contacts'),
        ]);
        setSettings(s.data.settings || {});
        setContacts(c.data.items || []);
      } catch (e) {
        toast.error('Could not load settings');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ─── Update a setting ─── */
  const updateSetting = async (key, value) => {
    const prev = { ...settings };
    setSettings((s) => ({ ...s, [key]: value }));
    setSaving((s) => ({ ...s, [key]: true }));

    try {
      await api.put('/api/users/settings', { [key]: value });

      // Apply side effects immediately
      if (key === 'language') {
        i18n.changeLanguage(value);
        localStorage.setItem('with_u_lang', value);
      }
      if (key === 'theme') {
        setTheme(value);
      }

      toast.success('Saved');
      refresh(); // refresh AuthContext user
    } catch {
      setSettings(prev);
      toast.error('Could not save');
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  /* ─── Add contact ─── */
  const addContact = async (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setAddingContact(true);
    try {
      const res = await api.post('/api/contacts', {
        name: newContact.name.trim(),
        email: newContact.email.trim(),
        relation: newContact.relation.trim() || 'Friend',
      });
      setContacts((c) => [...c, res.data.contact]);
      setNewContact({ name: '', email: '', relation: '' });
      setAddOpen(false);
      toast.success('Contact added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add contact');
    } finally {
      setAddingContact(false);
    }
  };

  /* ─── Remove contact ─── */
  const removeContact = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
      toast.success('Contact removed');
    } catch {
      toast.error('Could not remove contact');
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Delete account ─── */
  const deleteAccount = async () => {
    setDeleteAccountBusy(true);
    try {
      await api.delete('/api/auth/account');
      await signOut();
      toast.success('Account deleted');
      navigate('/');
    } catch {
      toast.error('Could not delete account');
    } finally {
      setDeleteAccountBusy(false);
      setConfirmDelete(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-warm-300 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm opacity-60">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold mb-8"
        >
          {t('settings.title')}
        </motion.h1>

        <div className="space-y-6">
          {/* ═══ Appearance ═══ */}
          <GlassCard delay={0.05}>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
              <Palette size={18} className="text-warm-500" />
              {t('settings.appearance')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('settings.theme')}</span>
                <div className="flex items-center gap-2">
                  {saving.theme && <Loader2 size={14} className="animate-spin opacity-40" />}
                  <select
                    value={settings.theme || 'system'}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="input !w-auto !py-2"
                    id="settings-theme"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('settings.language')}</span>
                <div className="flex items-center gap-2">
                  {saving.language && <Loader2 size={14} className="animate-spin opacity-40" />}
                  <select
                    value={settings.language || 'en'}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="input !w-auto !py-2"
                    id="settings-lang"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice responses</span>
                <div className="flex items-center gap-2">
                  {saving.voiceResponses && <Loader2 size={14} className="animate-spin opacity-40" />}
                  <Toggle
                    checked={!!settings.voiceResponses}
                    onChange={(v) => updateSetting('voiceResponses', v)}
                    id="settings-voice"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nudge frequency</span>
                <div className="flex items-center gap-2">
                  {saving.nudgeFrequency && <Loader2 size={14} className="animate-spin opacity-40" />}
                  <select
                    value={settings.nudgeFrequency || 'medium'}
                    onChange={(e) => updateSetting('nudgeFrequency', e.target.value)}
                    className="input !w-auto !py-2"
                    id="settings-nudge"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ═══ GentleReach ═══ */}
          <GlassCard delay={0.1}>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-2">
              <Bell size={18} className="text-sage-500" />
              {t('settings.gentleReach')}
            </h2>
            <p className="text-sm opacity-60 mb-4">{t('settings.gentleReachBody')}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Enable GentleReach</span>
              <div className="flex items-center gap-2">
                {saving.gentleReachEnabled && <Loader2 size={14} className="animate-spin opacity-40" />}
                <Toggle
                  checked={!!settings.gentleReachEnabled}
                  onChange={(v) => updateSetting('gentleReachEnabled', v)}
                  id="settings-gentlereach"
                />
              </div>
            </div>
          </GlassCard>

          {/* ═══ Trusted Contacts ═══ */}
          <GlassCard delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Users size={18} className="text-warm-500" />
                {t('settings.contacts')}
              </h2>
              <button
                onClick={() => setAddOpen((o) => !o)}
                className="btn-ghost !py-1.5 text-xs"
                id="settings-add-contact-btn"
              >
                {addOpen ? <X size={14} /> : <Plus size={14} />}
                {addOpen ? t('common.cancel') : t('settings.addContact')}
              </button>
            </div>

            {/* Add contact form */}
            <AnimatePresence>
              {addOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={addContact}
                  className="space-y-2 mb-4 overflow-hidden"
                >
                  <input
                    className="input"
                    placeholder={t('auth.contactName')}
                    value={newContact.name}
                    onChange={(e) => setNewContact((s) => ({ ...s, name: e.target.value }))}
                    required
                    id="settings-contact-name"
                  />
                  <input
                    type="email"
                    className="input"
                    placeholder={t('auth.contactEmail')}
                    value={newContact.email}
                    onChange={(e) => setNewContact((s) => ({ ...s, email: e.target.value }))}
                    required
                    id="settings-contact-email"
                  />
                  <input
                    className="input"
                    placeholder="Relation (e.g. Sister, Friend)"
                    value={newContact.relation}
                    onChange={(e) => setNewContact((s) => ({ ...s, relation: e.target.value }))}
                    id="settings-contact-relation"
                  />
                  <button
                    disabled={addingContact}
                    className="btn-primary text-sm"
                    id="settings-contact-submit"
                  >
                    {addingContact ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {addingContact ? t('common.loading') : t('settings.addContact')}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Contact list */}
            {contacts.length ? (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <motion.div
                    key={c._id}
                    layout
                    className="flex items-center justify-between glass-subtle rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white text-xs font-semibold">
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {c.name}
                          {c.isPrimary && (
                            <span className="chip !text-[9px] !px-1.5 !py-0.5">primary</span>
                          )}
                        </div>
                        <div className="text-xs opacity-50">{c.email}</div>
                        {c.relation && (
                          <div className="text-xs opacity-40">{c.relation}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeContact(c._id)}
                      disabled={deletingId === c._id}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                      title="Remove contact"
                    >
                      {deletingId === c._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-50 text-center py-4">
                No trusted contacts yet. Add one above.
              </p>
            )}
          </GlassCard>

          {/* ═══ Privacy ═══ */}
          <GlassCard delay={0.2}>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-sage-500" />
              {t('settings.privacy')}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('settings.privacyMode')}</span>
              <div className="flex items-center gap-2">
                {saving.privacyMode && <Loader2 size={14} className="animate-spin opacity-40" />}
                <Toggle
                  checked={!!settings.privacyMode}
                  onChange={(v) => updateSetting('privacyMode', v)}
                  id="settings-privacy"
                />
              </div>
            </div>
          </GlassCard>

          {/* ═══ Log Out ═══ */}
          <GlassCard delay={0.22}>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-2">
              <LogOut size={18} className="text-violet-500" />
              {t('nav.logout')}
            </h2>
            <p className="text-sm opacity-60 mb-4">
              Sign out of your WITH_U account on this device.
            </p>
            <button
              onClick={async () => {
                try {
                  await signOut();
                  toast.success(t('nav.logout'));
                  navigate('/');
                } catch (err) {
                  toast.error(err.message);
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-violet-200/50 dark:border-violet-500/20 transition-all duration-300 hover:-translate-y-0.5"
              id="settings-logout-btn"
            >
              <LogOut size={16} />
              {t('nav.logout')}
            </button>
          </GlassCard>

          {/* ═══ Danger Zone — Delete Account ═══ */}
          <GlassCard delay={0.25} className="border border-red-200/30 dark:border-red-500/10">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
              <AlertTriangle size={18} />
              Danger Zone
            </h2>
            <p className="text-sm opacity-60 mb-4">
              This will permanently delete your account, all logs, sentiment history, and contacts.
              This cannot be undone.
            </p>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-danger w-full text-sm"
                id="settings-delete-show"
              >
                <Trash2 size={14} />
                {t('settings.deleteAccount')}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Are you sure? Type "delete" won't help here — just click to confirm.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    disabled={deleteAccountBusy}
                    className="btn-danger flex-1 text-sm"
                    id="settings-delete-confirm"
                  >
                    {deleteAccountBusy ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {deleteAccountBusy ? 'Deleting...' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="btn-ghost flex-1 text-sm"
                    id="settings-delete-cancel"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
      </div>
    </div>
  );
}
