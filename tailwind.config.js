/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        forest: {
          50: '#f0f7ef',
          100: '#d9ecd5',
          200: '#b4d8ac',
          300: '#85be79',
          400: '#5ba04e',
          500: '#3f8433',
          600: '#2D5A27',
          700: '#264a21',
          800: '#203c1d',
          900: '#1b3219',
        },
        warm: {
          50: '#fef8f0',
          100: '#fdeedc',
          200: '#fad9b6',
          300: '#f6be84',
          400: '#f19a50',
          500: '#E67E22',
          600: '#d06614',
          700: '#ac4e12',
          800: '#8a3f16',
          900: '#703515',
        },
        cream: {
          50: '#fcfaf6',
          100: '#F5F0E6',
          200: '#ebe0ca',
          300: '#dcc9a5',
          400: '#caab79',
          500: '#bb925c',
          600: '#a97a4e',
          700: '#8d6242',
          800: '#73503b',
          900: '#5f4333',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(45, 90, 39, 0.08), 0 4px 6px -4px rgba(45, 90, 39, 0.04)',
        'card': '0 4px 25px -5px rgba(45, 90, 39, 0.1), 0 10px 10px -5px rgba(45, 90, 39, 0.04)',
        'lifted': '0 10px 40px -10px rgba(45, 90, 39, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
