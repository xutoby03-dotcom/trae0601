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
        warm: {
          50: '#FAF6F1',
          100: '#F0E8DC',
          200: '#E0D0B8',
          300: '#C9AE8A',
          400: '#B08E62',
          500: '#8B6F47',
          600: '#6E5738',
          700: '#54412A',
          800: '#3A2D1D',
          900: '#231A11',
        },
        sage: {
          50: '#F0F5EF',
          100: '#D9E8D7',
          200: '#B3D1AF',
          300: '#8DBA87',
          400: '#6FA368',
          500: '#5B8C5A',
          600: '#497048',
          700: '#385537',
          800: '#273B27',
          900: '#172217',
        },
        coral: {
          50: '#FEF0ED',
          100: '#FCDDD6',
          200: '#F8B8AB',
          300: '#F49280',
          400: '#E07A5F',
          500: '#C96247',
          600: '#A34D36',
          700: '#7D3A28',
          800: '#57281B',
          900: '#32150E',
        },
      },
    },
  },
  plugins: [],
};
