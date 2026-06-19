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
        burgundy: {
          50: '#fdf4f4',
          100: '#fbe4e4',
          200: '#f7cccc',
          300: '#eea5a5',
          400: '#e37373',
          500: '#d44d4d',
          600: '#b82f2f',
          700: '#8B1A1A',
          800: '#6b1515',
          900: '#5a1414',
          950: '#320808',
        },
        champagne: {
          50: '#fbf8f1',
          100: '#f5eedd',
          200: '#ead9b8',
          300: '#dfc08c',
          400: '#D4AF37',
          500: '#c99e2b',
          600: '#b17f22',
          700: '#94611f',
          800: '#7a4f20',
          900: '#67421f',
          950: '#38210e',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#1A1A1A',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f1',
          200: '#FAF8F5',
          300: '#f5efe6',
          400: '#ede3d4',
          500: '#e2d3bc',
          600: '#d0b99a',
          700: '#b99a78',
          800: '#977c62',
          900: '#7b6653',
          950: '#42362a',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'calling': 'calling 1s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        calling: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(139, 26, 26, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 20px rgba(139, 26, 26, 0)' },
        },
      },
    },
  },
  plugins: [],
};
