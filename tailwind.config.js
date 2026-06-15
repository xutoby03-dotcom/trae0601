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
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD8',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        warm: {
          50: '#FFFBF5',
          100: '#FEF3E2',
          200: '#FDE6C8',
          300: '#FAD4A3',
          400: '#F5BE7A',
          500: '#EFA451',
          600: '#E08B33',
          700: '#BA6D23',
          800: '#94551F',
          900: '#77461E',
        },
        coffee: {
          50: '#F8F4F0',
          100: '#EDE6DE',
          200: '#DCCBBE',
          300: '#C7AB96',
          400: '#AE866C',
          500: '#966A4F',
          600: '#895742',
          700: '#724638',
          800: '#5E3A30',
          900: '#4E3128',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
