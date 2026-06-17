/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#E8EDF5',
          100: '#C5D0E4',
          200: '#9DB0CF',
          300: '#7590BA',
          400: '#5776AB',
          500: '#3A5C9C',
          600: '#345494',
          700: '#2C4989',
          800: '#253F7F',
          900: '#182E6E',
          950: '#0F2A4A',
        },
        accent: {
          50: '#FFF3EC',
          100: '#FFDEC9',
          200: '#FFC6A3',
          300: '#FFAE7C',
          400: '#FF9C60',
          500: '#FF8B44',
          600: '#FF7E3D',
          700: '#FF6B35',
          800: '#FF592D',
          900: '#FF391F',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        neutral: '#6B7280',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
