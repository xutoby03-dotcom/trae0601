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
        paper: {
          50: "#FAF8F3",
          100: "#F5F1E8",
          200: "#EDE6D4",
        },
        forest: {
          50: "#E8F0E3",
          100: "#C9DEC0",
          200: "#A5C897",
          300: "#6B8E4E",
          400: "#4A7237",
          500: "#2D5A27",
          600: "#1F4A1C",
          700: "#143811",
        },
        warning: {
          orange: "#E07B39",
          gold: "#B8860B",
          danger: "#A03232",
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Source Sans Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 2px 8px rgba(45, 90, 39, 0.08), 0 1px 2px rgba(45, 90, 39, 0.06)",
        "card-hover": "0 8px 24px rgba(45, 90, 39, 0.12), 0 2px 6px rgba(45, 90, 39, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
