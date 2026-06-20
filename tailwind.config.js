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
        'studio': {
          bg: '#1A1A1E',
          card: '#25252B',
          border: '#3A3A42',
          copper: '#D97706',
          copperDark: '#B45309',
          military: '#4D7C5E',
          rust: '#B91C1C',
          cobalt: '#1D4ED8',
          text: '#E5E5E5',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'glow-copper': '0 0 20px rgba(217, 119, 6, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'stagger-1': 'fadeInUp 0.6s ease-out 0.1s forwards',
        'stagger-2': 'fadeInUp 0.6s ease-out 0.2s forwards',
        'stagger-3': 'fadeInUp 0.6s ease-out 0.3s forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
