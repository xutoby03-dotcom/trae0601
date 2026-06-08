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
        fridge: '#F5F0EB',
        'fridge-dark': '#E8E0D8',
        'fridge-metal': '#C4B8AC',
        sticker: {
          yellow: '#FFF9C4',
          green: '#C8E6C9',
          pink: '#F8BBD0',
          blue: '#BBDEFB',
          orange: '#FFE0B2',
          purple: '#E1BEE7',
        },
        chalkboard: '#2D4A3E',
        chalk: '#E8E4D9',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      keyframes: {
        'peel-up': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-2deg) translateY(-2px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        'magnet-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'sticky-pop': {
          '0%': { transform: 'scale(0.3) rotate(10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.05) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'peel-up': 'peel-up 0.5s ease-out forwards',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'magnet-bounce': 'magnet-bounce 0.3s ease-in-out',
        'sticky-pop': 'sticky-pop 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'check-pop': 'check-pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
