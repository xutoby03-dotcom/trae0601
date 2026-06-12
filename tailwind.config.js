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
        cream: '#FDF6EC',
        terra: '#C4704B',
        'terra-dark': '#A85A38',
        sand: '#D4A574',
        mist: '#8BA5B5',
        charcoal: '#2D2D2D',
        warm: {
          50: '#FEFDFB',
          100: '#FDF6EC',
          200: '#F5E6D0',
          300: '#E8DDD0',
          400: '#D4A574',
          500: '#C4704B',
          600: '#A85A38',
          700: '#8B4226',
          800: '#6E331D',
          900: '#4A2213',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
