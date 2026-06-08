/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#F97316',
          green: '#22C55E',
          warm: '#78716C',
        },
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgb(239 68 68)' },
          '50%': { borderColor: 'rgb(239 68 68 / 0.3)' },
        },
      },
      animation: {
        'pulse-border': 'pulse-border 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
