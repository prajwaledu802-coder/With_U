import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, Filter, Phone, ExternalLink } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📋' },
  { id: 'breathing', label: 'Breathing', emoji: '🌬️' },
  { id: 'rest', label: 'Rest', emoji: '😴' },
  { id: 'connection', label: 'Connection', emoji: '💌' },
  { id: 'reflection', label: 'Reflection', emoji: '📝' },
  { id: 'movement', label: 'Movement', emoji: '🚶' },
];

const HELPLINES = [
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    desc: '24/7 multilingual mental health helpline',
    url: 'https://www.vandrevalafoundation.com',
  },
  {
    name: 'iCall (TISS)',
    number: '9152987821',
    desc: 'Psychosocial counselling — Mon-Sat, 8am-10pm',
    url: 'https://icallhelpline.org',
  },
  {
    name: 'NIMHANS',
    number: '080-46110007',
    desc: 'National Institute of Mental Health helpline',
    url: 'https://nimhans.ac.in',
  },
  {
    name: 'Snehi',
    number: '044-24640050',
    desc: 'Emotional support — 2pm-10pm daily',
    url: 'http://www.snehaindia.org',
  },
];

export default function Resources() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = i18n.language === 'hi' ? 'hi' : 'en';
    api.get(`/api/resources?lang=${lang}`)
      .then(r => {
        setItems(r.data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [i18n.language]);

  const filtered = filter === 'all' ? items : items.filter(r => r.category === filter);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <BookOpen size={24} className="text-sage-500" />
          {t('sidebar.resources')}
        </h1>
        <p className="text-sm opacity-60 mt-2 max-w-lg">
          Gentle practices and support. Nothing heavy — just small things that help.
        </p>
      </motion.div>

      {/* ─── Category Filter ─── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`chip cursor-pointer transition-all ${
              filter === c.id
                ? '!bg-warm-400/20 !border-warm-400/40 font-semibold'
                : 'hover:bg-white/40'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* ─── Resources Grid ─── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <GlassCard key={r.id} hoverable delay={i * 0.05}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">
                  {r.category === 'breathing' ? '🌬️' :
                   r.category === 'rest' ? '😴' :
                   r.category === 'connection' ? '💌' :
                   r.category === 'reflection' ? '📝' : '🚶'}
                </span>
                <span className="chip !text-[10px]">{r.duration}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
              <p className="text-xs opacity-70 leading-relaxed">{r.body}</p>
              <div className="flex gap-1 mt-3">
                {r.tags.map(tag => (
                  <span key={tag} className="chip !text-[9px]">{tag}</span>
                ))}
              </div>
            </GlassCard>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm opacity-60">No resources in this category yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Helplines ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Phone size={20} className="text-warm-500" />
          Nearby Help
        </h2>
        <p className="text-sm opacity-60 mb-6">
          Professional support available in India. You don't have to carry it alone.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {HELPLINES.map((h, i) => (
            <GlassCard key={h.name} hoverable delay={0.4 + i * 0.08}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{h.name}</h3>
                  <a href={`tel:${h.number}`} className="text-warm-500 text-sm font-medium hover:underline">
                    {h.number}
                  </a>
                  <p className="text-xs opacity-60 mt-1">{h.desc}</p>
                </div>
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !p-2 !rounded-full shrink-0"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
