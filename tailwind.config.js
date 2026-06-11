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
        lab: {
          900: '#0D3B2E',
          800: '#14503E',
          700: '#1A6B4F',
          600: '#1F8560',
          500: '#259971',
          400: '#3DB88C',
          300: '#66CCa4',
          200: '#99E0C2',
          100: '#CCEFDF',
          50: '#E8F7EF',
        },
        amber: {
          500: '#E5A44D',
          600: '#D4932E',
        },
        danger: {
          500: '#DC3545',
          600: '#C82333',
        },
        warn: {
          500: '#F59E0B',
          600: '#D97706',
        },
        safe: {
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-border': 'pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgb(220 53 69 / 0.4)' },
          '50%': { borderColor: 'rgb(220 53 69 / 1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
