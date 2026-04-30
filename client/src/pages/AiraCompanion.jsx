import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Volume2,
  VolumeX,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Activity,
  Clock,
  Moon,
  Keyboard,
  AlertTriangle,
  Phone,
  PhoneCall,
  PhoneOff,
  Globe,
  Mic,
  Play,
  Languages,
} from 'lucide-react';
import api from '../services/api';
import sessionService from '../services/sessionService';
import contactService from '../services/contactService';
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
import { RetellWebClient } from 'retell-client-js-sdk';

const AiraModel3D = lazy(() => import('../components/AiraModel3D'));

const formatSessionTime = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString();
  } catch {
    return '';
  }
};

const buildSupportOptions = (region) => {
  const common = [
    { label: 'Talk to someone who listens', detail: 'Volunteer listeners · 24/7', action: 'https://www.7cups.com' },
    { label: 'Find local helplines', detail: 'Regional numbers by country', action: 'https://findahelpline.com' },
  ];

  if (region === 'india') {
    return [
      { label: 'Kiran Helpline', detail: '1800-599-0019', action: 'tel:18005990019' },
      { label: 'AASRA', detail: '+91 9820466726', action: 'tel:+919820466726' },
      ...common,
    ];
  }

  return common;
};

const sessionSummary = (s) => ({
  _id: s._id,
  title: s.title,
  lastMessage: s.lastMessage || '',
  lastStressScore: s.lastStressScore || 0,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
  messageCount: s.messageCount || s.messages?.length || 0,
});

