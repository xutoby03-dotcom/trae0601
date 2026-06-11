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
        night: {
          950: '#0A0A0A',
          900: '#121212',
          800: '#1A1A1A',
          700: '#242424',
          600: '#2E2E2E',
          500: '#3A3A3A',
        },
        energy: {
          500: '#FF6B35',
          400: '#FF8A5C',
          300: '#FFA982',
          600: '#E55A2B',
        },
        fresh: {
          500: '#2EC4B6',
          400: '#5DD1C5',
          600: '#24A094',
        },
        caution: {
          500: '#FFD93D',
        },
        danger: {
          500: '#FF4757',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.7)' },
        },
      },
    },
  },
  plugins: [],
};
