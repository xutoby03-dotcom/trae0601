/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        sand: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
          accent: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
          info: '#3b82f6',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'Noto Sans SC', 'sans-serif'],
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanline 3s linear infinite',
      },
    },
  },
  plugins: [],
};
