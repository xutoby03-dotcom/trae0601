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
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        navy: {
          50: '#f2f5fa',
          100: '#d9e2ec',
          200: '#a9bfd6',
          300: '#789cbd',
          400: '#4879a7',
          500: '#2d5c8e',
          600: '#1e3a5f',
          700: '#172e4b',
          800: '#112338',
          900: '#0a1825',
        },
        amber: {
          50: '#fdf9ef',
          100: '#f9efd4',
          200: '#efdaa4',
          300: '#e5c474',
          400: '#d4a24c',
          500: '#c98f30',
          600: '#ab7326',
          700: '#85591e',
          800: '#5e4015',
          900: '#37260c',
        },
        mint: {
          50: '#effcfb',
          100: '#d0f7f4',
          200: '#a2efe9',
          300: '#73e6de',
          400: '#4ecdc4',
          500: '#32b5ac',
          600: '#27928b',
          700: '#1d6e69',
          800: '#144b47',
          900: '#0a2725',
        },
        coral: {
          50: '#fff2f2',
          100: '#ffd9d9',
          200: '#ffb3b3',
          300: '#ff8c8c',
          400: '#ff6b6b',
          500: '#ff4747',
          600: '#e52e2e',
          700: '#b82424',
          800: '#8a1b1b',
          900: '#5c1212',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f3eee6',
          300: '#ebe3d5',
          400: '#e0d4c1',
          500: '#d3c4ab',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(30, 58, 95, 0.06), 0 1px 2px rgba(30, 58, 95, 0.04)',
        'card-hover': '0 8px 24px rgba(30, 58, 95, 0.10), 0 2px 6px rgba(30, 58, 95, 0.06)',
        'glow-gold': '0 0 20px rgba(212, 162, 76, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
      backgroundImage: {
        'texture-linen': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
