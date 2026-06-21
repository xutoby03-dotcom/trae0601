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
        'deep-navy': '#0a1628',
        'deep-navy-light': '#0f1f3a',
        'cyan-glow': '#00e5c7',
        'purple-glow': '#a855f7',
        'blue-light': '#1e40af',
        'purple-light': '#a78bfa',
        'warm-white': '#fef9ef',
        'snow-white': '#f0f9ff',
        'ice-blue': '#7dd3fc',
        'powder-pink': '#fbcfe8',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 229, 199, 0.15)',
        'purple-glow': '0 0 20px rgba(168, 85, 247, 0.15)',
        'inner-glow': 'inset 0 0 30px rgba(0, 229, 199, 0.05)',
      },
    },
  },
  plugins: [],
};
