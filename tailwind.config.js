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
        brand: {
          50: '#EFF6FC',
          100: '#DAECF8',
          200: '#B8D8F1',
          300: '#89BCE6',
          400: '#5399D7',
          500: '#2E79BE',
          600: '#0F4C81',
          700: '#0C3E69',
          800: '#0A3356',
          900: '#082A47',
          950: '#041728',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans SC',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15,76,129,0.08), 0 1px 2px rgba(15,76,129,0.06)',
        'card-hover': '0 4px 12px rgba(15,76,129,0.12), 0 2px 4px rgba(15,76,129,0.08)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
