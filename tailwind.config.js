/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFE8DD',
          200: '#FFD0BC',
          300: '#FFB08C',
          400: '#FF8A5C',
          500: '#FF6B35',
          600: '#F05020',
          700: '#D94010',
          800: '#B8350A',
          900: '#8A2805',
        },
        warm: {
          50: '#FFFCF7',
          100: '#FFF9F2',
          200: '#FFF0E0',
          300: '#FFE4CC',
          400: '#FFD4A8',
          500: '#FFC857',
        },
        mint: {
          400: '#6EE7DE',
          500: '#4ECDC4',
          600: '#38B2A9',
        },
        brown: {
          50: '#FAF7F5',
          100: '#F5F0ED',
          700: '#5D4A44',
          800: '#3D2C29',
          900: '#2A1F1C',
        },
      },
      fontFamily: {
        display: ['"Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px rgba(255, 107, 53, 0.15)',
        'card': '0 2px 12px rgba(61, 44, 41, 0.08)',
        'card-hover': '0 8px 30px rgba(61, 44, 41, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
