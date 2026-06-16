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
          100: '#FFE6D9',
          200: '#FFCCB3',
          300: '#FFB38C',
          400: '#FF9966',
          500: '#FF8040',
          600: '#FF6B35',
          700: '#E65A2B',
          800: '#CC4E24',
          900: '#B3421E',
        },
        secondary: {
          50: '#E8EEF1',
          100: '#C5D3DA',
          200: '#9FB8C4',
          300: '#799CAE',
          400: '#5E869B',
          500: '#427088',
          600: '#1B3A4B',
          700: '#173241',
          800: '#122A37',
          900: '#0A1B24',
        },
        success: '#2ECC71',
        warning: '#F39C12',
        danger: '#E74C3C',
        info: '#3498DB',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
