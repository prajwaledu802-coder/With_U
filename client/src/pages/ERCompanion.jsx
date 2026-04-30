import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Send, Volume2, VolumeX, Heart,
  Wind, Music, RotateCcw, Sparkles, Gamepad2,
  MessageCircle, Activity, ChevronUp, ChevronDown,
  Moon, Clock, Keyboard, AlertTriangle, Phone, Shield,
  PanelLeftClose, PanelLeftOpen, Plus, Trash2,
  Play, Languages,
} from 'lucide-react';
import api from '../services/api';
import ToolModal from '../components/ToolModal';
import VoiceInput from '../components/VoiceInput';
import {
  TypingAnalyzer,
  trackScreenTime,
  calculateInvisibleStress,
  recordLateNightSession,
  getLateNightCount,
} from '../services/stressService';
import { voiceService } from '../services/voiceService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const AiraModel3D = lazy(() => import('../components/AiraModel3D'));

/* ═══ Stress color helper ═══ */
const stressColor = (s) => {
  if (s <= 20) return { bg: 'from-emerald-400 to-emerald-500', text: 'text-emerald-400', label: 'Calm', fill: '#34d399' };
  if (s <= 50) return { bg: 'from-amber-400 to-yellow-400', text: 'text-amber-400', label: 'Mild Stress', fill: '#fbbf24' };
  if (s <= 80) return { bg: 'from-orange-400 to-orange-500', text: 'text-orange-400', label: 'High Stress', fill: '#f97316' };
  return { bg: 'from-red-400 to-red-500', text: 'text-red-400', label: 'Critical', fill: '#ef4444' };
};

const ACTION_META = {
  breathing: { icon: '🌬️', label: '1-minute breathing', tool: 'breathing' },
  audio: { icon: '🎧', label: 'Relaxing audio', tool: 'audio' },
  reset: { icon: '🧊', label: 'Quick reset', tool: 'reset' },
  gratitude: { icon: '✨', label: 'Gratitude moment', tool: 'gratitude' },
  quiz: { icon: '💬', label: 'Quick check-in', tool: 'quiz' },
  external_help: { icon: '🆘', label: 'Reach support', tool: 'external_help' },
};

const getSuggestions = (stressLevel, recommendedAction, reducedUI) => {
  const base = {
    low: [
      { icon: '🎮', label: 'Play a quick game', tool: 'games' },
      { icon: '🎵', label: 'Listen to music', tool: 'audio' },
      { icon: '☕', label: 'Take a light pause', tool: null },
    ],
    moderate: [
      ACTION_META.breathing,
      ACTION_META.audio,
      { icon: '🎮', label: 'A gentle game break', tool: 'games' },
      ACTION_META.quiz,
    ],
    high: [
      ACTION_META.breathing,
      ACTION_META.gratitude,
      ACTION_META.reset,
    ],
    critical: [
      ACTION_META.breathing,
      ACTION_META.external_help,
      { icon: '📞', label: 'Call a trusted person', tool: 'contacts' },
    ],
  };
  const list = [...(base[stressLevel] || base.low)];
  if (recommendedAction && ACTION_META[recommendedAction]) {
    list.unshift({ ...ACTION_META[recommendedAction], label: `Aira suggests: ${ACTION_META[recommendedAction].label}` });
  }
  const filtered = reducedUI ? list.slice(0, 2) : list;
  return filtered;
};

const companionMsg = (s) => {
  if (s <= 20) return 'You seem steady. I am here if you need me.';
  if (s <= 50) return 'Maybe a small pause would feel kind.';
  if (s <= 80) return 'You are carrying a lot. We can slow this down.';
  return 'You do not have to carry this alone. I am here.';
};

/* ═══ Stress Ring ═══ */
function StressRing({ value }) {
  const sc = stressColor(value);
  const C = 2 * Math.PI * 42;
  const off = C - (value / 100) * C;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <motion.circle
          cx="50" cy="50" r="42" fill="none" stroke="url(#stressGrad)" strokeWidth="5"
          strokeLinecap="round" strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="stressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor={sc.fill} />
            <stop offset="100%" stopColor={sc.fill} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <motion.span key={value} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className={`text-lg font-bold ${sc.text}`}>{value}%</motion.span>
        <span className="text-[9px] text-white/30">stress</span>
      </div>
    </div>
  );
}

