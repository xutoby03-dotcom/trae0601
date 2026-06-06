/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0a0a1a',
        'game-panel': 'rgba(15, 15, 35, 0.9)',
        'game-border': 'rgba(100, 150, 255, 0.3)',
        'tower-single': '#00ff88',
        'tower-aoe': '#ff4444',
        'tower-ice': '#44aaff',
        'gold': '#ffd700',
        'life': '#ff4466',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(100, 150, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(100, 150, 255, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
