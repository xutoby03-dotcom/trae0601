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
        forest: {
          50: '#f0f7ee',
          100: '#d9e8d4',
          200: '#b3d1a9',
          300: '#86b979',
          400: '#5e9e50',
          500: '#428336',
          600: '#2D5A27',
          700: '#24471f',
          800: '#1e391a',
          900: '#192f16',
        },
        warmorange: {
          50: '#fdf6ed',
          100: '#fae9cf',
          200: '#f5d09e',
          300: '#efb062',
          400: '#E67E22',
          500: '#d96816',
          600: '#bd5011',
          700: '#9c3d12',
          800: '#7e3115',
          900: '#672a14',
        },
        cream: {
          50: '#fbf9f4',
          100: '#F5F0E6',
          200: '#ebe0cc',
          300: '#dcc9a8',
          400: '#c9ab7d',
          500: '#b9915f',
        },
        bark: {
          50: '#f6f2ef',
          100: '#e8ddd5',
          200: '#d2bbab',
          300: '#b6947b',
          400: '#9e745a',
          500: '#3E2723',
          600: '#7a5543',
          700: '#634437',
          800: '#52382f',
          900: '#452f28',
        },
      },
      fontFamily: {
        display: ['"Caveat"', '"Noto Serif SC"', 'cursive'],
        body: ['"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '14px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        'softer': '0 2px 10px -2px rgba(0, 0, 0, 0.06)',
        'card': '0 8px 30px -10px rgba(45, 90, 39, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
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
