/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        // 图书馆暖色调
        wood: {
          50: '#FDF8F3',
          100: '#F7EDE0',
          200: '#E8D4B8',
          300: '#D4B48A',
          400: '#B89363',
          500: '#9C7548',
          600: '#7D5C37',
          700: '#5D4037',
          800: '#4A322C',
          900: '#3A2722',
        },
        paper: {
          50: '#FFFBF2',
          100: '#FFF8E1',
          200: '#F5ECD4',
          300: '#E8DBC0',
          400: '#D4C5A4',
        },
        accent: {
          orange: '#FF8A65',
          orangeLight: '#FFAB91',
          olive: '#81A263',
          oliveLight: '#A5C288',
          brick: '#C85A5A',
          brickLight: '#D98080',
          ink: '#2C3E50',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'book': '2px 4px 12px rgba(93, 64, 55, 0.25), inset 0 -2px 4px rgba(0,0,0,0.1)',
        'book-hover': '4px 8px 20px rgba(93, 64, 55, 0.35), inset 0 -2px 4px rgba(0,0,0,0.1)',
        'paper': '0 2px 8px rgba(93, 64, 55, 0.12), 0 1px 3px rgba(93, 64, 55, 0.08)',
        'paper-raised': '0 8px 24px rgba(93, 64, 55, 0.16), 0 2px 6px rgba(93, 64, 55, 0.1)',
      },
      backgroundImage: {
        'wood-grain': "repeating-linear-gradient(90deg, rgba(93,64,55,0.05) 0px, rgba(93,64,55,0.05) 2px, transparent 2px, transparent 8px)",
        'paper-texture': "radial-gradient(circle at 20% 30%, rgba(255,200,150,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(200,150,100,0.06) 0%, transparent 50%)",
      },
      keyframes: {
        'book-fall': {
          '0%': { transform: 'translateY(-60px) rotateX(-20deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotateX(0)', opacity: '1' },
        },
        'book-tilt': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '100%': { transform: 'rotateY(-8deg) scale(1.05) translateZ(20px)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(60px) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'book-fall': 'book-fall 0.6s ease-out forwards',
        'book-tilt': 'book-tilt 0.3s ease-out forwards',
        'breathe': 'breathe 2.5s ease-in-out infinite',
        'confetti': 'confetti 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};
