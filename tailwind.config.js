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
        amber: {
          DEFAULT: '#E8913A',
          light: '#F5A623',
          dark: '#C67420',
          50: '#FFF8F0',
          100: '#FFEFD9',
          200: '#FFDFB3',
        },
        indigo: {
          DEFAULT: '#2D3A4A',
          light: '#3D4F63',
          50: '#F0F2F5',
          100: '#E1E5EB',
        },
      },
    },
  },
  plugins: [],
};
