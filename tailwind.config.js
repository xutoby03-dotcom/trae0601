/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'serif'],
      },
      colors: {
        gold: '#D4A574',
        'dark-brown': '#2C1810',
        cream: '#FFF8F0',
        'warm-brown': '#4A3228',
        'light-gold': '#E8C99B',
        paper: '#F5E6D3',
        'seal-red': '#8B2500',
      },
    },
  },
  plugins: [],
};
