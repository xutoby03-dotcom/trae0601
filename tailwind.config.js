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
        bake: {
          brown: '#8B5E3C',
          caramel: '#D4A574',
          cream: '#FFF8F0',
          warm: '#F5E6D3',
          dark: '#5C3D2E',
          light: '#FAF0E6',
          red: '#E74C3C',
          green: '#27AE60',
          amber: '#F39C12',
          card: '#FFFAF5',
          border: '#E8D5C4',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        'bake': '12px',
      },
    },
  },
  plugins: [],
};
