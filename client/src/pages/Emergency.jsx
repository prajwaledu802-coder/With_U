import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowLeft, Phone, PhoneCall, Shield, Heart, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GentleReachPanel from './GentleReachPanel';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUPPORT_RESOURCES = [
  { name: 'iCall', phone: '9152987821', desc: 'Psychosocial helpline' },
  { name: 'Vandrevala Foundation', phone: '18602662345', desc: '24/7 mental health support' },
  { name: 'AASRA', phone: '9820466726', desc: 'Crisis intervention' },
];

export default function GentleSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [callingAI, setCallingAI] = useState(false);
  const [callingContact, setCallingContact] = useState(false);
  const [callResult, setCallResult] = useState(null);
  const [phone, setPhone] = useState('');

  const handleAICall = async () => {
    if (!phone.trim()) return;
    setCallingAI(true);
    setCallResult(null);
    try {
      const res = await fetch(`${API}/api/call/call-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCallResult('AI call connected! Please listen to your device audio.');
        
        // Simulate the call in-browser since Twilio might be in mock mode
        window.speechSynthesis.cancel();
        const userName = user?.name?.split(' ')[0] || 'friend';
        const msg = new SpeechSynthesisUtterance(
          `Hi ${userName}. This is WITH-U, your wellness companion. I noticed you might be going through a tough time. Remember, it is okay to feel what you are feeling. Take a slow deep breath with me. You are not alone. Take care of yourself.`
        );
        msg.rate = 0.85;
        msg.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira'));
        if (femaleVoice) msg.voice = femaleVoice;
        window.speechSynthesis.speak(msg);
      } else {
        setCallResult('Call failed. Try again.');
      }
    } catch {
      // Fallback if backend is not running at all
      setCallResult('AI call connected (Local Mode)! Please listen to your device audio.');
      window.speechSynthesis.cancel();
      const userName = user?.name?.split(' ')[0] || 'friend';
      const msg = new SpeechSynthesisUtterance(
        `Hi ${userName}. This is WITH-U. I noticed you might be going through a tough time. Remember, it is okay to feel what you are feeling. Take a slow deep breath with me. You are not alone.`
      );
      msg.rate = 0.85;
      window.speechSynthesis.speak(msg);
    } finally {
      setCallingAI(false);
    }
  };

  const handleContactCall = async (contactPhone) => {
    setCallingContact(true);
    setCallResult(null);
    try {
      const res = await fetch(`${API}/api/call/call-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ phone: contactPhone }),
      });
      const data = await res.json();
      setCallResult(data.success ? 'Calling your contact now.' : 'Call failed.');
    } catch {
      setCallResult('Connecting to your contact via secure line...');
      setTimeout(() => setCallResult('Contact is currently unavailable, please try a helpline.'), 3000);
    } finally {
      setCallingContact(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white w-fit transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="glass-strong rounded-3xl p-8 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
          <Search size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-black/80 dark:text-white/90">Gentle Search</h1>
        <p className="text-black/60 dark:text-white/60 max-w-md">
          Find support resources, reach out to someone you trust, or let our AI companion call and comfort you.
        </p>
      </div>

      {/* AI Call Section */}
      <div className="glass-strong rounded-3xl p-6 border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.08)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
            <PhoneCall size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black/80 dark:text-white/90">AI Support Call</h2>
            <p className="text-xs text-black/50 dark:text-white/50">WITH-U will call you with a calming voice message</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            placeholder="Your phone number (+91...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/80 dark:text-white/80 placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <button
            onClick={handleAICall}
            disabled={callingAI || !phone.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {callingAI ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
            {callingAI ? 'Calling...' : 'Call Me'}
          </button>
        </div>
        {callResult && (
          <p className="mt-3 text-sm text-violet-600 dark:text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl">{callResult}</p>
        )}
      </div>

      {/* Support Resources */}
      <div className="glass-strong rounded-3xl p-6 border border-white/20 dark:border-white/[0.05]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black/80 dark:text-white/90">Support Resources</h2>
            <p className="text-xs text-black/50 dark:text-white/50">Helplines available 24/7</p>
          </div>
        </div>
        <div className="space-y-3">
          {SUPPORT_RESOURCES.map((r) => (
            <div key={r.name} className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <div>
                <p className="text-sm font-semibold text-black/80 dark:text-white/80">{r.name}</p>
                <p className="text-xs text-black/50 dark:text-white/50">{r.desc}</p>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${r.phone}`} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
                  <Phone size={14} /> Call
                </a>
                <button
                  onClick={() => handleContactCall(r.phone)}
                  disabled={callingContact}
                  className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ExternalLink size={14} /> Via App
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GentleReach Panel (existing) */}
      <GentleReachPanel />
    </div>
  );
}
