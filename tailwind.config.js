/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose': {
          50: '#FEF7F5',
          100: '#FCEBE6',
          200: '#F7D4CA',
          300: '#F0B8A8',
          400: '#E8A598',
          500: '#D88A7A',
          600: '#C16F5F',
          700: '#A05648',
          800: '#83463B',
          900: '#6B3A31',
        },
        'forest': {
          50: '#F2F6F4',
          100: '#E0E9E4',
          200: '#BFD1C7',
          300: '#8FB0A0',
          400: '#5F8A78',
          500: '#2D4A3E',
          600: '#243B32',
          700: '#1C2E27',
          800: '#15221D',
          900: '#0E1714',
        },
        'cream': {
          50: '#FDFCFA',
          100: '#FAF6F2',
          200: '#F3ECE2',
          300: '#E9DDCC',
          400: '#DDCBAF',
          500: '#D4A574',
        },
        'gold': {
          300: '#E6C9A0',
          400: '#DDB887',
          500: '#D4A574',
          600: '#BE8E5B',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(45, 74, 62, 0.08)',
        'hover': '0 8px 30px rgba(45, 74, 62, 0.12)',
      },
    },
  },
  plugins: [],
}
