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
          orange: '#FF6B35',
          'orange-light': '#FF8F5E',
          'orange-dark': '#CC5529',
          cream: '#FFF8F0',
          mint: '#4ECDC4',
          pink: '#FF8FAB',
          sky: '#45B7D1',
          yellow: '#F7DC6F',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 2.5s ease-in-out infinite',
        'shake': 'shake 0.6s ease-in-out',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-12deg)' },
          '30%': { transform: 'rotate(12deg)' },
          '45%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(10deg)' },
          '75%': { transform: 'rotate(-5deg)' },
          '90%': { transform: 'rotate(5deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
