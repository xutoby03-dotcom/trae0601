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
          100: '#FFE8E8',
          200: '#FFD1D1',
          300: '#FFB3B3',
          400: '#FF8C8C',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#CC4444',
          800: '#A83636',
          900: '#822A2A',
        },
        secondary: {
          50: '#F0FFFC',
          100: '#D1F9F2',
          200: '#A7F0E5',
          300: '#76E3D4',
          400: '#4ECDC4',
          500: '#34B8AE',
          600: '#2A9990',
          700: '#227A73',
          800: '#1A5C57',
          900: '#13403D',
        },
        warm: {
          50: '#FDFBF7',
          100: '#F7F3EB',
          200: '#EFE7D8',
          300: '#E2D4BC',
          400: '#D0BB9B',
          500: '#BEA17D',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
