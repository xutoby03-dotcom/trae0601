/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        coffee: {
          50: '#FFF8E7',
          100: '#F5E6D3',
          200: '#E8D5B7',
          300: '#D4B896',
          400: '#A67C52',
          500: '#6F4E37',
          600: '#5D4037',
          700: '#4E342E',
          800: '#3E2723',
          900: '#2C1810',
        },
        cream: '#FFF8E7',
        amber: {
          DEFAULT: '#E65100',
        },
        matcha: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
