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
        cream: '#FFF8F0',
        warm: {
          50: '#FFF5ED',
          100: '#FFE8D6',
          200: '#FFD4B0',
          300: '#FFBB85',
          400: '#FF9D5C',
          500: '#FF6B35',
          600: '#E85520',
          700: '#C44015',
          800: '#9C3313',
          900: '#7D2C14',
        },
        mint: {
          50: '#E8FAF8',
          100: '#C5F2ED',
          200: '#96E5DD',
          300: '#5DD4C9',
          400: '#2EC4B6',
          500: '#1AAB9D',
          600: '#148A80',
          700: '#116E67',
          800: '#12574F',
          900: '#104842',
        },
        rose: {
          50: '#FFF0F3',
          100: '#FFE0E8',
          200: '#FFC6D6',
          300: '#FFA0BA',
          400: '#FF85A1',
          500: '#FF5C83',
          600: '#E83D67',
          700: '#C42D54',
          800: '#A12849',
          900: '#872643',
        },
        bark: {
          50: '#F6F5F4',
          100: '#E7E5E3',
          200: '#D1CDC8',
          300: '#B0AAA2',
          400: '#8A8378',
          500: '#6B6359',
          600: '#554E46',
          700: '#453F39',
          800: '#3A3530',
          900: '#2D2A26',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
