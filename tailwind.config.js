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
          50: '#FFF5EB',
          100: '#FFE6CC',
          200: '#FFCD99',
          300: '#FFB366',
          400: '#FF9A33',
          500: '#E67E22',
          600: '#CC6D1A',
          700: '#B35C12',
          800: '#8A470D',
          900: '#66330A',
        },
        status: {
          fresh: '#27AE60',
          soon: '#F39C12',
          expired: '#E74C3C',
          restock: '#8E44AD',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
