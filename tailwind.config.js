/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "neon-pink": "#FF2E9D",
        "neon-purple": "#9D4EDD",
        "deep-blue": "#0D0221",
        "neon-green": "#39FF14",
        "neon-orange": "#FF6B35",
        "neon-blue": "#4CC9F0",
        "cyber-black": "#0A0A0F",
        "cyber-dark": "#12121A",
        "cyber-card": "rgba(18, 18, 26, 0.8)",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        sans: ["Noto Sans SC", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 46, 157, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 46, 157, 0.8)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "cyber-gradient":
          "linear-gradient(135deg, #0D0221 0%, #1A0536 50%, #0D0221 100%)",
        "neon-gradient":
          "linear-gradient(135deg, #FF2E9D 0%, #9D4EDD 50%, #4CC9F0 100%)",
      },
    },
  },
  plugins: [],
};
