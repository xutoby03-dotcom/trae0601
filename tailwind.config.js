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
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD8',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        brand: {
          orange: '#FF8A3D',
          orangeLight: '#FFB380',
          teal: '#4ECDC4',
          red: '#FF6B6B',
          cream: '#FFFAF5',
          brown: '#2D2A26',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        serif: ['Noto Serif SC', 'serif'],
      },
      boxShadow: {
        'orange': '0 10px 40px -10px rgba(255, 138, 61, 0.3)',
        'orange-soft': '0 4px 20px -4px rgba(255, 138, 61, 0.15)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideUp': 'slideUp 0.6s ease-out forwards',
        'pulseSlow': 'pulseSlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
