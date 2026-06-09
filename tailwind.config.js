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
        dark: { 900: '#0a0a0f', 800: '#12121a', 700: '#181822' },
        accent: { DEFAULT: '#f59e0b', glow: '#f59e0b44' },
        info: { DEFAULT: '#06b6d4', glow: '#06b6d444' },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
