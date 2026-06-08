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
        warm: {
          orange: '#E8722A',
          brown: '#3D2B1F',
          cream: '#FFF8F0',
          peach: '#FFD4B2',
        },
        sky: {
          blue: '#6CB4EE',
        },
        mint: {
          green: '#7BC8A4',
        },
        tag: {
          food: '#FF6B6B',
          scenery: '#4ECDC4',
          transport: '#45B7D1',
          pitfall: '#96CEB4',
          surprise: '#FFEAA7',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      backgroundImage: {
        'paper': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
