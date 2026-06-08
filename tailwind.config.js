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
        amber: {
          primary: '#D4A574',
          dark: '#B8895A',
          light: '#E8C9A0',
          50: '#FFF8F0',
          100: '#FFEFD6',
          200: '#FFDBA8',
          300: '#FFC470',
          400: '#FFA838',
          500: '#D4A574',
          600: '#B8895A',
          700: '#8C6438',
          800: '#5E3F20',
          900: '#2C1810',
        },
        cabinet: {
          bg: '#1A0F08',
          wood: '#3D2415',
          shelf: '#5C3A22',
          glass: 'rgba(255,255,255,0.06)',
          highlight: 'rgba(212,165,116,0.15)',
        },
        coral: '#FF6B6B',
        gold: '#FFD700',
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cabinet': '0 4px 12px rgba(44, 24, 16, 0.3)',
        'cabinet-lg': '0 8px 24px rgba(44, 24, 16, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-coral': '0 0 12px rgba(255, 107, 107, 0.4)',
        'card': '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'wood-grain': 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
        'shelf-gradient': 'linear-gradient(180deg, #5C3A22 0%, #4A2E1A 60%, #3D2415 100%)',
      },
    },
  },
  plugins: [],
};
