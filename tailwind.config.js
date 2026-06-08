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
        coral: {
          50: '#FFF5F2',
          100: '#FDE8E2',
          200: '#FBD0C4',
          300: '#F09D8E',
          400: '#E88A78',
          500: '#E8725A',
          600: '#C95A43',
          700: '#A84A36',
          800: '#873B2B',
          900: '#662C20',
        },
        cream: '#FDF6EC',
      },
    },
  },
  plugins: [],
};
