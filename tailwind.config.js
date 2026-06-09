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
        cream: '#FFF8F0',
        warm: {
          50: '#FBF7F2',
          100: '#F5EDE2',
          200: '#EBD9C4',
          300: '#D9BD9E',
          400: '#C49B73',
          500: '#8B6F47',
          600: '#7A623F',
          700: '#665236',
          800: '#54432E',
          900: '#453728',
        },
        leaf: {
          50: '#F0F8F0',
          100: '#D6EDD8',
          200: '#AFD9B3',
          300: '#7BAE7F',
          400: '#5C9460',
          500: '#4A7E4E',
        },
        coral: {
          50: '#FFF3ED',
          100: '#FFE2D1',
          200: '#FFC4A5',
          300: '#E8845C',
          400: '#D66D3F',
          500: '#B8572E',
        },
        sky: {
          50: '#EFF8FC',
          100: '#D2EDF7',
          200: '#A5DBEF',
          300: '#6DC4E3',
          400: '#4BAFD4',
          500: '#3894B2',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'paw-print': 'pawPrint 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pawPrint: {
          '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '50%': { transform: 'scale(1.3) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
