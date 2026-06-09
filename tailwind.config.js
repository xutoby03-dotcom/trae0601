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
        apricot: '#E8A87C',
        brown: '#3D2B1F',
        cream: '#FFF8F0',
        sage: '#A8D5BA',
        blush: '#F5C6AA',
        'warm-gray': '#8B7E74',
      },
    },
  },
  plugins: [],
};
