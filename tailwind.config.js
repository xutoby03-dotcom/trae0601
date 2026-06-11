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
        primary: {
          50: '#eef0f8',
          100: '#d5d9ee',
          200: '#aab3dd',
          300: '#7f8dcc',
          400: '#5467bb',
          500: '#2D3A8C',
          600: '#252f72',
          700: '#1c2356',
          800: '#13183b',
          900: '#0a0d20',
        },
        coral: {
          50: '#fef2f0',
          100: '#fde0db',
          200: '#fbc1b7',
          300: '#f8a293',
          400: '#f5836f',
          500: '#E85D4A',
          600: '#c44a39',
          700: '#9a3a2d',
          800: '#6f2a21',
          900: '#451a15',
        },
        ice: {
          50: '#e8f7fd',
          100: '#c5edfb',
          200: '#9de3f9',
          300: '#74d9f7',
          400: '#4FC3F7',
          500: '#29b6f6',
          600: '#0288d1',
          700: '#0277bd',
          800: '#01579b',
          900: '#003d6b',
        },
        warm: {
          50: '#FAF8F5',
          100: '#F5F0EB',
          200: '#EDE6DD',
          300: '#DDD3C6',
          400: '#C4B7A5',
          500: '#AB9C86',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'check-pop': 'check-pop 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
