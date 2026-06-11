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
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        wood: {
          50: '#FDF8F3',
          100: '#F5E6D3',
          200: '#E8D4B8',
          300: '#D4B896',
          400: '#A67C52',
          500: '#8B5A2B',
          600: '#6D4C2A',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        },
        gold: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        },
        cream: {
          50: '#FFFEFC',
          100: '#FAF8F5',
          200: '#F5F1E8',
          300: '#EDE7D9',
          400: '#E0D5BC',
          500: '#D4C4A0',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Lora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(93, 64, 55, 0.08)',
        'elegant-hover': '0 8px 30px rgba(93, 64, 55, 0.12)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'ripple': 'ripple 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
