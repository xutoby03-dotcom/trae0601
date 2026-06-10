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
          50: '#FFF2ED',
          100: '#FFE0D3',
          200: '#FFC2A8',
          300: '#FFA37C',
          400: '#FF8551',
          500: '#FF6B35',
          600: '#E5501A',
          700: '#B23E14',
          800: '#7F2C0E',
          900: '#4C1A08',
        },
        secondary: {
          50: '#E8F5F3',
          100: '#C5E6E1',
          200: '#8DCDC4',
          300: '#54B4A7',
          400: '#2DA696',
          500: '#1B998B',
          600: '#157A6E',
          700: '#0F5B52',
          800: '#0A3D37',
          900: '#051F1C',
        },
        cream: {
          50: '#FFFCF8',
          100: '#FFF8F0',
          200: '#FFEFD9',
          300: '#FFE6C2',
          400: '#FFDDAC',
          500: '#FFD495',
        },
      },
      fontFamily: {
        display: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
