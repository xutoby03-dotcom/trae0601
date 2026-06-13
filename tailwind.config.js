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
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC2C2',
          300: '#FFA3A3',
          400: '#FF8585',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#D14040',
          800: '#BA2B2B',
          900: '#A31616',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5EDD8',
          200: '#ECDDB3',
          300: '#E2C885',
          400: '#D5B25E',
          500: '#C9A962',
          600: '#B08E47',
          700: '#927238',
          800: '#75572A',
          900: '#5C4020',
        },
        cream: '#FFF9F0',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Times New Roman"', 'serif'],
        display: ['"Noto Serif SC"', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0, 0, 0, 0.06)',
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(255, 107, 107, 0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
