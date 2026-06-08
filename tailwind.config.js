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
        coffee: {
          50: '#FFFDF8',
          100: '#F5E6D3',
          200: '#E8D5BC',
          300: '#D4A574',
          400: '#B8864E',
          500: '#8B6914',
          600: '#6F4E37',
          700: '#5C3A1E',
          800: '#3E2412',
          900: '#2A1A0E',
        },
        cream: '#FFFDF8',
        latte: '#F5E6D3',
        mocha: '#D4A574',
        espresso: '#6F4E37',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
