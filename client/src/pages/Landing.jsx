import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Brain,
  Sparkles,
  BookOpen,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  BarChart3,
  Bell,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import FeatureCard from '../components/FeatureCard';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  const { t } = useTranslation();
  const { session, loading } = useAuth();

  // If user is already signed in, go straight to dashboard
  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground variant="landing" />
      <Navbar onLanding />

      <main className="flex-1 relative z-10">
        {/* ═══ Hero ═══ */}
        <section className="relative px-6 pt-12 pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 chip mb-6">
                <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft" />
                <span className="text-xs">{t('landing.gentlyListening')}</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight"
              >
                {t('hero.title')}
                <br />
                <span className="shimmer-text">
                  {t('hero.title2')}
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 text-lg opacity-70 leading-relaxed max-w-lg">
                {t('hero.subtitle')}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link to="/app/companion" className="btn-primary text-base px-7 py-3">
                  {t('hero.ctaPrimary')} <ArrowRight size={18} />
                </Link>
                <Link to="/signup" className="btn-ghost text-base px-7 py-3">
                  {t('auth.signup')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[440px] flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(244,223,199,0.4), transparent)' }} />

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-strong rounded-[2rem] p-7 w-80 max-w-full shadow-glass-strong"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center shadow-soft">
                    <Heart size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t('brand')}</div>
                    <div className="text-xs opacity-50">{t('landing.heroCardTime')}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed opacity-85">
                  "{t('landing.heroCardMsg')}"
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="chip text-xs">{t('landing.heroChip1')}</span>
                  <span className="chip text-xs">{t('landing.heroChip2')}</span>
                  <span className="chip text-xs">{t('landing.heroChip3')}</span>
                </div>
              </motion.div>

              {/* Floating accent */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-2 -left-4 glass rounded-2xl p-3 hidden sm:flex items-center gap-2 text-xs shadow-glass"
              >
                <div className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft" />
                {t('landing.listeningSoftly')}
              </motion.div>

              {/* Stats accent */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                className="absolute -top-2 -right-2 glass rounded-2xl p-3 hidden sm:flex items-center gap-2 text-xs shadow-glass"
              >
                <BarChart3 size={14} className="text-warm-500" />
                {t('landing.stressTrend')}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══ Core features preview ═══ */}
        <section className="px-6 py-12 max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              {t('landing.coreTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-subtext mt-4"
            >
              {t('landing.coreSubtitle')}
            </motion.p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                title: t('landing.companionTitle'),
                description: t('landing.companionDesc'),
                to: '/app/companion',
              },
              {
                title: t('landing.reliefTitle'),
                description: t('landing.reliefDesc'),
                to: '/app/relief',
              },
              {
                title: t('landing.medsTitle'),
                description: t('landing.medsDesc'),
                to: '/app/medications',
              },
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="card-hover-glow group block rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="text-sm font-semibold text-warm-300 uppercase tracking-[0.26em] mb-3">
                  {`0${index + 1}`}
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-warm-200 group-hover:text-warm-100">
                  <span>{t('landing.open')}</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ Trusted by ═══ */}
        <section className="px-6 py-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm opacity-40"
          >
            <span>{t('landing.trusted')}</span>
            <span>•</span>
            <span>{t('landing.private')}</span>
            <span>•</span>
            <span>{t('landing.noClinical')}</span>
          </motion.div>
        </section>

        {/* ═══ Mission ═══ */}
        <section id="mission" className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              {t('mission.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="section-subtext mt-4"
            >
              {t('mission.body')}
            </motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard delay={0.1} hoverable>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-300 to-warm-400 flex items-center justify-center text-white shadow-soft mb-3">
                <Heart size={18} />
              </div>
              <h3 className="font-semibold mb-2">{t('mission.pillars.invisible.title')}</h3>
              <p className="text-sm opacity-75">{t('mission.pillars.invisible.body')}</p>
            </GlassCard>
            <GlassCard delay={0.2} hoverable>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-300 to-sage-400 flex items-center justify-center text-white shadow-soft mb-3">
                <Bell size={18} />
              </div>
              <h3 className="font-semibold mb-2">{t('mission.pillars.gentle.title')}</h3>
              <p className="text-sm opacity-75">{t('mission.pillars.gentle.body')}</p>
            </GlassCard>
            <GlassCard delay={0.3} hoverable>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-sage-300 flex items-center justify-center text-white shadow-soft mb-3">
                <Brain size={18} />
              </div>
              <h3 className="font-semibold mb-2">{t('mission.pillars.warm.title')}</h3>
              <p className="text-sm opacity-75">{t('mission.pillars.warm.body')}</p>
            </GlassCard>
          </div>
        </section>

        {/* ═══ How it works ═══ */}
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-heading text-center mb-14"
          >
            {t('landing.howTitle')}
          </motion.h2>
          <div className="space-y-6">
            {[
              { step: '01', icon: MessageCircle, title: t('landing.step1Title'), body: t('landing.step1Body') },
              { step: '02', icon: Brain, title: t('landing.step2Title'), body: t('landing.step2Body') },
              { step: '03', icon: Sparkles, title: t('landing.step3Title'), body: t('landing.step3Body') },
              { step: '04', icon: Users, title: t('landing.step4Title'), body: t('landing.step4Body') },
            ].map((item, i) => (
              <GlassCard key={item.step} delay={i * 0.1} hoverable>
                <div className="flex items-start gap-5">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white font-semibold shadow-soft">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <item.icon size={18} className="text-warm-500" />
                      {item.title}
                    </h3>
                    <p className="text-sm opacity-75 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ═══ Features ═══ */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-heading text-center mb-4"
          >
            {t('features.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtext text-center mb-14"
          >
            {t('features.subtitle')}
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={BookOpen} title={t('features.items.journal.title')} body={t('features.items.journal.body')} delay={0.05} index={0} />
            <FeatureCard icon={Brain} title={t('features.items.stress.title')} body={t('features.items.stress.body')} delay={0.1} index={1} />
            <FeatureCard icon={Sparkles} title={t('features.items.nudges.title')} body={t('features.items.nudges.body')} delay={0.15} index={2} />
            <FeatureCard icon={Heart} title={t('features.items.resources.title')} body={t('features.items.resources.body')} delay={0.2} index={3} />
            <FeatureCard icon={Users} title={t('features.items.gentleReach.title')} body={t('features.items.gentleReach.body')} delay={0.25} index={4} />
            <FeatureCard icon={ShieldCheck} title={t('features.items.privacy.title')} body={t('features.items.privacy.body')} delay={0.3} index={5} />
          </div>
        </section>

        {/* ═══ Testimonials ═══ */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-heading text-center mb-14"
          >
            {t('landing.testimonialTitle')}
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: `"${t('landing.quote1')}"`, name: 'Priya', role: t('landing.motherCaregiver') },
              { quote: `"${t('landing.quote2')}"`, name: 'Rahul', role: t('landing.sonCaring') },
              { quote: `"${t('landing.quote3')}"`, name: 'Ananya', role: t('landing.familySupport') },
            ].map((item, i) => (
              <GlassCard key={i} delay={i * 0.1} hoverable>
                <p className="text-sm leading-relaxed italic opacity-80 mb-4">{item.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-300 to-sage-300 flex items-center justify-center text-white text-xs font-semibold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs opacity-60">{item.role}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ═══ CTA Banner ═══ */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <GlassCard strong className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
                {t('landing.ctaTitle')}
              </h2>
              <p className="opacity-70 mb-6 max-w-md mx-auto">
                {t('landing.ctaBody')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/signup" className="btn-primary text-base px-8 py-3">
                  {t('landing.startJourney')} <ArrowRight size={18} />
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs opacity-50">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {t('landing.freeToStart')}</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {t('landing.noCreditCard')}</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {t('landing.completePrivacy')}</span>
              </div>
            </motion.div>
          </GlassCard>
        </section>

        {/* ═══ Contact ═══ */}
        <section id="contact" className="px-6 py-20 max-w-3xl mx-auto">
          <GlassCard strong>
            <h2 className="text-2xl font-semibold mb-2">{t('contact.title')}</h2>
            <p className="text-sm opacity-60 mb-6">{t('contact.subtitle')}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.target.reset();
                alert('Thank you. We received your note.');
              }}
              className="space-y-3"
            >
              <input className="input" placeholder={t('contact.name')} required id="contact-name" />
              <input type="email" className="input" placeholder={t('contact.email')} required id="contact-email" />
              <textarea
                rows={4}
                className="input resize-none"
                placeholder={t('contact.message')}
                required
                id="contact-message"
              />
              <button className="btn-primary w-full sm:w-auto" id="contact-submit">
                {t('contact.send')}
              </button>
            </form>
          </GlassCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
