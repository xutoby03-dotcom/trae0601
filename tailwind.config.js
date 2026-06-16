/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        forest: {
          50: '#F0F5F2',
          100: '#DCE7E1',
          200: '#B5CFBE',
          300: '#8EB79C',
          400: '#6B8F71',
          500: '#4A6B54',
          600: '#375843',
          700: '#2D4A3E',
          800: '#223A31',
          900: '#172822',
        },
        clay: {
          50: '#FBF5F0',
          100: '#F3E2D4',
          200: '#E6C4A8',
          300: '#D9A67C',
          400: '#CC8850',
          500: '#C17F59',
          600: '#A6673F',
          700: '#804E30',
          800: '#593621',
          900: '#331E12',
        },
        cream: {
          50: '#FBFAF6',
          100: '#F7F4EB',
          200: '#F0E8D3',
          300: '#E8DCBB',
          400: '#E0D0A3',
          500: '#D8C48B',
        },
        leaf: {
          50: '#FDF8E8',
          100: '#FAF0C6',
          200: '#F4E189',
          300: '#EED24C',
          400: '#E8B34A',
          500: '#D99A2C',
          600: '#B07A22',
          700: '#805819',
          800: '#503811',
          900: '#281C09',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(45, 74, 62, 0.08), 0 4px 16px rgba(45, 74, 62, 0.06)',
        'soft-lg': '0 4px 12px rgba(45, 74, 62, 0.1), 0 8px 32px rgba(45, 74, 62, 0.08)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
