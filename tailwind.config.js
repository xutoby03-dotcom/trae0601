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
        display: ['Outfit', 'DM Sans', 'sans-serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1B3A5C',
          light: '#2D5F8B',
          50: '#E8F0F8',
        },
        accent: {
          DEFAULT: '#F5A623',
          light: '#F8C76A',
        },
      },
    },
  },
  plugins: [],
};
