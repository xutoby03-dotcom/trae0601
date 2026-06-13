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
          50: '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFD1BC',
          300: '#FFB394',
          400: '#FF916A',
          500: '#FF7A45',
          600: '#F5632E',
          700: '#DB4A1A',
          800: '#B83B10',
          900: '#92310F',
        },
        warm: {
          50: '#FFFBF7',
          100: '#FFF5ED',
          200: '#FFE8D6',
          50: '#FFFBF7',
          100: '#FFF5ED',
        },
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(255, 122, 69, 0.08)',
        'warm-md': '0 4px 16px rgba(255, 122, 69, 0.12)',
        'warm-lg': '0 8px 24px rgba(255, 122, 69, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
