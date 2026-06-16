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
        'braised-red': {
          50: '#fdf4f0',
          100: '#fbe5db',
          200: '#f6c7b5',
          300: '#ef9e7e',
          400: '#e67247',
          500: '#de4f22',
          600: '#cf3615',
          700: '#ac2712',
          800: '#8B2500',
          900: '#6b1e05',
          950: '#3d0d02',
        },
        'amber-gold': {
          50: '#fbf7e7',
          100: '#f5edc8',
          200: '#ecdc91',
          300: '#e0c456',
          400: '#D4A84B',
          500: '#c98b2a',
          600: '#b66e20',
          700: '#96521d',
          800: '#7a421f',
          900: '#66371d',
          950: '#391b0c',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
