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
        bread: {
          50: '#FFF8E7',
          100: '#F5E6C8',
          200: '#E8D4A8',
          300: '#DAA520',
          400: '#C4911B',
          500: '#8B5A2B',
          600: '#6B4423',
          700: '#4A2F18',
          800: '#3D2615',
          900: '#2D1C0F',
        },
        cream: '#FFF8E7',
        wheat: '#DAA520',
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grain-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
