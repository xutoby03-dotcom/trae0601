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
        ocean: {
          50: '#E3F2FD',
          100: '#B3E5FC',
          200: '#81D4FA',
          300: '#4FC3F7',
          400: '#29B6F6',
          500: '#03A9F4',
          600: '#039BE5',
          700: '#0288D1',
          800: '#0277BD',
          900: '#01579B',
        },
        mint: {
          300: '#A5D6A7',
          400: '#81C784',
          500: '#66BB6A',
          600: '#4CAF50',
        },
        coral: {
          300: '#FFAB91',
          400: '#FF8A65',
          500: '#FF7043',
        },
        lavender: {
          300: '#E1BEE7',
          400: '#CE93D8',
          500: '#BA68C8',
        },
      },
      fontFamily: {
        display: ['Quicksand', 'Noto Sans SC', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-down': 'slide-down 0.4s ease-out',
        'fill-up': 'fill-up 0.8s ease-out',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) scaleY(0.55)' },
          '100%': { transform: 'translateX(-50%) scaleY(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
