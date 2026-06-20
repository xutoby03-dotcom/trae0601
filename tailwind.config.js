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
        wine: {
          50: '#FBF5F5',
          100: '#F5E6E7',
          200: '#E8C5C8',
          300: '#D4949A',
          400: '#BC5E68',
          500: '#A03D49',
          600: '#722F37',
          700: '#5C252C',
          800: '#4B1E24',
          900: '#3D181C',
        },
        gold: {
          50: '#FDFAF3',
          100: '#FAF2DF',
          200: '#F3E3B8',
          300: '#EBD088',
          400: '#DDB959',
          500: '#C9A962',
          600: '#B08D3D',
          700: '#926F2E',
          800: '#785A27',
          900: '#654B22',
        },
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#EDE4D4',
          400: '#E0D1B8',
          500: '#D0BA95',
        },
        status: {
          normal: '#4CAF50',
          warning: '#FF9800',
          danger: '#E53935',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'breathing': 'breathing 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(229, 57, 53, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(229, 57, 53, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(114, 47, 55, 0.12), 0 2px 8px -2px rgba(114, 47, 55, 0.08)',
        'gold-glow': '0 0 0 1px rgba(201, 169, 98, 0.3), 0 4px 16px -4px rgba(201, 169, 98, 0.25)',
        'card-hover': '0 12px 40px -8px rgba(114, 47, 55, 0.18), 0 4px 16px -4px rgba(114, 47, 55, 0.1)',
      }
    },
  },
  plugins: [],
};
