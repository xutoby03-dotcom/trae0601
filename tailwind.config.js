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
        cinema: {
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#7e22ce",
          700: "#6b21a8",
          900: "#1A0B2E",
          950: "#0d0518",
        },
        neon: {
          pink: "#FF2E9F",
          amber: "#FFB43A",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 46, 159, 0.3)",
        "glow-amber": "0 0 40px rgba(255, 180, 58, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "film-strip":
          "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-in": "fadeSlideIn 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
