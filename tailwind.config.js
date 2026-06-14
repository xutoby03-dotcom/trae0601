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
        tea: {
          50: '#F5EFE0',
          100: '#E8DDC4',
          200: '#D4C59E',
          300: '#BCA476',
          400: '#C9A961',
          500: '#9E8B4F',
          600: '#7A6B3C',
          700: '#5A4F2B',
          800: '#3D351D',
          900: '#2D5A27',
        },
        teaGreen: {
          50: '#ECF5EA',
          100: '#D6EBD2',
          200: '#AED7A6',
          300: '#86C27B',
          400: '#5EAD4F',
          500: '#2D5A27',
          600: '#23481F',
          700: '#1A3617',
          800: '#12240F',
          900: '#091208',
        },
        amberGold: {
          400: '#D4B872',
          500: '#C9A961',
          600: '#A1874E',
        },
        warnOrange: '#E67E22',
        dangerRed: '#C0392B',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
