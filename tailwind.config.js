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
        flame: '#E8652E',
        smoke: '#2D2A26',
        roast: '#8B5E3C',
        veggie: '#5A8F5C',
        ice: '#4AA8D8',
        cream: '#FAF5F0',
        danger: '#D94F4F',
      },
      fontFamily: {
        display: ['ZCOOL KuaiLe', 'Noto Sans SC', 'sans-serif'],
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
