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
        stone: {
          50: '#FAF9F7',
          100: '#F5F2ED',
          200: '#E8E3DB',
          300: '#D4CCC1',
          400: '#B8AE9F',
          500: '#9A8E7E',
          600: '#7D7265',
          700: '#645A50',
          800: '#504840',
          900: '#423C36',
        },
        amber: {
          50: '#FFF8ED',
          100: '#FFEFD6',
          200: '#FFDEAD',
          300: '#FFC778',
          400: '#FFA945',
          500: '#FF8A1E',
          600: '#F06B00',
          700: '#C75500',
          800: '#9D4305',
          900: '#7F3808',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE0E4',
          200: '#FFC7CE',
          300: '#FDA1AD',
          400: '#FA6B7F',
          500: '#EF445E',
          600: '#DC2644',
          700: '#B91C38',
          800: '#9B1D34',
          900: '#821E31',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
