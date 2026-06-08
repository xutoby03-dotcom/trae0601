/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        radar: {
          bg: '#0a0e1a',
          surface: '#111827',
          border: '#1e293b',
          cyan: '#00f5d4',
          pink: '#f72585',
          amber: '#fca311',
          red: '#ff4757',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        noto: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'radar-scan': 'radar-scan 4s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
        'blink': 'blink 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'radar-scan': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'blink': {
          '0%, 100%': { borderColor: 'rgba(255, 71, 87, 0.3)' },
          '50%': { borderColor: 'rgba(255, 71, 87, 1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
