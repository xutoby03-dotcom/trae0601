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
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF3EE',
          100: '#FFE4D6',
          200: '#FFC7AD',
          300: '#FFAA85',
          400: '#FF8D5C',
          500: '#FF7A45',
          600: '#E66120',
          700: '#B34B19',
          800: '#803512',
          900: '#4D200B',
        },
        success: {
          50: '#F0F9F4',
          100: '#D9F0E1',
          200: '#B3E1C4',
          300: '#96CEB4',
          400: '#7ABFA3',
          500: '#5DB091',
          600: '#4A8E75',
          700: '#376B58',
          800: '#25493A',
          900: '#12261D',
        },
        warning: {
          50: '#FFF0F0',
          100: '#FFD9D9',
          200: '#FFB3B3',
          300: '#FF8C8C',
          400: '#FF7A7A',
          500: '#FF6B6B',
          600: '#E65252',
          700: '#B33E3E',
          800: '#802B2B',
          900: '#4D1A1A',
        },
        cream: '#FFF8F0',
        brown: {
          50: '#F7F5F3',
          100: '#EBE7E1',
          200: '#D8D0C5',
          300: '#C4B8A5',
          400: '#B0A089',
          500: '#9C886D',
          600: '#7D6C54',
          700: '#5E503F',
          800: '#3F362A',
          900: '#4A4A4A',
        },
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '9999px',
      },
      boxShadow: {
        'card': '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px -8px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
