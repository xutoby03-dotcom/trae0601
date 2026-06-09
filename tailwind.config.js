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
        terra: {
          50: '#FDF5F0',
          100: '#FAEADB',
          200: '#F3D0B5',
          300: '#E8B088',
          400: '#D9935F',
          500: '#C67B5C',
          600: '#B5654A',
          700: '#9A513D',
          800: '#7F4234',
          900: '#6A382D',
        },
        sage: {
          50: '#F4F6F3',
          100: '#E5EAE3',
          200: '#CDD7CA',
          300: '#AABDA6',
          400: '#8B9E7E',
          500: '#6E8264',
          600: '#586B4F',
          700: '#475640',
          800: '#3B4736',
          900: '#323C2E',
        },
        cream: {
          50: '#FDFCFB',
          100: '#FAF5EF',
          200: '#F5EDE2',
          300: '#EDE1D1',
          400: '#DFD0BA',
          500: '#C9B89E',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(198, 123, 92, 0.08)',
        'card-hover': '0 8px 24px rgba(198, 123, 92, 0.15)',
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
