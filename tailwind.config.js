/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#E8EEF5',
          100: '#C6D4E5',
          200: '#9CB5D2',
          300: '#7295BF',
          400: '#537CB1',
          500: '#3363A3',
          600: '#2A5488',
          700: '#1F3F66',
          800: '#0F3460',
          900: '#0A2545',
        },
        accent: {
          coral: '#FF6B6B',
          mint: '#4ECDC4',
          gold: '#FFE66D',
        },
        neutral: {
          50: '#F7F7F7',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#666666',
          600: '#4A4A4A',
          700: '#3D3D3D',
          800: '#2C3E50',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(15, 52, 96, 0.08)',
        'card-hover': '0 8px 30px rgba(15, 52, 96, 0.12)',
        'btn': '0 2px 8px rgba(15, 52, 96, 0.15)',
        'btn-hover': '0 4px 12px rgba(15, 52, 96, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
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
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
