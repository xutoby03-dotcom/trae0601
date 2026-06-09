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
        basketball: {
          orange: '#FF6B2B',
          green: '#2D8B4E',
          dark: '#0D0D0D',
          court: '#1a1a2e',
        },
      },
      animation: {
        'bounce-once': 'bounce 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
