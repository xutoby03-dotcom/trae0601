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
        neon: '#00FF88',
        amber: '#FF8C42',
        dark: {
          900: '#0B1120',
          800: '#0d1525',
          700: '#131d33',
          600: '#1a2744',
          500: '#1e293b',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'safety-breathe': 'safety-breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
