import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && document.documentElement.classList.contains('dark'));
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="btn-ghost !p-2 !rounded-full"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
