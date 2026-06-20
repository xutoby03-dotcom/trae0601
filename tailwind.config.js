/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        space: {
          950: '#050a14',
          900: '#0a1628',
          800: '#0f1e3d',
          700: '#162a52',
          600: '#1e3a6b',
        },
        nebula: {
          purple: '#4f46e5',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        moonlight: {
          DEFAULT: '#fbbf24',
          light: '#fde68a',
          dark: '#d97706',
        },
        aurora: {
          green: '#10b981',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(79, 70, 229, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
