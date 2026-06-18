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
        'deep-sea': '#0A2647',
        'ocean': '#144272',
        'shallow': '#205295',
        'surface': '#2C74B3',
        'coral': '#FF6B35',
        'coral-light': '#FF8C5A',
        'seaweed': '#2D8F4E',
        'seaweed-light': '#3DAF64',
        'sand': '#D4A853',
        'sand-light': '#E8C97A',
        'foam': '#E8F4FD',
        'foam-dark': '#C5DFF0',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'serif'],
        'sans': ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
