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
        forest: {
          50: '#f0f7f4',
          100: '#daede2',
          200: '#b6dac6',
          300: '#86c0a3',
          400: '#53a07c',
          500: '#2f855d',
          600: '#1f6b49',
          700: '#0F5132',
          800: '#0c4229',
          900: '#0a3722',
          950: '#051e13',
        },
        terrain: {
          50: '#faf6ed',
          100: '#f2e9d4',
          200: '#e4d1a9',
          300: '#d4b376',
          400: '#c79a4e',
          500: '#8B6914',
          600: '#9c772a',
          700: '#825f24',
          800: '#6b4d24',
          900: '#594021',
          950: '#312210',
        },
        alert: {
          orange: '#E67E22',
          green: '#27AE60',
          red: '#E74C3C',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'checkmark': 'checkmark 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s infinite',
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
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
