/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        warm: {
          50: '#fdfaf6',
          100: '#fbf3ea',
          200: '#f4dfc7',
          300: '#ecc9a1',
          400: '#dca97a',
          500: '#c08a5a',
          600: '#9a6c44',
          700: '#74522f',
        },
        sage: {
          50: '#f3f6f3',
          100: '#dde8dc',
          200: '#bdd1bb',
          300: '#94b491',
          400: '#6c9469',
          500: '#4f7a4d',
          600: '#3c613b',
          700: '#2f4d2f',
        },
        ink: {
          50: '#f6f6f7',
          100: '#e8e7eb',
          800: '#1f1d24',
          900: '#141319',
        },
        glow: {
          warm: 'rgba(220, 169, 122, 0.35)',
          sage: 'rgba(148, 180, 145, 0.35)',
          amber: 'rgba(245, 158, 11, 0.3)',
        },
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.08)',
        'glass-strong': '0 12px 40px rgba(31, 38, 135, 0.12)',
        soft: '0 4px 24px rgba(0, 0, 0, 0.06)',
        glow: '0 0 40px rgba(192, 138, 90, 0.25)',
        'glow-lg': '0 0 60px rgba(192, 138, 90, 0.35)',
        'glow-sage': '0 0 40px rgba(148, 180, 145, 0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
        },
        'orb-float-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, -100px) scale(0.9)' },
          '75%': { transform: 'translate(50px, -30px) scale(1.05)' },
        },
        'orb-float-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-40px, 30px) scale(1.05)' },
          '50%': { transform: 'translate(60px, 60px) scale(0.95)' },
          '75%': { transform: 'translate(-30px, -40px) scale(1.1)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease-out',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'scale-in': 'scale-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        breathe: 'breathe 4s ease-in-out infinite',
        'orb-1': 'orb-float-1 15s ease-in-out infinite',
        'orb-2': 'orb-float-2 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
