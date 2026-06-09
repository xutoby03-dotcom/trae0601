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
        apricot: {
          50: '#FFF8F0',
          100: '#FFEED9',
          200: '#FFDDB3',
          300: '#FFC88A',
          400: '#E8A87C',
          500: '#D4895A',
          600: '#B86E3F',
          700: '#8F5430',
          800: '#6A3D24',
          900: '#4A3728',
        },
        sage: {
          50: '#F0F8F0',
          100: '#D8F0D8',
          200: '#B3E2B3',
          300: '#7BC47F',
          400: '#5AAF5E',
          500: '#3E9342',
          600: '#2D7A31',
          700: '#1F5E22',
          800: '#164418',
          900: '#0E2E10',
        },
        coral: {
          50: '#FFF0ED',
          100: '#FFDDD6',
          200: '#FFBFB2',
          300: '#E07A6A',
          400: '#D05A48',
          500: '#B84232',
          600: '#9A3020',
          700: '#7A2216',
          800: '#5C1810',
          900: '#3E0F0A',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#FAF5EC',
          200: '#F5EDE0',
          300: '#EDE2D0',
          400: '#DDD0BA',
          500: '#C9B99E',
          600: '#A8997E',
          700: '#877A63',
          800: '#665C4C',
          900: '#4A4238',
        },
      },
      fontFamily: {
        display: ['"LXGW WenKai"', '"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 2px 8px rgba(74, 55, 40, 0.08)',
        'warm-md': '0 4px 16px rgba(74, 55, 40, 0.12)',
        'warm-lg': '0 8px 32px rgba(74, 55, 40, 0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
