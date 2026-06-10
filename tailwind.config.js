/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        wine: {
          50: "#fdf2f2",
          100: "#fce4e4",
          200: "#f9cccc",
          300: "#f3a3a3",
          400: "#eb7070",
          500: "#dd4242",
          600: "#c72828",
          700: "#a71f1f",
          800: "#8b1c1c",
          900: "#731c1c",
          950: "#3e0a0a",
        },
        gold: {
          50: "#fdfaed",
          100: "#faf2cf",
          200: "#f5e396",
          300: "#efce5c",
          400: "#e8b933",
          500: "#d4af1f",
          600: "#b88b17",
          700: "#966616",
          800: "#7b5219",
          900: "#68431b",
          950: "#3c230a",
        },
        midnight: {
          50: "#f5f5f7",
          100: "#e7e7ed",
          200: "#cfd0dd",
          300: "#a9abc3",
          400: "#7d7fa4",
          500: "#5e6088",
          600: "#4a4b6e",
          700: "#3c3d5a",
          800: "#33344c",
          900: "#1a1a2e",
          950: "#0f0f1a",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        serif: ['"Noto Serif SC"', "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.3), 0 0 10px rgba(212, 175, 55, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.5), 0 0 30px rgba(212, 175, 55, 0.3)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.3)",
        "wine-glow": "0 0 20px rgba(139, 28, 28, 0.4)",
      },
    },
  },
  plugins: [],
};
