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
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0B3D91',
          800: '#072a6e',
          900: '#051d4d',
          950: '#031233',
        },
        coral: {
          400: '#FF8A8A',
          500: '#FF6B6B',
          600: '#E85555',
        },
        seafoam: {
          400: '#6EDCD4',
          500: '#4ECDC4',
          600: '#3DB9B1',
        },
        sand: {
          400: '#FFED8A',
          500: '#FFE66D',
          600: '#F5D84A',
        },
      },
      fontFamily: {
        display: ['"Poppins"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        body: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'float': '0 12px 40px rgba(11, 61, 145, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0) translateZ(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) translateZ(0) scaleY(0.8)' },
        },
      },
    },
  },
  plugins: [],
};
