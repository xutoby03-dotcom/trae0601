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
        brass: {
          50: '#F5F0E8',
          100: '#E8DCC8',
          200: '#D4A847',
          300: '#C49A3A',
          400: '#8B6914',
          500: '#6B5210',
          600: '#4A390B',
        },
        workshop: {
          bg: '#0D0B08',
          card: '#1A1612',
          border: 'rgba(212,168,71,0.12)',
        },
        anomaly: {
          offbeat: '#E8943A',
          stopped: '#C44536',
          weak: '#4A90D9',
          jam: '#9B59B6',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Noto Sans SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
