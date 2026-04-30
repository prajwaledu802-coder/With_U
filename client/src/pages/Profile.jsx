import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BarChart3, Calendar, Activity, FileText, Edit2, Save, X, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function AnimatedCounter({ value, duration = 1 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) return setDisplay(0);
    const step = target / (duration * 30);
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setDisplay(target);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current));
      }
    }, 33);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{display}</span>;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/dashboard/stats');
        setStats(res.data);
      } catch (e) {
        console.error('Stats load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', role: user.role || 'caregiver' });
    }
  }, [user]);

  /* ─── Save profile changes ─── */
  const saveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await api.put('/api/users/profile', {
        name: editForm.name.trim(),
        role: editForm.role,
      });
      toast.success('Profile updated');
      refresh(); // reload auth context
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        {/* ═══ Profile Header ═══ */}
        <GlassCard strong className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 mx-auto flex items-center justify-center text-3xl text-white font-semibold mb-4"
            style={{ boxShadow: '0 0 40px rgba(192, 138, 90, 0.25)' }}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              (user?.name || 'U')[0].toUpperCase()
            )}
          </motion.div>

          {editing ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                className="input text-center"
                placeholder="Your name"
                id="profile-name"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((s) => ({ ...s, role: e.target.value }))}
                className="input text-center"
                id="profile-role"
              >
                <option value="caregiver">Caregiver</option>
                <option value="family">Family member</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="btn-primary text-sm"
                  id="profile-save"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? t('common.loading') : t('common.save')}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditForm({ name: user?.name || '', role: user?.role || 'caregiver' });
                  }}
                  className="btn-ghost text-sm"
                  id="profile-cancel"
                >
                  <X size={14} /> {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold">{user?.name || 'Friend'}</h1>
              <p className="text-sm opacity-60">{user?.email}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="chip">{user?.role || 'caregiver'}</span>
                <span className="chip">{user?.settings?.language === 'hi' ? 'हिन्दी' : 'English'}</span>
                <span className="chip">{user?.settings?.theme || 'system'} mode</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="btn-ghost text-xs mt-4"
                id="profile-edit"
              >
                <Edit2 size={12} /> Edit profile
              </button>
            </>
          )}
        </GlassCard>

        {/* ═══ Stats ═══ */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold mb-4"
        >
          Your Journey
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <GlassCard delay={0.1} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-300 to-warm-400 flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-2xl font-semibold">
                    <AnimatedCounter value={stats?.totalLogs || 0} />
                  </div>
                  <div className="text-xs opacity-60">Entries shared</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.15} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-300 to-sage-400 flex items-center justify-center text-white">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-2xl font-semibold">
                    <AnimatedCounter value={stats?.totalDays || 0} />
                  </div>
                  <div className="text-xs opacity-60">Days active</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.2} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-sage-300 flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-2xl font-semibold">
                    <AnimatedCounter value={stats?.averageStress || 0} />%
                  </div>
                  <div className="text-xs opacity-60">Avg stress</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.25} hoverable>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-warm-300 flex items-center justify-center text-white">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <div className="text-2xl font-semibold">
                    {stats?.averageScore != null
                      ? (stats.averageScore).toFixed(2)
                      : '—'}
                  </div>
                  <div className="text-xs opacity-60">Avg mood score</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Account info */}
        <GlassCard delay={0.3} className="mt-6">
          <h3 className="text-sm font-medium opacity-70 mb-2">Account</h3>
          <div className="space-y-1 text-sm opacity-60">
            <p>Timezone: {user?.timezone || 'Asia/Kolkata'}</p>
            <p>Member since: {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Unknown'}</p>
            <p>Last seen: {user?.lastSeenAt
              ? new Date(user.lastSeenAt).toLocaleString()
              : 'Now'}</p>
          </div>
      </GlassCard>
    </div>
  );
}
