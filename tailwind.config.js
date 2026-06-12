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
        night: {
          DEFAULT: '#1B2838',
          light: '#243447',
          lighter: '#2D4052',
        },
        orange: {
          DEFAULT: '#E8773A',
          light: '#F09050',
        },
        gold: {
          DEFAULT: '#F5C542',
          light: '#F7D56B',
        },
        cream: {
          DEFAULT: '#FDF6EC',
          dark: '#F5E6D0',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Sans SC"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
