import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'hi', label: 'हि', native: 'हिन्दी' },
  { code: 'kn', label: 'ಕ', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'த', native: 'தமிழ்' },
  { code: 'te', label: 'తె', native: 'తెలుగు' },
  { code: 'ml', label: 'മ', native: 'മലയാളം' },
  { code: 'bn', label: 'বা', native: 'বাংলা' },
  { code: 'mr', label: 'म', native: 'मराठी' },
  { code: 'gu', label: 'ગુ', native: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰ', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'ار', native: 'اردو' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const change = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('with_u_lang', code);
    setOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-[10px] opacity-50">🌐</span>
        <span>{current.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 max-h-80 overflow-y-auto glass-strong rounded-xl border border-white/10 shadow-xl z-50 animate-fade-in">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/20 dark:hover:bg-white/10 flex items-center justify-between transition-colors ${
                i18n.language === l.code ? 'font-semibold text-violet-500 bg-violet-500/5' : ''
              }`}
            >
              <span>{l.native}</span>
              <span className="opacity-40 text-[10px]">{l.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
