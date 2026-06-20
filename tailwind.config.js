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
        'stage': {
          'bg': '#000000',
          'bg-secondary': '#0a0a0a',
          'bg-card': '#111111',
          'bg-hover': '#1a1a1a',
          'border': '#222222',
          'text': '#ffffff',
          'text-secondary': '#888888',
          'text-muted': '#555555',
        },
        'neon': {
          green: '#00FF41',
          'green-dim': '#00CC33',
          red: '#FF1744',
          'red-dim': '#CC0022',
          yellow: '#FFD600',
          'yellow-dim': '#CCAA00',
          blue: '#00BFFF',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        display: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'xxs': '12px',
        'xs': '14px',
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
        '3xl': '36px',
        '4xl': '48px',
        '5xl': '64px',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash': 'flash 0.5s ease-in-out 3',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