/* ═══ Invisible Stress Breakdown ═══ */
function StressBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const items = [
    { label: 'Message Tone', value: breakdown.sentiment, icon: MessageCircle, color: 'text-violet-400' },
    { label: 'Late Night', value: breakdown.lateNight, icon: Moon, color: 'text-indigo-400' },
    { label: 'Session Time', value: breakdown.session, icon: Clock, color: 'text-cyan-400' },
    { label: 'Typing Pattern', value: breakdown.typing, icon: Keyboard, color: 'text-amber-400' },
    { label: 'Interaction Gap', value: breakdown.interaction, icon: Activity, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-2 mt-3">
      {items.map((item) => {
        const value = Math.max(0, item.value || 0);
        return (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon size={11} className={`${item.color} opacity-60`} />
            <span className="text-[10px] text-white/30 flex-1">{item.label}</span>
            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, value)}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  value > 60 ? 'from-orange-400 to-red-400' :
                  value > 30 ? 'from-amber-400 to-orange-400' :
                  'from-emerald-400 to-teal-400'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ER COMPANION — AIRA 3D EXPERIENCE
   ═══════════════════════════════════════════════════ */
export default function ERCompanion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const trackingEnabled = user?.settings?.privacyMode ? false : true;
  const voiceEnabled = user?.settings?.voiceResponses !== false;
  const firstName = user?.name?.split(' ')[0] || 'friend';
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'companion',
      text: `Hey ${firstName}. I'm With_U — no rush, no agenda. Share when you feel like it. I can also open any page if you ask, or set up a medication reminder for you.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [stress, setStress] = useState(0);
  const [stressLevel, setStressLevel] = useState('low');
  const [stressBreakdown, setStressBreakdown] = useState(null);
  const [emotion, setEmotion] = useState('calm');
  const [anim, setAnim] = useState('idle');
  const [speaking, setSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(true);
  const [lastMessageStress, setLastMessageStress] = useState(0);
  const [recommendedAction, setRecommendedAction] = useState('none');
  const [quizOffered, setQuizOffered] = useState(false);
  const [screenTimePrompted, setScreenTimePrompted] = useState(false);
  const [aiSource, setAiSource] = useState('local');
  const [pendingNavigate, setPendingNavigate] = useState(null);

  // Companion-only language (for AI conversation, independent of UI i18n)
  const [companionLang, setCompanionLang] = useState(() => localStorage.getItem('with_u_companion_lang') || i18n.language || 'en');
  const [companionLangOpen, setCompanionLangOpen] = useState(false);
  const companionLangRef = useRef(null);

  // Crisis detection state
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [crisisDismissed, setCrisisDismissed] = useState(false);

  const CRISIS_KEYWORDS = ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'no reason to live', 'self-harm', 'self harm', 'end it all', 'better off dead', 'nothing left', 'give up on life', 'आत्महत्या', 'जीना नहीं', 'मर जाना', 'ಆತ್ಮಹತ್ಯೆ', 'தற்கொலை', 'ఆత్మహత్య'];
  const COMPANION_LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'ur', label: 'اردو' },
  ];

  const chatEndRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  const typingAnalyzerRef = useRef(new TypingAnalyzer());
  const screenTimeIntervalRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const interactionCountRef = useRef(0);
  const lastEmotionalAtRef = useRef(null);
  const lastActionRef = useRef('none');
  const signalsRef = useRef(null);
  const lastMessageStressRef = useRef(0);
  const voiceDropdownRef = useRef(null);

  // Voice selection state
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => localStorage.getItem('with_u_voice') || '');
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    lastMessageStressRef.current = lastMessageStress;
  }, [lastMessageStress]);

  // Language code mapping for Indian languages (browser voices use full locale codes)
  const LANG_MAP = {
    en: ['en-US', 'en-GB', 'en-IN', 'en-AU', 'en'],
    hi: ['hi-IN', 'hi'],
    kn: ['kn-IN', 'kn'],
    ta: ['ta-IN', 'ta'],
    te: ['te-IN', 'te'],
    ml: ['ml-IN', 'ml'],
    bn: ['bn-IN', 'bn'],
    mr: ['mr-IN', 'mr'],
    gu: ['gu-IN', 'gu'],
    pa: ['pa-IN', 'pa'],
    ur: ['ur-PK', 'ur-IN', 'ur'],
  };

  const findVoiceForLang = (allVoices, langCode) => {
    const codes = LANG_MAP[langCode] || [langCode];
    for (const code of codes) {
      const match = allVoices.find(v => v.lang === code || v.lang.startsWith(code.split('-')[0]));
      if (match) return match;
    }
    return null;
  };

  // Load browser voices — with retry polling for Chrome/Edge
  const loadVoices = () => {
    const all = window.speechSynthesis?.getVoices() || [];
    if (all.length > 0) {
      setVoices(all);
      if (!selectedVoiceURI) {
        const langCode = companionLang || 'en';
        const match = findVoiceForLang(all, langCode) || all[0];
        if (match) { setSelectedVoiceURI(match.voiceURI); localStorage.setItem('with_u_voice', match.voiceURI); }
      }
    }
    return all.length;
  };

  useEffect(() => {
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    // Aggressive polling: Chrome/Edge delay voice list, especially on HTTPS
    let retries = 0;
    const poll = setInterval(() => {
      if (loadVoices() > 0 || retries++ > 50) clearInterval(poll);
    }, 300);
    // Second wave: try again after delays
    setTimeout(() => loadVoices(), 2000);
    setTimeout(() => loadVoices(), 5000);
    return () => {
      clearInterval(poll);
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // When companion language changes, auto-select a matching voice
  useEffect(() => {
    if (voices.length === 0) return;
    const match = findVoiceForLang(voices, companionLang);
    if (match) {
      setSelectedVoiceURI(match.voiceURI);
      localStorage.setItem('with_u_voice', match.voiceURI);
    }
  }, [companionLang, voices]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(e.target)) setVoiceDropdownOpen(false);
      if (companionLangRef.current && !companionLangRef.current.contains(e.target)) setCompanionLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getSelectedVoice = () => voices.find(v => v.voiceURI === selectedVoiceURI) || null;
  const handleVoiceSelect = (uri) => { setSelectedVoiceURI(uri); localStorage.setItem('with_u_voice', uri); setVoiceDropdownOpen(false); };
  const getLangLabel = (lc) => ({ en:'English',hi:'Hindi',kn:'Kannada',ta:'Tamil',te:'Telugu',ml:'Malayalam',bn:'Bengali',mr:'Marathi',gu:'Gujarati',pa:'Punjabi',ur:'Urdu' })[lc?.split('-')[0]] || lc;

  const testVoice = () => {
    const voice = getSelectedVoice();
    if (!voice || testingVoice) return;
    setTestingVoice(true);
    window.speechSynthesis.cancel();
    const langCode = companionLang || 'en';
    const texts = { en:'Hello! I am your WITH-U companion.', hi:'नमस्ते! मैं आपकी WITH-U साथी हूँ।', kn:'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ WITH-U ಸಂಗಾತಿ.', ta:'வணக்கம்! நான் உங்கள் WITH-U தோழன்.', te:'నమస్కారం! నేను మీ WITH-U సహచరుడిని.', ml:'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ WITH-U കൂട്ടാളി.', bn:'নমস্কার! আমি আপনার WITH-U সঙ্গী।', mr:'नमस्कार! मी तुमचा WITH-U सोबती.', gu:'નમસ્તે! હું તમારો WITH-U સાથી.', pa:'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ WITH-U ਸਾਥੀ.', ur:'السلام علیکم! میں آپ کا WITH-U ساتھی۔' };
    const u = new SpeechSynthesisUtterance(texts[langCode] || texts.en);
    u.voice = voice; u.rate = 0.9; u.pitch = 0.95;
    u.onend = () => setTestingVoice(false);
    u.onerror = () => setTestingVoice(false);
    window.speechSynthesis.speak(u);
  };

  const recalcStress = (seedStress = lastMessageStressRef.current) => {
    const result = calculateInvisibleStress(
      sessionStartRef.current,
      typingAnalyzerRef.current,
      seedStress,
      {
        lastEmotionalAt: lastEmotionalAtRef.current,
        lastInteractionAt: lastInteractionRef.current,
        interactionCount: interactionCountRef.current,
        trackingEnabled,
      }
    );
    setStress(result.total);
    setStressBreakdown(result.breakdown);
    signalsRef.current = result.signals;
    return result;
  };

  /* ── Invisible tracking: screen time + late night ── */
  useEffect(() => {
    trackScreenTime(trackingEnabled);
    recordLateNightSession(trackingEnabled);

    screenTimeIntervalRef.current = setInterval(() => {
      trackScreenTime(trackingEnabled);
      recordLateNightSession(trackingEnabled);
      recalcStress();
    }, 60000);

    recalcStress(0);

    return () => clearInterval(screenTimeIntervalRef.current);
  }, [trackingEnabled]);

  /* ── Recalculate when lastMessageStress changes ── */
  useEffect(() => {
    // If this is a crisis-level score (>= 85), use it directly — don't let local factors dilute it
    if (lastMessageStress >= 85) {
      setStress(lastMessageStress);
      setStressLevel('critical');
    } else {
      recalcStress(lastMessageStress);
    }
  }, [lastMessageStress]);

  useEffect(() => {
    // Only update stress level from computed stress if NOT in crisis
    if (crisisDetected && !crisisDismissed) return;
    const level = stress <= 20 ? 'low' : stress <= 50 ? 'moderate' : stress <= 80 ? 'high' : 'critical';
    if (level !== stressLevel) setStressLevel(level);
  }, [stress, crisisDetected, crisisDismissed]);

  /* ── Typing detection → listening animation + tracking ── */
  useEffect(() => {
    if (input.length > 0 && !analyzing) {
      setAnim('listening');
    } else if (!analyzing && !speaking) {
      setAnim('idle');
    }
  }, [input, analyzing, speaking]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Track typing patterns invisibly
    if (val.length < input.length) {
      typingAnalyzerRef.current.recordKey(true, input.length - val.length); // deletion
    } else {
      typingAnalyzerRef.current.recordKey(false, val.length - input.length);
    }
    setInput(val);
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    await sendText();
  };

  const sendText = async (textOverride) => {
    const txt = (textOverride ?? input).trim();
    if (!txt || analyzing) return;
    setInput('');

    // Client-side crisis keyword scan — immediate intervention
    const lowerTxt = txt.toLowerCase();
    const isCrisisMsg = CRISIS_KEYWORDS.some(w => lowerTxt.includes(w));
    if (isCrisisMsg) {
      setCrisisDetected(true);
      setCrisisDismissed(false);
      setStress(95);
      setStressLevel('critical');
    }

    lastInteractionRef.current = Date.now();
    interactionCountRef.current += 1;

    const userMsg = { role: 'user', text: txt, ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setAnalyzing(true);
    setAnim('listening');

    const latest = recalcStress();
    const previous_state = {
      stress_level: stressLevel,
      emotional_state: emotion,
      last_action: lastActionRef.current,
      quizOffered,
      screenTimePrompted,
    };

    // 6 most-recent turns for HF context
    const history = [...messages.slice(-5), userMsg].map((m) => ({ role: m.role, text: m.text }));

    try {
      const { data } = await api.post('/api/companion/analyze-text', {
        text: txt,
        signals: latest?.signals || {},
        previous_state,
        userName: firstName,
        history,
        language: companionLang || 'en',
      });

      const responseText = data.message || 'I am here.';
      const score = Number(data.stress_score || 0);
      const level = data.stress_level || 'low';
      const action = data.action || 'none';

      setLastMessageStress(score);
      setStress(score);
      setStressLevel(level);
      setRecommendedAction(action);
      setAiSource(data.ai?.reply || 'local');
      lastActionRef.current = action;
      if (score >= 60) lastEmotionalAtRef.current = Date.now();

      // Backend crisis flag
      if (data.crisis) {
        setCrisisDetected(true);
        setCrisisDismissed(false);
      }

      const emotionMap = { low: 'calm', moderate: 'tense', high: 'stressed', critical: 'overwhelmed' };
      setEmotion(data.emotion || emotionMap[level] || 'neutral');

      const animState = data.animation || getAnimFromStress(score);
      setAnim('speaking');
      setSpeaking(true);

      await new Promise(r => setTimeout(r, 600));
      setMessages(m => [...m, { role: 'companion', text: responseText, ts: Date.now() }]);

      // Tool modal directive
      if (data.ui?.openModal && data.ui.type && data.ui.type !== 'none') {
        setActiveTool(data.ui.type);
        if (data.ui.type === 'quiz') setQuizOffered(true);
      }

      // Navigation directive (chat can navigate the whole site)
      if (data.ui?.navigateTo) {
        setPendingNavigate({
          to: data.ui.navigateTo,
          intent: data.intent,
        });
      }

      // Smart medication: prefill and stash
      if (data.intent?.kind === 'medication' && data.intent.extracted) {
        try {
          sessionStorage.setItem('aira_med_prefill', JSON.stringify(data.intent.extracted));
        } catch {}
      }

      if (responseText.toLowerCase().includes('active for a while')) {
        setScreenTimePrompted(true);
      }

      typingAnalyzerRef.current.reset();

      if (!muted && voiceEnabled) {
        speakText(responseText, animState);
      } else {
        setTimeout(() => {
          setSpeaking(false);
          setAnim(animState);
          setTimeout(() => setAnim('idle'), 3000);
        }, 2000);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'companion', text: 'I am still here. Try again?', ts: Date.now() }]);
      setAnim('idle');
      setSpeaking(false);
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── Auto-navigate after a short delay so user sees the reply first ── */
  useEffect(() => {
    if (!pendingNavigate) return;
    const timer = setTimeout(() => {
      navigate(pendingNavigate.to);
      setPendingNavigate(null);
    }, 1400);
    return () => clearTimeout(timer);
  }, [pendingNavigate, navigate]);

  const handleQuizComplete = async ({ answers }) => {
    if (!answers?.length || analyzing) return;
    setActiveTool(null);
    setQuizOffered(true);

    lastInteractionRef.current = Date.now();
    interactionCountRef.current += 1;

    setAnalyzing(true);
    const latest = recalcStress();
    const previous_state = {
      stress_level: stressLevel,
      emotional_state: emotion,
      last_action: lastActionRef.current,
      quizOffered: true,
      screenTimePrompted,
    };

    try {
      const { data } = await api.post('/api/companion/analyze-text', {
        text: '',
        quiz: { answers },
        signals: latest?.signals || {},
        previous_state,
      });

      const responseText = data.message || 'Thanks for checking in.';
      const score = Number(data.stress_score || 0);
      const level = data.stress_level || 'low';
      const action = data.action || 'none';

      setLastMessageStress(score);
      setStress(score);
      setStressLevel(level);
      setRecommendedAction(action);
      lastActionRef.current = action;
      if (score >= 60) lastEmotionalAtRef.current = Date.now();

      const emotionMap = {
        low: 'calm',
        moderate: 'tense',
        high: 'stressed',
        critical: 'overwhelmed',
      };
      setEmotion(emotionMap[level] || 'neutral');

      setMessages(m => [...m, { role: 'companion', text: responseText, ts: Date.now() }]);

      if (data.ui?.openModal && data.ui.type) {
        setActiveTool(data.ui.type);
      }

      if (!muted && voiceEnabled) {
        speakText(responseText, data.animation || getAnimFromStress(score));
      }
    } catch {
      setMessages(m => [...m, { role: 'companion', text: 'Thanks for checking in. I am here.', ts: Date.now() }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const getAnimFromStress = (s) => {
    if (s <= 20) return 'nod';
    if (s <= 50) return 'speaking';
    if (s <= 80) return 'calming';
    return 'breathing';
  };

  /* ── Text-to-Speech ── */
  const browserSpeak = (text, nextAnim = 'idle') => {
    if (!window.speechSynthesis) {
      setSpeaking(false);
      setAnim('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Try selected voice, or pick one matching the companion language
    let voice = getSelectedVoice();
    if (!voice) {
      const allVoices = window.speechSynthesis.getVoices();
      voice = findVoiceForLang(allVoices, companionLang) || allVoices[0] || null;
      if (voice && !selectedVoiceURI) {
        setSelectedVoiceURI(voice.voiceURI);
        localStorage.setItem('with_u_voice', voice.voiceURI);
      }
    }
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 0.95;
    // Set lang to match the voice or companion language
    const langCodes = LANG_MAP[companionLang] || [companionLang];
    u.lang = voice?.lang || langCodes[0] || 'en';
    u.onend = () => { setSpeaking(false); setAnim(nextAnim); setTimeout(() => setAnim('idle'), 2000); };
    u.onerror = () => { setSpeaking(false); setAnim('idle'); };
    window.speechSynthesis.speak(u);
  };

  const speakText = async (text, nextAnim = 'idle') => {
    if (!voiceEnabled) return;
    setSpeaking(true);
    setAnim('speaking');
    try {
      const result = await voiceService.speak(text);
      if (result?.audio && !result.mock) {
        const a = result.audio;
        a.onended = () => { setSpeaking(false); setAnim(nextAnim); setTimeout(() => setAnim('idle'), 2000); };
        a.onerror = () => browserSpeak(text, nextAnim);
      } else {
        browserSpeak(text, nextAnim);
      }
    } catch {
      // ElevenLabs failed — use browser speech
      browserSpeak(text, nextAnim);
    }
  };

  const reducedUI = stressLevel === 'high' || stressLevel === 'critical';
  const suggestions = getSuggestions(stressLevel, recommendedAction, reducedUI);
  const sc = stressColor(stress);

  const handleToolClick = (tool) => {
    if (tool === 'games') { navigate('/app/games'); return; }
    if (tool === 'external_help') { navigate('/app/gentlereach'); return; }
    if (tool === 'quiz') setQuizOffered(true);
    if (tool) setActiveTool(tool);
  };

  const quickTools = [
    { id: 'breathing', icon: Wind, label: 'Breathe', color: 'text-cyan-400' },
    { id: 'audio', icon: Music, label: 'Sounds', color: 'text-violet-400' },
    { id: 'reset', icon: RotateCcw, label: 'Reset', color: 'text-amber-400' },
    { id: 'gratitude', icon: Sparkles, label: 'Gratitude', color: 'text-pink-400' },
    { id: 'games', icon: Gamepad2, label: 'Games', color: 'text-emerald-400' },
  ];
  const visibleQuickTools = reducedUI
    ? quickTools.filter((t) => t.id !== 'games')
    : quickTools;

  const lateNights = trackingEnabled ? getLateNightCount(7) : 0;

  return (
    <div className="companion-page" style={{ height: '100%' }}>
      <div className="companion-ambient" />

      {/* ══════ MAIN 3-COLUMN LAYOUT ══════ */}
      <div className="grid lg:grid-cols-[280px_1fr_280px] gap-3 relative z-10" style={{ height: '100%', padding: '12px', overflow: 'hidden' }}>

        {/* ═══ LEFT: Chat Panel ═══ */}
        <div className="flex flex-col order-2 lg:order-1" style={{ maxHeight: '100%', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] border-b-0 backdrop-blur-xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-violet-500 dark:text-violet-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-white/70">{t('erCompanion.chat')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Voice Selector in Header */}
              <div className="relative" ref={voiceDropdownRef}>
                <button
                  onClick={() => {
                    // Force unlock speechSynthesis (some browsers need user gesture)
                    if (window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      const unlock = new SpeechSynthesisUtterance('');
                      unlock.volume = 0;
                      window.speechSynthesis.speak(unlock);
                      window.speechSynthesis.cancel();
                    }
                    setTimeout(() => loadVoices(), 100);
                    setTimeout(() => loadVoices(), 500);
                    setTimeout(() => loadVoices(), 1500);
                    setVoiceDropdownOpen(v => !v);
                  }}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium ${voiceDropdownOpen ? 'bg-violet-500/15 text-violet-400' : 'hover:bg-white/5 text-white/50'}`}
                  title="Choose voice"
                >
                  <Volume2 size={13} />
                  <span className="hidden sm:inline">{selectedVoiceURI ? (voices.find(v => v.voiceURI === selectedVoiceURI)?.name || '').split(' ').slice(0,2).join(' ') : 'Voice'}</span>
                  <ChevronDown size={9} className={`transition-transform ${voiceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {voiceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 right-0 w-72 max-h-64 overflow-y-auto rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-2xl z-50"
                    >
                      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 py-2 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold">Choose Voice ({voices.length})</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { loadVoices(); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                          >
                            ↻ Refresh
                          </button>
                          <button
                            onClick={testVoice}
                            disabled={testingVoice || !selectedVoiceURI}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-400/20 text-[10px] text-violet-600 dark:text-violet-200 hover:bg-violet-500/25 disabled:opacity-30 transition-all"
                          >
                            <Play size={10} />
                            {testingVoice ? 'Playing...' : 'Test'}
                          </button>
                        </div>
                      </div>
                      <div className="p-1">
                        {voices.length === 0 && (
                          <div className="px-3 py-4 text-center">
                            <div className="text-[11px] text-slate-400 dark:text-white/30 mb-2">No voices loaded yet</div>
                            <button
                              onClick={() => {
                                if (window.speechSynthesis) {
                                  window.speechSynthesis.cancel();
                                  const u = new SpeechSynthesisUtterance('');
                                  u.volume = 0;
                                  window.speechSynthesis.speak(u);
                                  window.speechSynthesis.cancel();
                                }
                                setTimeout(() => loadVoices(), 200);
                                setTimeout(() => loadVoices(), 1000);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-400/20 text-[10px] text-violet-600 dark:text-violet-200 hover:bg-violet-500/25 transition-all"
                            >
                              ↻ Load Voices
                            </button>
                          </div>
                        )}
                        {voices.map((v) => (
                          <button
                            key={v.voiceURI}
                            onClick={() => handleVoiceSelect(v.voiceURI)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                              selectedVoiceURI === v.voiceURI
                                ? 'bg-violet-500/15 border border-violet-400/20 text-slate-800 dark:text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/60 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">{v.name}</div>
                              <div className="text-[10px] text-slate-400 dark:text-white/30">{getLangLabel(v.lang)} · {v.lang}</div>
                            </div>
                            {selectedVoiceURI === v.voiceURI && (
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => setMuted(!muted)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title={muted ? 'Unmute' : 'Mute'}>
                {muted ? <VolumeX size={14} className="text-white/30" /> : <Volume2 size={14} className="text-white/50" />}
              </button>
              <button onClick={() => setChatExpanded(!chatExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors lg:hidden">
                {chatExpanded ? <ChevronDown size={14} className="text-white/50" /> : <ChevronUp size={14} className="text-white/50" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {pendingNavigate && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="px-4 py-2 bg-violet-500/10 border-x border-violet-400/20 text-[11px] text-violet-200 flex items-center gap-2 backdrop-blur-xl flex-shrink-0"
              >
                <Sparkles size={11} />
                <span>{t('erCompanion.takingYouTo')} <strong>{pendingNavigate.to.replace('/app/', '')}</strong>…</span>
                <button
                  onClick={() => setPendingNavigate(null)}
                  className="ml-auto text-[10px] text-violet-300/70 hover:text-violet-100"
                >{t('erCompanion.cancel')}</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crisis Intervention Banner */}
          <AnimatePresence>
            {crisisDetected && !crisisDismissed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-rose-500/15 border-x border-red-400/30 backdrop-blur-xl">
                  <div className="flex items-start gap-2">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="mt-0.5">
                      <AlertTriangle size={16} className="text-red-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-300 mb-1">You're not alone. Help is available right now.</p>
                      <p className="text-[10px] text-red-200/60 leading-relaxed mb-2">If you or someone you know is in crisis, please reach out immediately.</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <a href="tel:1800-599-0019" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-[10px] text-red-200 font-medium hover:bg-red-500/30 transition-all">
                          <Phone size={10} /> KIRAN 1800-599-0019
                        </a>
                        <a href="tel:9820466726" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-[10px] text-red-200 font-medium hover:bg-red-500/30 transition-all">
                          <Phone size={10} /> AASRA 9820466726
                        </a>
                        <a href="tel:1860-2662-345" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-[10px] text-red-200 font-medium hover:bg-red-500/30 transition-all">
                          <Phone size={10} /> Vandrevala 24/7
                        </a>
                      </div>
                      {/* Show trusted contacts if available */}
                      {(() => {
                        const contacts = JSON.parse(localStorage.getItem('aira_contacts') || '[]');
                        return contacts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {contacts.map((c, i) => (
                              <a key={i} href={`tel:${c.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-[10px] text-emerald-200 font-medium hover:bg-emerald-500/30 transition-all">
                                <Phone size={10} /> {c.name}
                              </a>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <button onClick={() => setCrisisDismissed(true)} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 flex-shrink-0">
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages area — this is the ONLY part that scrolls */}
          {chatExpanded && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 aira-chat-scroll bg-slate-50/50 dark:bg-white/[0.03] border-x border-slate-200/50 dark:border-white/[0.06] backdrop-blur-xl" style={{ minHeight: 0 }}>
              {messages.map((m, i) => {
                const isLatestCompanion = m.role === 'companion' && i === messages.length - 1;
                return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'aira-bubble-user' : 'aira-bubble-companion'
                  }`}>
                    {m.role === 'companion' && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-violet-400/60 dark:text-violet-400/60 font-medium">With_U</span>
                        {isLatestCompanion && speaking && (
                          <div className="flex items-end gap-[2px] h-3">
                            <motion.div className="w-[2px] bg-violet-400/60 rounded-full" animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }} />
                            <motion.div className="w-[2px] bg-violet-400/60 rounded-full" animate={{ height: ['70%', '30%', '70%'] }} transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} />
                            <motion.div className="w-[2px] bg-violet-400/60 rounded-full" animate={{ height: ['30%', '80%', '30%'] }} transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-slate-800 dark:text-white/85">{m.text}</span>
                  </div>
                </motion.div>
                );
              })}
              {analyzing && (
                <div className="flex justify-start">
                  <div className="aira-bubble-companion px-4 py-3 rounded-2xl">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
                      className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Chat Input — pinned at bottom */}
          <div className="rounded-b-2xl bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] border-t-0 backdrop-blur-xl p-2 flex-shrink-0">
            <div className="flex gap-1.5 items-center">
              {/* Companion Language Selector (only affects AI conversation) */}
              <div className="relative flex-shrink-0" ref={companionLangRef}>
                <button
                  onClick={() => setCompanionLangOpen(v => !v)}
                  className="p-1.5 rounded-lg bg-white/60 dark:bg-white/[0.04] border border-slate-200/40 dark:border-white/[0.08] text-slate-500 dark:text-white/60 hover:text-violet-500 dark:hover:text-white/90 transition-all flex items-center gap-0.5"
                  title="AI conversation language"
                >
                  <Languages size={12} />
                  <span className="text-[9px] font-medium">{(COMPANION_LANGS.find(l => l.code === companionLang) || COMPANION_LANGS[0]).code.toUpperCase()}</span>
                  <ChevronDown size={8} className={`transition-transform ${companionLangOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {companionLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 w-48 max-h-64 overflow-y-auto rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-2xl z-50"
                    >
                      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 py-2 border-b border-slate-200/50 dark:border-white/10">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold">AI Language</span>
                      </div>
                      <div className="p-1">
                        {COMPANION_LANGS.map((l) => (
                          <button
                            key={l.code}
                            onClick={() => {
                              setCompanionLang(l.code);
                              localStorage.setItem('with_u_companion_lang', l.code);
                              setCompanionLangOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                              companionLang === l.code
                                ? 'bg-violet-500/15 border border-violet-400/20 text-slate-800 dark:text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/60 border border-transparent'
                            }`}
                          >
                            <span>{l.label}</span>
                            <span className="opacity-40 text-[10px]">{l.code.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={t('erCompanion.placeholder')}
                className="flex-1 min-w-0 bg-white/70 dark:bg-white/[0.04] border border-slate-200/40 dark:border-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white/80 placeholder:text-slate-400/50 dark:placeholder:text-white/15 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/20 backdrop-blur-md transition-all"
                id="companion-input"
              />
              <VoiceInput
                onTranscript={(text) => sendText(text)}
                onSpeakingChange={setUserSpeaking}
                lang={companionLang}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={sendMessage} disabled={analyzing || !input.trim()}
                className="p-2 rounded-lg bg-violet-500/20 border border-violet-400/20 text-violet-300 disabled:opacity-20 hover:bg-violet-500/30 transition-all flex-shrink-0"
                id="companion-send">
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ═══ CENTER: With_U 3D Model ═══ */}
        <div className="flex flex-col items-center justify-center order-1 lg:order-2 relative min-h-[400px] lg:min-h-0" style={{ overflow: 'hidden' }}>

          <div className="relative w-full flex-1 flex items-center justify-center">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <video
                  autoPlay muted playsInline
                  className="max-w-[280px] max-h-[280px] rounded-2xl"
                  onEnded={(e) => e.target.style.display = 'none'}
                >
                  <source src="/logo-intro.mp4" type="video/mp4" />
                </video>
              </div>
            }>
              <AiraModel3D animation={userSpeaking ? 'listening' : anim} stress={stress} isSpeaking={speaking} className="w-full h-full" />
            </Suspense>

            {/* Floating companion message */}
            <AnimatePresence mode="wait">
              <motion.div key={stress} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-white/[0.06] border border-slate-200/40 dark:border-white/[0.08] backdrop-blur-xl z-20">
                <p className="text-sm text-slate-600 dark:text-white/50 italic text-center whitespace-nowrap">
                  "{companionMsg(stress)}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Animation state + AI source indicator */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${
                    userSpeaking ? 'bg-rose-400/80' :
                    anim === 'idle' ? 'bg-emerald-400/60' :
                    anim === 'listening' ? 'bg-amber-400/60' :
                    anim === 'speaking' ? 'bg-violet-400/60' :
                    'bg-cyan-400/60'
                  }`} />
                <span className="text-[10px] text-white/30 capitalize">
                  {userSpeaking ? t('erCompanion.hearingYou') : anim}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  aiSource === 'huggingface' ? 'bg-fuchsia-400' :
                  aiSource === 'gemini' ? 'bg-cyan-400' :
                  'bg-white/20'
                }`} />
                <span className="text-[9px] text-white/40 uppercase tracking-wider">
                  {aiSource === 'huggingface' ? 'Hugging Face' : aiSource === 'gemini' ? 'Gemini' : 'Local'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Relief Tool Bar */}
          <div className="w-full px-4 pb-2 relative z-20">
            <div className="flex items-center justify-center gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
              {visibleQuickTools.map((tool) => (
                <motion.button key={tool.id} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleToolClick(tool.id)}
                  className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all group"
                  title={tool.label}>
                  <tool.icon size={18} className={`${tool.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors">{tool.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Insights Panel ═══ */}
        <div className="space-y-4 order-3 overflow-y-auto" style={{ maxHeight: '100%' }}>
          {/* Stress Meter */}
          <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] backdrop-blur-xl p-5 text-center card-hover-glow">
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-white/25 mb-4 uppercase tracking-[0.2em]">{t('erCompanion.invisibleStress')}</h3>
            <StressRing value={stress} />
            <div className={`mt-3 text-xs font-semibold ${sc.text}`}>{sc.label}</div>
            <StressBreakdown breakdown={stressBreakdown} />
          </div>

          {/* Emotion */}
          <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] backdrop-blur-xl p-5 card-hover-glow">
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-white/25 mb-3 uppercase tracking-[0.2em]">{t('erCompanion.detectedEmotion')}</h3>
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sc.bg} flex items-center justify-center`}>
                <Activity size={16} className="text-white/80" />
              </motion.div>
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-white/80 capitalize">{emotion}</div>
                <div className="text-[10px] text-slate-400 dark:text-white/30">{t('erCompanion.currentState')}</div>
              </div>
            </div>
            {lateNights > 2 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <Moon size={12} className="text-amber-400" />
                <span className="text-[10px] text-amber-300/70">{lateNights} late nights this week</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] backdrop-blur-xl p-5 card-hover-glow">
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-white/25 mb-3 uppercase tracking-[0.2em]">{t('erCompanion.suggestedForYou')}</h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <motion.button key={s.label} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => s.tool && handleToolClick(s.tool)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/[0.03] hover:bg-white/60 dark:hover:bg-white/[0.06] border border-slate-200/30 dark:border-white/[0.05] transition-all group">
                  <span className="text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                  <span className="text-sm text-slate-600 dark:text-white/60 group-hover:text-slate-800 dark:group-hover:text-white/80 transition-colors">{s.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Trusted Contacts — shows when stress > 50% */}
          {stress > 50 && (
            <div className="rounded-2xl bg-rose-500/5 border border-rose-400/10 backdrop-blur-xl p-5 card-hover-glow">
              <div className="flex items-center gap-2 mb-3">
                <Phone size={14} className="text-rose-400" />
                <span className="text-xs font-medium text-rose-300/80">{t('erCompanion.trustedContacts')}</span>
              </div>
              {stress > 80 && (
                <p className="text-[11px] text-rose-200/60 leading-relaxed mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-400/10">
                  {t('erCompanion.reachOutPrompt')}
                </p>
              )}
              {(() => {
                const contacts = JSON.parse(localStorage.getItem('aira_contacts') || '[]');
                return contacts.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <div>
                          <div className="text-xs text-white/80 font-medium">{c.name}</div>
                          <div className="text-[10px] text-white/40">{c.phone}</div>
                        </div>
                        <div className="flex gap-1">
                          <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 hover:bg-emerald-500/25">
                            <Phone size={12} />
                          </a>
                          <button onClick={() => {
                            const list = JSON.parse(localStorage.getItem('aira_contacts') || '[]');
                            list.splice(i, 1);
                            localStorage.setItem('aira_contacts', JSON.stringify(list));
                            setStress(s => s); // force re-render
                          }} className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-rose-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-white/30 mb-3">{t('erCompanion.noContacts')}</p>
                );
              })()}
              <button
                onClick={() => {
                  const name = prompt(t('erCompanion.contactName'));
                  if (!name) return;
                  const phone = prompt(t('erCompanion.phoneNumber'));
                  if (!phone) return;
                  const list = JSON.parse(localStorage.getItem('aira_contacts') || '[]');
                  list.push({ name, phone });
                  localStorage.setItem('aira_contacts', JSON.stringify(list));
                  setStress(s => s);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 hover:bg-white/[0.08] transition-all"
              >
                <Plus size={12} /> Add trusted contact
              </button>
            </div>
          )}

          {/* NGO / Helplines — shows when stress > 80% */}
          {stress > 80 && (
            <div className="rounded-2xl bg-violet-500/5 border border-violet-400/10 backdrop-blur-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-violet-400" />
                <span className="text-xs font-medium text-violet-300/80">Support Options</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">
                Talk to someone who listens. These are free and confidential.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'KIRAN Helpline', phone: '1800-599-0019', desc: 'Govt. mental health' },
                  { name: 'Vandrevala Foundation', phone: '1860-2662-345', desc: '24/7 support' },
                  { name: 'iCall', phone: '9152987821', desc: 'Counseling support' },
                  { name: 'AASRA', phone: '9820466726', desc: 'Crisis intervention' },
                ].map((ngo) => (
                  <a key={ngo.name} href={`tel:${ngo.phone}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all group">
                    <div>
                      <div className="text-xs text-white/80 font-medium group-hover:text-white">{ngo.name}</div>
                      <div className="text-[10px] text-white/30">{ngo.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-violet-300/60">{ngo.phone}</span>
                      <Phone size={12} className="text-violet-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Aira Status */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-400/10 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} className="text-violet-400" />
              <span className="text-xs font-medium text-violet-300/80">Aira is with you</span>
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Stress is tracked invisibly — your typing patterns, session time, time of day, and message tone. No camera, no intrusion.
            </p>
          </div>
        </div>
      </div>

      {/* Tool Modal */}
      <ToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        onAnimationChange={setAnim}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
}
