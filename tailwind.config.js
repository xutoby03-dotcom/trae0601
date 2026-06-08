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
        brand: {
          50: '#FFF5EB',
          100: '#FFE6CC',
          200: '#FFCC99',
          300: '#FFB366',
          400: '#FF9933',
          500: '#E8763A',
          600: '#CC5F25',
          700: '#A34A1C',
          800: '#7A3715',
          900: '#52250E',
        },
        carbon: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B0B0B0',
          300: '#808080',
          400: '#505050',
          500: '#3A3A3C',
          600: '#2C2C2E',
          700: '#1C1C1E',
          800: '#141416',
          900: '#0C0C0E',
        },
        gold: '#F5C542',
        mint: '#5BA67C',
      },
      fontFamily: {
        display: ['"ZCOOL QingKe HuangYou"', 'cursive'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
