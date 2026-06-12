/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
      }
    },
    extend: {
      colors: {
        rose: {
          gold: '#D4A574',
          goldLight: '#E8C9A0',
          goldDark: '#B8956A',
        },
        ivory: {
          DEFAULT: '#FFF8F0',
          dark: '#F5EDE0',
        },
        wine: {
          DEFAULT: '#8B2635',
          light: '#A03B4A',
          dark: '#6B1D29',
        },
        warm: {
          50: '#FDFBF7',
          100: '#F9F4EB',
          200: '#F3E9D9',
          300: '#E8D7BE',
          400: '#D4BE9A',
          500: '#C4A87E',
          600: '#B09066',
          700: '#947552',
          800: '#785D42',
          900: '#624B37',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(139, 38, 53, 0.06), 0 4px 16px rgba(139, 38, 53, 0.04)',
        'card-hover': '0 8px 24px rgba(139, 38, 53, 0.1), 0 16px 40px rgba(139, 38, 53, 0.06)',
        'glow': '0 0 20px rgba(212, 165, 116, 0.3)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 38, 53, 0.2)' },
          '50%': { boxShadow: '0 0 0 8px rgba(139, 38, 53, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
