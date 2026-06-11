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
          50: '#FFF4EB',
          100: '#FFE4CC',
          200: '#FFC999',
          300: '#FFAE66',
          400: '#FF9333',
          500: '#FF8C42',
          600: '#E67300',
          700: '#B35900',
          800: '#804000',
          900: '#4D2600',
        },
        accent: {
          50: '#E8FAF8',
          100: '#C2F2ED',
          200: '#85E5DB',
          300: '#4ED8C9',
          400: '#37CCC0',
          500: '#4ECDC4',
          600: '#2BB0A4',
          700: '#20847B',
          800: '#165852',
          900: '#0B2C29',
        },
        cream: {
          50: '#FFFDF8',
          100: '#FFF8F0',
          200: '#FFEFD9',
          300: '#FFE5C2',
          400: '#FFD9A6',
        },
        ink: {
          900: '#2D3436',
          700: '#4A5568',
          500: '#718096',
          400: '#A0AEC0',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(255, 140, 66, 0.12)',
        'card': '0 8px 32px rgba(45, 52, 54, 0.08)',
        'float': '0 12px 40px rgba(255, 140, 66, 0.25)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pop': 'pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