export default function AiraCompanion() {
  // `t` follows the GLOBAL i18n language (from the navbar selector) — it controls
  // UI labels (suggestions, status pill, history, stress meter, etc.). The companion
  // language ONLY controls Aira's conversation replies + the TTS voice for them.
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const trackingEnabled = user?.settings?.privacyMode ? false : true;
  const voiceEnabled = user?.settings?.voiceResponses !== false;
  const firstName = user?.name?.split(' ')[0] || t('common.friend');

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const [messages, setMessages] = useState([]);
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
  const [lastMessageStress, setLastMessageStress] = useState(0);
  const [recommendedAction, setRecommendedAction] = useState('none');
  const [quizOffered, setQuizOffered] = useState(false);
  const [screenTimePrompted, setScreenTimePrompted] = useState(false);
  const [aiSource, setAiSource] = useState('local');
  const [context, setContext] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', phone: '' });
  const [savingContact, setSavingContact] = useState(false);

  // Voice selection
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => localStorage.getItem('with_u_voice') || '');
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const voiceDropdownRef = useRef(null);

  // ── Companion-specific language ──
  // This is INDEPENDENT of i18n.language (which controls dashboard/header text).
  // Changing this only changes what language Aira speaks/replies in INSIDE the companion.
  const [companionLang, setCompanionLang] = useState(() => localStorage.getItem('with_u_companion_lang') || i18n.language || 'en');
  const [companionLangOpen, setCompanionLangOpen] = useState(false);
  const companionLangRef = useRef(null);
  const COMPANION_LANGS = [
    { code: 'en', native: 'English' },
    { code: 'hi', native: 'हिन्दी' },
    { code: 'kn', native: 'ಕನ್ನಡ' },
    { code: 'ta', native: 'தமிழ்' },
    { code: 'te', native: 'తెలుగు' },
    { code: 'ml', native: 'മലയാളം' },
    { code: 'bn', native: 'বাংলা' },
    { code: 'mr', native: 'मराठी' },
    { code: 'gu', native: 'ગુજરાતી' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', native: 'اردو' },
  ];
  const setCompanionLanguage = (code) => {
    setCompanionLang(code);
    localStorage.setItem('with_u_companion_lang', code);
    setCompanionLangOpen(false);
  };
  useEffect(() => {
    const handler = (e) => { if (companionLangRef.current && !companionLangRef.current.contains(e.target)) setCompanionLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Greeting that Aira opens with — this is conversation, so it follows companionLang
  const companionT = (key, opts) => i18n.getFixedT(companionLang)(key, opts);

  // Retell AI Call states
  const [callState, setCallState] = useState('idle'); // idle | calling | connected | ended | error
  const [callError, setCallError] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const retellClientRef = useRef(null);
  const callTimerRef = useRef(null);

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

  // Greeting is conversation, so it speaks the companion language — not the UI language
  const greetingText = companionT('companion.greeting', { name: firstName });

  const stressMeta = (value) => {
    if (value <= 20) return { label: t('stress.calm'), color: 'text-emerald-300', fill: '#34d399' };
    if (value <= 50) return { label: t('stress.mild'), color: 'text-amber-300', fill: '#fbbf24' };
    if (value <= 80) return { label: t('stress.high'), color: 'text-orange-300', fill: '#f97316' };
    return { label: t('stress.critical'), color: 'text-red-300', fill: '#ef4444' };
  };

  const ACTION_META = {
    breathing: { icon: '🌬️', label: t('relief.breathing'), tool: 'breathing' },
    audio: { icon: '🎧', label: t('relief.audio'), tool: 'audio' },
    reset: { icon: '🧘', label: t('relief.reset'), tool: 'reset' },
    gratitude: { icon: '✨', label: t('relief.gratitude'), tool: 'gratitude' },
    checkin: { icon: '🫧', label: t('relief.checkin'), tool: 'quiz' },
    quiet: { icon: '🌙', label: t('relief.quiet'), tool: 'quiet' },
    external_help: { icon: '🆘', label: t('support.reachOut'), tool: 'external_help' },
  };

  const getSuggestions = (score) => {
    if (score <= 20) return [ACTION_META.audio, ACTION_META.reset];
    if (score <= 50) return [ACTION_META.breathing, ACTION_META.audio, ACTION_META.checkin];
    if (score <= 80) return [ACTION_META.breathing, ACTION_META.gratitude, ACTION_META.quiet];
    return [ACTION_META.breathing, ACTION_META.external_help];
  };

  const reducedUI = stress >= 51;
  const suggestions = getSuggestions(stress).slice(0, reducedUI ? 2 : 3);

  const supportRegion = user?.timezone?.includes('Kolkata') ? 'india' : 'global';
  const supportOptions = buildSupportOptions(supportRegion);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis?.getVoices() || [];
      setVoices(allVoices);
      // Auto-select saved voice or first matching language voice
      if (!selectedVoiceURI && allVoices.length > 0) {
        const langCode = i18n.language || 'en';
        const match = allVoices.find(v => v.lang.startsWith(langCode)) || allVoices[0];
        if (match) {
          setSelectedVoiceURI(match.voiceURI);
          localStorage.setItem('with_u_voice', match.voiceURI);
        }
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // When the user switches the COMPANION language (NOT the global UI language),
  // auto-switch the TTS voice to match. The dashboard/header text stays untouched.
  useEffect(() => {
    const allVoices = window.speechSynthesis?.getVoices() || [];
    if (!allVoices.length) return;
    const lang = companionLang || 'en';
    const langTagMap = { en: 'en', hi: 'hi', kn: 'kn', ta: 'ta', te: 'te', ml: 'ml', bn: 'bn', mr: 'mr', gu: 'gu', pa: 'pa', ur: 'ur', ar: 'ar', es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt' };
    const prefix = langTagMap[lang] || lang;
    const current = allVoices.find(v => v.voiceURI === selectedVoiceURI);
    if (current && current.lang?.toLowerCase().startsWith(prefix.toLowerCase())) return;
    const preferred = lang === 'en'
      ? (allVoices.find(v => v.lang === 'en-IN') || allVoices.find(v => v.lang?.startsWith('en')))
      : allVoices.find(v => v.lang?.toLowerCase().startsWith(prefix.toLowerCase()));
    if (preferred) {
      setSelectedVoiceURI(preferred.voiceURI);
      localStorage.setItem('with_u_voice', preferred.voiceURI);
    }
  }, [companionLang, voices]);

  // Close voice dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(e.target)) setVoiceDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getSelectedVoice = () => voices.find(v => v.voiceURI === selectedVoiceURI) || null;

  const handleVoiceSelect = (voiceURI) => {
    setSelectedVoiceURI(voiceURI);
    localStorage.setItem('with_u_voice', voiceURI);
    setVoiceDropdownOpen(false);
  };

  const testVoice = () => {
    const voice = getSelectedVoice();
    if (!voice || testingVoice) return;
    setTestingVoice(true);
    window.speechSynthesis.cancel();
    const langCode = companionLang || 'en';
    const testTexts = {
      en: 'Hello! I am your WITH-U companion. I am here to support you.',
      hi: 'नमस्ते! मैं आपकी WITH-U साथी हूँ। मैं आपकी मदद के लिए यहाँ हूँ।',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ WITH-U ಸಂಗಾತಿ. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.',
      ta: 'வணக்கம்! நான் உங்கள் WITH-U தோழன். நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்.',
      te: 'నమస్కారం! నేను మీ WITH-U సహచరుడిని. నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను.',
      ml: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ WITH-U കൂട്ടാളിയാണ്. ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്.',
      bn: 'নমস্কার! আমি আপনার WITH-U সঙ্গী। আমি আপনাকে সাহায্য করতে এখানে আছি।',
      mr: 'नमस्कार! मी तुमचा WITH-U सोबती आहे. मी तुम्हाला मदत करायला इथे आहे.',
      gu: 'નમસ્તે! હું તમારો WITH-U સાથી છું. હું તમને મદદ કરવા અહીં છું.',
      pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ WITH-U ਸਾਥੀ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਇੱਥੇ ਹਾਂ।',
      ur: 'السلام علیکم! میں آپ کا WITH-U ساتھی ہوں۔ میں آپ کی مدد کے لیے یہاں ہوں۔',
    };
    const u = new SpeechSynthesisUtterance(testTexts[langCode] || testTexts.en);
    u.voice = voice;
    // Use the voice's own lang so the test always matches the chosen voice
    u.lang = voice.lang || 'en-US';
    u.rate = 0.95;
    u.pitch = 1.0;
    u.onend = () => setTestingVoice(false);
    u.onerror = () => setTestingVoice(false);
    window.speechSynthesis.speak(u);
  };

  // Get language-appropriate voices for dropdown grouping
  const getLangLabel = (langCode) => {
    const map = { en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi', ur: 'Urdu' };
    return map[langCode?.split('-')[0]] || langCode;
  };

  useEffect(() => {
    lastMessageStressRef.current = lastMessageStress;
  }, [lastMessageStress]);

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

  useEffect(() => {
    recalcStress(lastMessageStress);
  }, [lastMessageStress]);

  useEffect(() => {
    const level = stress <= 20 ? 'low' : stress <= 50 ? 'moderate' : stress <= 80 ? 'high' : 'critical';
    if (level !== stressLevel) setStressLevel(level);
  }, [stress]);

  useEffect(() => {
    if (input.length > 0 && !analyzing) {
      setAnim('listening');
    } else if (!analyzing && !speaking) {
      setAnim('idle');
    }
  }, [input, analyzing, speaking]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await sessionService.list();
        const items = (res.items || []).map(sessionSummary);
        setSessions(items);
        if (items.length) {
          await openSession(items[0]._id);
        } else {
          await createSession();
        }
      } catch {
        setSessions([]);
        await createSession();
      } finally {
        setLoadingSessions(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const res = await api.post('/api/aira/context');
        setContext(res.data?.context || null);
      } catch {
        setContext(null);
      }
    };
    loadContext();
  }, []);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await contactService.list();
        setContacts(res.items || []);
      } catch {
        setContacts([]);
      }
    };
    loadContacts();
  }, []);

  const openSession = async (id) => {
    if (!id) return;
    setActiveSessionId(id);
    try {
      const res = await sessionService.get(id);
      const session = res.session;
      const msgs = (session?.messages || []).map((m) => ({
        role: m.role,
        text: m.text,
        ts: m.ts,
      }));
      if (!msgs.length) {
        const greeting = { role: 'companion', text: greetingText, ts: Date.now() };
        setMessages([greeting]);
        await sessionService.appendMessages(id, [greeting]);
      } else {
        setMessages(msgs);
      }
      setLastMessageStress(session?.lastStressScore || 0);
      sessionStartRef.current = Date.now();
    } catch {
      setMessages([{ role: 'companion', text: greetingText, ts: Date.now() }]);
    }
  };

  const createSession = async () => {
    try {
      const res = await sessionService.create({ title: t('companion.newSession') });
      const session = sessionSummary(res.session);
      setSessions((prev) => [session, ...prev]);
      await openSession(session._id);
    } catch {
      setSessions([]);
    }
  };

  const updateSessionMeta = (id, lastMessage, lastStressScore) => {
    setSessions((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              lastMessage,
              lastStressScore: typeof lastStressScore === 'number' ? lastStressScore : s.lastStressScore,
              updatedAt: new Date().toISOString(),
              messageCount: (s.messageCount || 0) + 1,
            }
          : s
      )
    );
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length < input.length) {
      typingAnalyzerRef.current.recordKey(true, input.length - val.length);
    } else {
      typingAnalyzerRef.current.recordKey(false, val.length - input.length);
    }
    setInput(val);
  };

  const sendText = async (textOverride) => {
    const txt = (textOverride ?? input).trim();
    if (!txt || analyzing) return;
    setInput('');

    lastInteractionRef.current = Date.now();
    interactionCountRef.current += 1;

    const userMsg = { role: 'user', text: txt, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setAnalyzing(true);
    setAnim('listening');

    if (activeSessionId) {
      sessionService.appendMessages(activeSessionId, [userMsg]).catch(() => {});
      updateSessionMeta(activeSessionId, userMsg.text, null);
    }

    const latest = recalcStress();
    const previous_state = {
      stress_level: stressLevel,
      emotional_state: emotion,
      last_action: lastActionRef.current,
      quizOffered,
      screenTimePrompted,
    };

    const history = [...messages.slice(-5), userMsg].map((m) => ({ role: m.role, text: m.text }));

    try {
      const { data } = await api.post('/api/companion/analyze-text', {
        text: txt,
        signals: latest?.signals || {},
        previous_state,
        userName: firstName,
        history,
        language: companionLang,
      });

      const responseText = data.message || "Hey… I'm here. Tell me what's on your mind.";
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

      const emotionMap = { low: 'calm', moderate: 'tense', high: 'stressed', critical: 'overwhelmed' };
      setEmotion(data.emotion || emotionMap[level] || 'neutral');

      const animState = data.animation || (score <= 50 ? 'speaking' : score <= 80 ? 'calming' : 'breathing');
      setAnim('speaking');
      setSpeaking(true);

      await new Promise((r) => setTimeout(r, 500));
      const companionMsg = { role: 'companion', text: responseText, ts: Date.now() };
      setMessages((m) => [...m, companionMsg]);

      if (activeSessionId) {
        sessionService.appendMessages(activeSessionId, [
          { ...companionMsg, stressScore: score },
        ]).catch(() => {});
        updateSessionMeta(activeSessionId, responseText, score);
      }

      if (data.ui?.openModal && data.ui.type && data.ui.type !== 'none') {
        setActiveTool(data.ui.type);
        if (data.ui.type === 'quiz') setQuizOffered(true);
      }

      if (data.ui?.navigateTo) {
        navigate(data.ui.navigateTo);
      }

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
          setTimeout(() => setAnim('idle'), 2400);
        }, 1800);
      }
    } catch {
      setMessages((m) => [...m, { role: 'companion', text: "Hmm… something went wrong on my end. Can you try saying that again?", ts: Date.now() }]);
      setAnim('idle');
      setSpeaking(false);
    } finally {
      setAnalyzing(false);
    }
  };

  // Map UI lang code → BCP-47 tag the SpeechSynthesis engine expects
  const BCP47 = {
    en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
    ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN',
    ur: 'ur-IN', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    it: 'it-IT', pt: 'pt-BR', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',
  };

  // Speak via browser TTS using the user's chosen voice + correct language.
  const speakBrowser = (text, nextAnim) => {
    try { window.speechSynthesis.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    const langTag = BCP47[companionLang] || 'en-US';
    u.lang = langTag;

    // Priority: user's explicit dropdown choice → best match for selected language
    let voice = getSelectedVoice();
    const allVoices = window.speechSynthesis?.getVoices() || [];
    if (!voice || (voice.lang && companionLang !== 'en' && !voice.lang.toLowerCase().startsWith(companionLang))) {
      const langPrefix = langTag.split('-')[0];
      voice = allVoices.find((v) => v.lang?.toLowerCase().startsWith(langTag.toLowerCase())) ||
              allVoices.find((v) => v.lang?.toLowerCase().startsWith(langPrefix)) ||
              voice ||
              allVoices[0];
    }
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.pitch = 1.0;
    u.onend = () => {
      setSpeaking(false);
      setAnim(nextAnim);
      setTimeout(() => setAnim('idle'), 2000);
    };
    u.onerror = () => {
      setSpeaking(false);
      setAnim('idle');
    };
    window.speechSynthesis.speak(u);
  };

  const speakText = async (text, nextAnim = 'idle') => {
    if (!voiceEnabled) return;
    setSpeaking(true);
    setAnim('speaking');

    // If user has explicitly chosen a voice from the dropdown, ALWAYS honor it
    // (server TTS is one fixed voice and ignores gender/language preference).
    const userPickedVoice = !!localStorage.getItem('with_u_voice');
    const isNonEnglish = companionLang && companionLang !== 'en';

    if (userPickedVoice || isNonEnglish) {
      speakBrowser(text, nextAnim);
      return;
    }

    try {
      const result = await voiceService.speak(text);
      if (result?.audio && !result.mock) {
        const audio = result.audio;
        audio.onended = () => {
          setSpeaking(false);
          setAnim(nextAnim);
          setTimeout(() => setAnim('idle'), 2000);
        };
      } else {
        speakBrowser(text, nextAnim);
      }
    } catch {
      speakBrowser(text, nextAnim);
    }
  };

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
        language: companionLang,
      });

      const responseText = data.message || "I've noted that. How are you feeling right now?";
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

      const companionMsg = { role: 'companion', text: responseText, ts: Date.now() };
      setMessages((m) => [...m, companionMsg]);

      if (activeSessionId) {
        sessionService.appendMessages(activeSessionId, [
          { ...companionMsg, stressScore: score },
        ]).catch(() => {});
        updateSessionMeta(activeSessionId, responseText, score);
      }

      if (data.ui?.openModal && data.ui.type) {
        setActiveTool(data.ui.type);
      }

      if (!muted && voiceEnabled) {
        speakText(responseText, data.animation || 'speaking');
      }
    } catch {
      setMessages((m) => [...m, { role: 'companion', text: "Something didn't quite work. Let's try again — how are you feeling?", ts: Date.now() }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCallAira = async () => {
    setCallState('calling'); setCallError(''); setCallDuration(0);
    try {
      const { data } = await api.post('/api/call/call-aira');
      if (!data.success || !data.access_token) {
        setCallState('error'); setCallError(data.message || 'Could not start call');
        return;
      }

      const retellClient = new RetellWebClient();
      retellClientRef.current = retellClient;

      retellClient.on('call_started', () => {
        setCallState('connected');
        const start = Date.now();
        callTimerRef.current = setInterval(() => setCallDuration(Math.floor((Date.now() - start) / 1000)), 1000);
      });
      retellClient.on('call_ended', () => { endAiraCall('ended'); });
      retellClient.on('error', (err) => { endAiraCall('error', err?.message || 'Call error'); });
      retellClient.on('agent_start_talking', () => { setAnim('speaking'); setSpeaking(true); });
      retellClient.on('agent_stop_talking', () => { setAnim('idle'); setSpeaking(false); });

      await retellClient.startCall({ accessToken: data.access_token });
    } catch (err) {
      setCallState('error'); setCallError(err.response?.data?.message || 'Could not connect');
    }
  };

  const endAiraCall = (state = 'idle', error = '') => {
    if (retellClientRef.current) { try { retellClientRef.current.stopCall(); } catch {} retellClientRef.current = null; }
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
    setCallState(state); if (error) setCallError(error);
    setAnim('idle'); setSpeaking(false);
  };

  const handleToolClick = (tool) => {
    if (tool === 'external_help') return;
    if (tool) setActiveTool(tool);
  };

  const handleAddContact = async () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
    setSavingContact(true);
    try {
      const res = await contactService.create({
        name: contactForm.name.trim(),
        phone: contactForm.phone.trim(),
      });
      setContacts((prev) => [res.contact, ...prev]);
      setContactForm({ name: '', phone: '' });
    } catch {
      // ignore
    } finally {
      setSavingContact(false);
    }
  };

  const stressInfo = stressMeta(stress);
  const lateNights = trackingEnabled ? getLateNightCount(7) : 0;

  return (
    <div className="space-y-5">
      <div
        className="grid grid-cols-1 lg:gap-4"
        style={{ gridTemplateColumns: '1fr', rowGap: '16px' }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-4"
        >
          {/* Left panel: history + chat */}
          <div className="rounded-3xl glass-subtle border border-white/10 overflow-hidden flex flex-col h-[70vh] lg:h-[calc(100vh-210px)] lg:max-h-[calc(100vh-210px)] lg:self-start">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-cyan-300" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">{t('companion.history')}</span>
              </div>
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50"
                aria-label={t('companion.toggleHistory')}
              >
                {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {historyOpen && (
              <div className="px-4 py-3 border-b border-white/10">
                <button
                  onClick={createSession}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/80 hover:bg-white/15"
                >
                  <Plus size={14} /> {t('companion.newSession')}
                </button>
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {loadingSessions && (
                    <div className="text-[11px] text-white/30">{t('common.loading')}</div>
                  )}
                  {!loadingSessions && sessions.length === 0 && (
                    <div className="text-[11px] text-white/30">{t('companion.noSessions')}</div>
                  )}
                  {sessions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => openSession(s._id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border transition-all ${
                        s._id === activeSessionId
                          ? 'bg-white/15 border-white/25 text-white'
                          : 'bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-medium truncate">{s.title || t('companion.sessionFallback')}</div>
                      <div className="text-[10px] text-white/30 mt-1 truncate">{s.lastMessage || t('companion.sessionEmpty')}</div>
                      <div className="text-[9px] text-white/30 mt-1">{formatSessionTime(s.updatedAt || s.createdAt)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 aira-chat-scroll">
              {messages.map((m, i) => (
                <motion.div
                  key={`${m.ts}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' ? 'aira-bubble-user' : 'aira-bubble-companion'
                    }`}
                  >
                    {m.role === 'companion' && (
                      <span className="text-[10px] text-cyan-300/70 block mb-1 font-medium">WITH-U</span>
                    )}
                    <span className="text-white/85 whitespace-pre-line">{m.text}</span>
                  </div>
                </motion.div>
              ))}
              {analyzing && (
                <div className="flex justify-start">
                  <div className="aira-bubble-companion px-4 py-3 rounded-2xl">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="flex gap-1.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Center: Aira 3D companion — height locked so it doesn't drift up as chat grows */}
          <div className="relative rounded-3xl glass-subtle border border-white/10 flex flex-col min-h-[420px] h-[420px] lg:h-[calc(100vh-210px)] lg:max-h-[calc(100vh-210px)] lg:self-start overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-10 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />
            </div>
            <div className="relative flex-1 flex items-center justify-center">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-32 h-32 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-xl"
                    >
                      <span className="text-sm text-white/50">{t('companion.loading')}</span>
                    </motion.div>
                  </div>
                }
              >
                <AiraModel3D
                  animation={userSpeaking ? 'listening' : anim}
                  stress={stress}
                  isSpeaking={speaking}
                  className="w-full h-full"
                />
              </Suspense>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stress}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl"
                >
                  <p className="text-sm text-white/60 italic text-center whitespace-nowrap">
                    "{stress <= 20
                      ? t('companion.status.calm')
                      : stress <= 50
                        ? t('companion.status.mild')
                        : stress <= 80
                          ? t('companion.status.high')
                          : t('companion.status.critical')}"
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${
                      userSpeaking
                        ? 'bg-rose-400/80'
                        : anim === 'idle'
                          ? 'bg-emerald-400/60'
                          : anim === 'listening'
                            ? 'bg-amber-400/60'
                            : anim === 'speaking'
                              ? 'bg-violet-400/60'
                              : 'bg-cyan-400/60'
                    }`}
                  />
                  <span className="text-[10px] text-white/40 capitalize">
                    {userSpeaking ? t('companion.hearing') : anim}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      aiSource === 'huggingface'
                        ? 'bg-violet-400'
                        : aiSource === 'gemini'
                          ? 'bg-cyan-400'
                          : 'bg-white/20'
                    }`}
                  />
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">
                    {aiSource === 'huggingface'
                      ? 'Hugging Face'
                      : aiSource === 'gemini'
                        ? 'Gemini'
                        : t('companion.local')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stress + context */}
          <div className="space-y-4 max-h-[70vh] lg:max-h-[calc(100vh-210px)] overflow-y-auto">
            <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl p-5 text-center">
              <h3 className="text-[10px] font-semibold text-white/30 mb-4 uppercase tracking-[0.2em]">
                {t('stress.title')}
              </h3>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#stressGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 - (stress / 100) * 2 * Math.PI * 42 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="50%" stopColor={stressInfo.fill} />
                      <stop offset="100%" stopColor={stressInfo.fill} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <motion.span key={stress} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`text-lg font-bold ${stressInfo.color}`}>
                    {stress}%
                  </motion.span>
                  <span className="text-[9px] text-white/30">{t('stress.label')}</span>
                </div>
              </div>
              <div className={`mt-3 text-xs font-semibold ${stressInfo.color}`}>{stressInfo.label}</div>
              {stressBreakdown && !reducedUI && (
                <div className="space-y-2 mt-4">
                  {[
                    { label: t('stress.messageTone'), value: stressBreakdown.sentiment, icon: MessageCircle, color: 'text-cyan-300' },
                    { label: t('stress.lateNight'), value: stressBreakdown.lateNight, icon: Moon, color: 'text-indigo-300' },
                    { label: t('stress.sessionTime'), value: stressBreakdown.session, icon: Clock, color: 'text-sky-300' },
                    { label: t('stress.typing'), value: stressBreakdown.typing, icon: Keyboard, color: 'text-amber-300' },
                    { label: t('stress.inactivity'), value: stressBreakdown.interaction, icon: Activity, color: 'text-pink-300' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <item.icon size={11} className={`${item.color} opacity-60`} />
                      <span className="text-[10px] text-white/40 flex-1">{item.label}</span>
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, item.value || 0)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400/80 to-violet-400/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl p-5">
              <h3 className="text-[10px] font-semibold text-white/30 mb-3 uppercase tracking-[0.2em]">
                {t('companion.context')}
              </h3>
              <div className="space-y-3 text-xs text-white/60">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/30">{t('companion.nextMedication')}</div>
                  <div className="text-sm text-white/80">
                    {context?.nextMedication
                      ? `${context.nextMedication.name}${context.nextMedication.dosage ? ` · ${context.nextMedication.dosage}` : ''}`
                      : t('companion.noMedication')}
                  </div>
                  {context?.nextMedication && (
                    <div className="text-[11px] text-white/40">{context.nextMedication.time}</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/30">{t('companion.routine')}</div>
                  {context?.routineSummary?.length ? (
                    <div className="space-y-1 mt-1">
                      {context.routineSummary.slice(0, 3).map((item, i) => (
                        <div key={`${item}-${i}`} className="text-[11px] text-white/60">• {item}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-white/40">{t('companion.routineEmpty')}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl p-5">
              <h3 className="text-[10px] font-semibold text-white/30 mb-3 uppercase tracking-[0.2em]">
                {t('companion.suggested')}
              </h3>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleToolClick(s.tool)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {(stress >= 81 || recommendedAction === 'external_help') && (
              <div className="rounded-3xl bg-rose-500/5 border border-rose-400/10 backdrop-blur-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-xs font-medium text-rose-300/80">{t('support.title')}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {t('support.prompt')}
                </p>
                <div className="space-y-2">
                  {contacts.length === 0 && (
                    <div className="text-[11px] text-white/40">{t('support.noContacts')}</div>
                  )}
                  {contacts.map((c) => (
                    <div key={c._id} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                      <div>
                        <div className="text-xs text-white/80">{c.name}</div>
                        <div className="text-[10px] text-white/40">{c.phone || c.email}</div>
                      </div>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-400/30 text-[10px] text-rose-200"
                        >
                          {t('support.call')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-white/30">{t('support.addContact')}</div>
                  <div className="flex gap-2">
                    <input
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder={t('support.namePlaceholder')}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
                    />
                    <input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder={t('support.phonePlaceholder')}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddContact}
                    disabled={savingContact}
                    className="w-full px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-400/30 text-xs text-rose-100 disabled:opacity-50"
                  >
                    {savingContact ? t('common.loading') : t('support.add')}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-white/30">{t('support.ngos')}</div>
                  {supportOptions.map((s) => (
                    <a
                      key={s.label}
                      href={s.action}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2"
                    >
                      <div>
                        <div className="text-xs text-white/80">{s.label}</div>
                        <div className="text-[10px] text-white/40">{s.detail}</div>
                      </div>
                      <Globe size={12} className="text-white/40" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {lateNights > 2 && !reducedUI && (
              <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-xl p-3 flex items-center gap-2">
                <Moon size={12} className="text-amber-400" />
                <span className="text-[10px] text-amber-300/70">{t('stress.lateNightCount', { count: lateNights })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom chat input */}
      <div className="sticky bottom-4 z-20">
        <div className="max-w-7xl mx-auto w-full glass-strong border border-white/10 rounded-2xl p-3">
          <div className="flex gap-2 items-center">
            {/* Talk to Aira Call Button */}
            <div className="relative">
              {callState === 'idle' || callState === 'error' || callState === 'ended' ? (
                <button
                  onClick={handleCallAira}
                  className="p-2 rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-300 hover:bg-violet-500/20 transition-all"
                  title="Talk to Aira (AI Voice Call)"
                >
                  <PhoneCall size={16} />
                </button>
              ) : callState === 'calling' ? (
                <button disabled className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 animate-pulse">
                  <Phone size={16} />
                </button>
              ) : (
                <button
                  onClick={() => endAiraCall('idle')}
                  className="p-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-all"
                  title="End call"
                >
                  <PhoneOff size={16} />
                </button>
              )}

              <AnimatePresence>
                {callState === 'calling' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-56 p-3 rounded-2xl bg-slate-900/95 border border-amber-400/20 backdrop-blur-xl shadow-2xl">
                    <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5"><Phone size={12} className="animate-bounce" /> Connecting to Aira...</div>
                    <p className="text-[10px] text-white/40 mt-1">Please allow microphone access when prompted.</p>
                  </motion.div>
                )}
                {callState === 'connected' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-64 p-3 rounded-2xl bg-green-900/90 border border-green-400/30 backdrop-blur-xl shadow-2xl">
                    <div className="text-xs text-green-300 font-medium flex items-center gap-1.5"><PhoneCall size={12} /> Live with Aira</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-green-200/60">Speak naturally — Aira is listening.</p>
                      <span className="text-[10px] text-green-300/70 font-mono">{Math.floor(callDuration/60)}:{String(callDuration%60).padStart(2,'0')}</span>
                    </div>
                    <button onClick={() => endAiraCall('idle')} className="mt-2 w-full px-2 py-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-[10px] text-red-200 hover:bg-red-500/30 flex items-center justify-center gap-1"><PhoneOff size={10} /> End Call</button>
                  </motion.div>
                )}
                {callState === 'error' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-56 p-3 rounded-2xl bg-red-900/80 border border-red-400/20 backdrop-blur-xl shadow-2xl">
                    <div className="text-xs text-red-300 font-medium">Call failed</div>
                    <p className="text-[10px] text-red-200/60 mt-1">{callError}</p>
                    <button onClick={() => setCallState('idle')} className="mt-2 text-[10px] text-red-200/50 hover:text-white">Dismiss</button>
                  </motion.div>
                )}
                {callState === 'ended' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-56 p-3 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="text-xs text-white/70 font-medium">Call ended</div>
                    <p className="text-[10px] text-white/40 mt-1">Duration: {Math.floor(callDuration/60)}:{String(callDuration%60).padStart(2,'0')}</p>
                    <button onClick={() => setCallState('idle')} className="mt-2 text-[10px] text-white/50 hover:text-white">Dismiss</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setMuted((v) => !v)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/90"
              title={muted ? t('companion.unmute') : t('companion.mute')}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Companion-only language selector — does NOT change dashboard text */}
            <div className="relative" ref={companionLangRef}>
              <button
                onClick={() => setCompanionLangOpen((v) => !v)}
                className="px-2.5 py-2 rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-200 hover:bg-violet-500/20 transition-all flex items-center gap-1.5"
                title="Aira's language (companion only — won't change dashboard)"
              >
                <Globe size={14} />
                <span className="text-[11px] font-medium uppercase">{companionLang}</span>
                <ChevronDown size={10} className={`transition-transform ${companionLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {companionLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 right-0 w-60 max-h-72 overflow-y-auto rounded-2xl bg-slate-900/95 border border-violet-400/20 backdrop-blur-xl shadow-2xl z-50"
                  >
                    <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl px-3 py-2 border-b border-white/10">
                      <div className="text-[10px] uppercase tracking-wider text-violet-300/80 font-semibold">Aira speaks in</div>
                      <div className="text-[9px] text-white/40 mt-0.5">Only changes the companion. Dashboard stays the same.</div>
                    </div>
                    <div className="p-1">
                      {COMPANION_LANGS.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => setCompanionLanguage(l.code)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                            companionLang === l.code
                              ? 'bg-violet-500/20 border border-violet-400/30 text-white'
                              : 'hover:bg-white/5 text-white/70 border border-transparent'
                          }`}
                        >
                          <span className="font-medium">{l.native}</span>
                          <span className="text-[9px] uppercase opacity-50">{l.code}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Selector */}
            <div className="relative" ref={voiceDropdownRef}>
              <button
                onClick={() => setVoiceDropdownOpen(v => !v)}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/90 transition-all flex items-center gap-1"
                title="Choose voice"
              >
                <Languages size={14} />
                <ChevronDown size={10} className={`transition-transform ${voiceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {voiceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 right-0 w-72 max-h-64 overflow-y-auto rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-2xl z-50"
                  >
                    <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl px-3 py-2 border-b border-white/10 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Choose Voice</span>
                      <button
                        onClick={testVoice}
                        disabled={testingVoice || !selectedVoiceURI}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/20 text-[10px] text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-30 transition-all"
                      >
                        <Play size={10} />
                        {testingVoice ? 'Playing...' : 'Test Voice'}
                      </button>
                    </div>
                    <div className="p-1">
                      {voices.length === 0 && (
                        <div className="px-3 py-4 text-center text-[11px] text-white/30">No voices available</div>
                      )}
                      {voices.map((v) => (
                        <button
                          key={v.voiceURI}
                          onClick={() => handleVoiceSelect(v.voiceURI)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                            selectedVoiceURI === v.voiceURI
                              ? 'bg-cyan-500/15 border border-cyan-400/20 text-white'
                              : 'hover:bg-white/5 text-white/60 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-medium">{v.name}</div>
                            <div className="text-[10px] text-white/30">{getLangLabel(v.lang)} · {v.lang}</div>
                          </div>
                          {selectedVoiceURI === v.voiceURI && (
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          )}
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
              onKeyDown={(e) => e.key === 'Enter' && sendText()}
              placeholder={t('companion.placeholder')}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/20"
            />
            <VoiceInput onTranscript={(text) => sendText(text)} onSpeakingChange={setUserSpeaking} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendText()}
              disabled={analyzing || !input.trim()}
              className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/20 text-cyan-200 disabled:opacity-20 hover:bg-cyan-500/30 transition-all"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <ToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        onAnimationChange={setAnim}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  );
}
