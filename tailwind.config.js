/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'storm': {
          50: '#f0f4ff',
          100: '#dce5ff',
          200: '#b9cbff',
          300: '#8aa7ff',
          400: '#597bff',
          500: '#3555ff',
          600: '#1e30f5',
          700: '#1822dc',
          800: '#181fb2',
          900: '#1a208c',
          950: '#0a0c2e',
        },
        'lightning': {
          yellow: '#fde047',
          orange: '#fb923c',
          purple: '#a78bfa',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash': 'flash 0.5s ease-out',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
