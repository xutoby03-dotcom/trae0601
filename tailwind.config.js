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
      }
    },
    extend: {
      colors: {
        brand: {
          50: '#FFF5F0',
          100: '#FFE8D9',
          200: '#FFC9A8',
          300: '#FFA673',
          400: '#FF8A4C',
          500: '#FF6B35',
          600: '#E8552A',
          700: '#C24422',
          800: '#9B361C',
          900: '#7A2B17',
        },
        teal: {
          50: '#E6F4F7',
          100: '#B8DDE5',
          200: '#8AC6D3',
          300: '#5CAFC1',
          400: '#2E98AF',
          500: '#004E64',
          600: '#003E50',
          700: '#002F3C',
          800: '#001F28',
          900: '#001014',
        },
        warm: {
          50: '#FAF9F6',
          100: '#F5F3EE',
          200: '#E8E5DC',
          300: '#D4CFC3',
          400: '#B5AE9E',
          500: '#968E7D',
          600: '#787163',
          700: '#5D574C',
          800: '#433E36',
          900: '#2A2721',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
