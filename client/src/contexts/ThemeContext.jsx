import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

const apply = (mode) => {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else if (mode === 'light') {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  } else {
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefers);
    root.setAttribute('data-theme', prefers ? 'dark' : 'light');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('with_u_theme') || 'system');

  useEffect(() => {
    apply(theme);
    localStorage.setItem('with_u_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const cb = () => apply('system');
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
