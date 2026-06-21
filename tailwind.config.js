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
        parchment: {
          50: '#FDFAF3',
          100: '#FAF6ED',
          200: '#F5EFE0',
          300: '#EDE5D0',
          400: '#E2D6B8',
        },
        ink: {
          700: '#5D4E37',
          800: '#4A3E2B',
          900: '#382F1F',
        },
        ochre: {
          400: '#D49678',
          500: '#C08060',
          600: '#A66A4D',
        },
        teal: {
          500: '#3D5A6C',
          600: '#2E4654',
        },
      },
      fontFamily: {
        song: ['"Noto Serif SC"', '"Source Han Serif SC"', '"SimSun"', 'serif'],
        hei: ['"Noto Sans SC"', '"Source Han Sans SC"', '"PingFang SC"', 'sans-serif'],
      },
      boxShadow: {
        'scroll': '0 4px 20px -4px rgba(93, 78, 55, 0.15), 0 2px 8px -2px rgba(93, 78, 55, 0.1)',
        'card': '0 2px 12px -2px rgba(93, 78, 55, 0.12), 0 1px 4px -1px rgba(93, 78, 55, 0.08)',
        'stamp': '0 0 0 2px #C08060, 0 0 0 4px #FAF6ED',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.5) rotate(-15deg)' },
          '50%': { opacity: '1', transform: 'scale(0.95) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'stamp-in': 'stamp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
    },
  },
  plugins: [],
};
