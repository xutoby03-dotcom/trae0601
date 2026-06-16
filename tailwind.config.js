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
        primary: {
          DEFAULT: "#1e3a5f",
          light: "#2d4f7c",
          dark: "#152a45",
        },
        success: {
          DEFAULT: "#2a9d8f",
          light: "#3db5a6",
        },
        warning: {
          DEFAULT: "#f4a261",
          light: "#f7b884",
        },
        danger: {
          DEFAULT: "#e63946",
          light: "#eb5a66",
        },
        neutral: {
          50: "#f8f9fa",
          100: "#e9ecef",
          200: "#dee2e6",
          300: "#ced4da",
          400: "#adb5bd",
          500: "#6c757d",
          600: "#495057",
          700: "#343a40",
          800: "#212529",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      animation: {
        "pulse-border": "pulse-border 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "pulse-border": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(230, 57, 70, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 0 8px rgba(230, 57, 70, 0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
