/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f4f9',
          100: '#dbe6f1',
          200: '#b8cce4',
          300: '#8aaad0',
          400: '#5681b7',
          500: '#1e3a5f',
          600: '#1a3354',
          700: '#162b47',
          800: '#12233a',
          900: '#0e1b2d',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(30, 58, 95, 0.1), 0 2px 8px -2px rgba(30, 58, 95, 0.08)',
        'card-hover': '0 12px 40px -4px rgba(30, 58, 95, 0.15), 0 4px 16px -4px rgba(30, 58, 95, 0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(30,58,95,0.05) 1px, transparent 1px)",
        'gradient-primary': 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      },
    },
  },
  plugins: [],
};
