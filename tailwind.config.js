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
        parchment: {
          50: '#FBF5EA',
          100: '#F5E6D3',
          200: '#E8D4B8',
          300: '#D4B896',
          400: '#C4A574',
        },
        ink: {
          700: '#5D4037',
          800: '#3D2B1F',
          900: '#2C1810',
        },
        seal: {
          red: '#8B0000',
          green: '#2F4F2F',
          amber: '#D4A017',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'stamp': '2px 2px 0 rgba(61, 43, 31, 0.4), inset 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'card': '0 4px 20px rgba(61, 43, 31, 0.15)',
        'card-hover': '0 8px 30px rgba(61, 43, 31, 0.25)',
      },
      keyframes: {
        'stamp-bounce': {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'stamp-bounce': 'stamp-bounce 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
      }
    },
  },
  plugins: [],
};
