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
        warm: {
          50: '#FAF8F5',
          100: '#F5F0EA',
          200: '#E8E0D5',
          300: '#D4C4B0',
          400: '#B8A388',
          500: '#9C8566',
          600: '#8B6914',
          700: '#6B5210',
          800: '#4A380B',
          900: '#2A1F06',
        },
        sage: {
          50: '#F4F7F1',
          100: '#E6EDDE',
          200: '#CDDBC0',
          300: '#B0C79D',
          400: '#9CAF88',
          500: '#7E9566',
          600: '#64784F',
          700: '#4E5D3E',
          800: '#3C4730',
          900: '#2A3223',
        },
        coral: {
          50: '#FDF3F1',
          100: '#FBE3DF',
          200: '#F6C7BF',
          300: '#EFAA9F',
          400: '#E8998D',
          500: '#D97A6C',
          600: '#C25E50',
          700: '#A14B3F',
          800: '#7E3A31',
          900: '#5C2B24',
        },
        sky: {
          50: '#F2F8FA',
          100: '#E2EFF3',
          200: '#C7DFE7',
          300: '#A8D0DB',
          400: '#86BCCB',
          500: '#5FA3B6',
          600: '#46879B',
          700: '#386C7D',
          800: '#2C5563',
          900: '#1F3D47',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'soft-hover': '0 8px 25px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
};
