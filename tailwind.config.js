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
          100: '#FFE6D9',
          200: '#FFC9AD',
          300: '#FFA87A',
          400: '#FF8A4F',
          500: '#FF6B35',
          600: '#E55522',
          700: '#C24318',
          800: '#963412',
          900: '#6E260D',
        },
        secondary: {
          50: '#E8F8F6',
          100: '#C6F0EC',
          200: '#8EE1D9',
          300: '#56D0C5',
          400: '#2EC4B6',
          500: '#22A89B',
          600: '#1A857A',
          700: '#14675F',
          800: '#0E4A44',
          900: '#092F2B',
        },
        cream: {
          50: '#FFFCF5',
          100: '#FAF3E0',
          200: '#F3E7C8',
          300: '#E9D7A5',
          400: '#DCC57E',
          500: '#CCAF57',
        },
        warm: {
          50: '#FDFBFA',
          100: '#FAF5F2',
          200: '#F3EAE4',
          300: '#E8D9CE',
          400: '#D4BCA8',
          500: '#B89B83',
          600: '#9A7A60',
          700: '#7D604A',
          800: '#5E4736',
          900: '#3D2E22',
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Ma Shan Zheng"', 'cursive', 'sans-serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(45, 42, 50, 0.08)',
        'soft-lg': '0 8px 32px rgba(45, 42, 50, 0.12)',
        'warm': '0 4px 20px rgba(255, 107, 53, 0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
