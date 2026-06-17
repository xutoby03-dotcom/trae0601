/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        rose: {
          gold: '#B76E79',
          light: '#D4A5A5',
          pale: '#F5E6E8',
        },
        champagne: {
          gold: '#D4AF37',
          light: '#E8D5A3',
          pale: '#FAF3E0',
        },
        cream: '#FDF5F0',
        ivory: '#FFFAF0',
        wine: '#8B0000',
        forest: '#2F4F4F',
        sage: '#9CAF88',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Noto Serif SC"', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #D4AF37, 0 0 10px #D4AF37' },
          '100%': { boxShadow: '0 0 15px #D4AF37, 0 0 30px #D4AF37' },
        },
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 175, 55, 0.15)',
        'rose': '0 4px 20px rgba(183, 110, 121, 0.15)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)',
        'rose-gradient': 'linear-gradient(135deg, #B76E79 0%, #E8B4BC 50%, #B76E79 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FDF5F0 0%, #FFFAF0 100%)',
      },
    },
  },
  plugins: [],
};
