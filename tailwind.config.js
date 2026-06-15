/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#F0F4F9',
          100: '#DCE4F0',
          200: '#B9C8E1',
          300: '#8FA7CE',
          400: '#6A86B9',
          500: '#4A6FA5',
          600: '#3B5987',
          700: '#2D4467',
          800: '#1F2F47',
          900: '#101A27',
        },
        warm: {
          50: '#FDFBF8',
          100: '#FAF5EE',
          200: '#F5EBDC',
          300: '#EEDBC3',
          400: '#E6C7A6',
          500: '#DDB388',
        },
        sage: {
          50: '#F3F6F0',
          100: '#E4EADD',
          200: '#CCD8C0',
          300: '#AEC49C',
          400: '#9CAF88',
          500: '#7E946A',
        },
        coral: {
          50: '#FDF3F2',
          100: '#FBE1DE',
          200: '#F6C3BD',
          300: '#EEA39A',
          400: '#E8998D',
          500: '#D67A6D',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'breathing': 'breathing 3s ease-in-out infinite',
        'progress': 'progress 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        breathing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(74, 111, 165, 0.08)',
        'hover': '0 8px 30px rgba(74, 111, 165, 0.12)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4A6FA5 0%, #6A86B9 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F5F0E8 0%, #EEDBC3 100%)',
        'gradient-sage': 'linear-gradient(135deg, #9CAF88 0%, #AEC49C 100%)',
        'gradient-coral': 'linear-gradient(135deg, #E8998D 0%, #EEA39A 100%)',
      },
    },
  },
  plugins: [],
};
