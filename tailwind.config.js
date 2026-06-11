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
        cream: {
          50: '#FFFCF8',
          100: '#FAF6F0',
          200: '#F3EBE0',
          300: '#E8DCC9',
        },
        teal: {
          DEFAULT: '#2E5E5E',
          50: '#E6EFEF',
          100: '#C2D6D6',
          200: '#8EB3B3',
          300: '#5A8C8C',
          600: '#264C4C',
          700: '#1D3A3A',
        },
        coral: {
          DEFAULT: '#E07A5F',
          50: '#FBEAE5',
          100: '#F5CDC2',
          200: '#EDA590',
          300: '#E67E5F',
          600: '#B85C44',
        },
        sage: {
          DEFAULT: '#81B29A',
          50: '#E8F1EC',
          100: '#CDE0D7',
          200: '#A5CCBE',
          300: '#81B29A',
          600: '#5A8F76',
        },
        amber2: {
          DEFAULT: '#F2CC8F',
          50: '#FDF4E4',
          100: '#FAE6C2',
          200: '#F6D69B',
          300: '#F2CC8F',
          600: '#D4A84F',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(46, 94, 94, 0.06), 0 1px 3px rgba(46, 94, 94, 0.04)',
        'card': '0 4px 16px rgba(46, 94, 94, 0.08), 0 2px 6px rgba(46, 94, 94, 0.04)',
        'card-hover': '0 8px 24px rgba(46, 94, 94, 0.12), 0 4px 12px rgba(46, 94, 94, 0.06)',
      },
      borderRadius: {
        'card': '12px',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in-scale': 'fadeInScale 0.25s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'count-up': 'countUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
