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
          50: "#FFF3EE",
          100: "#FFE2D4",
          200: "#FFC2A8",
          300: "#FFA17C",
          400: "#FF8150",
          500: "#FF6B35",
          600: "#E55A2B",
          700: "#B84520",
          800: "#8A3318",
          900: "#5C2210",
        },
        secondary: {
          50: "#EFFAF8",
          100: "#D4F1EC",
          200: "#A9E3D9",
          300: "#7DD5C6",
          400: "#52C7B3",
          500: "#4ECDC4",
          600: "#3DA99F",
          700: "#2C827A",
          800: "#1B5C56",
          900: "#0A3633",
        },
        success: "#2A9D8F",
        warning: "#FFB703",
        danger: "#E63946",
        info: "#219EBC",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        cardHover: "0 12px 32px rgba(0, 0, 0, 0.1)",
        primary: "0 4px 12px rgba(255, 107, 53, 0.35)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.2)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.4s ease-out both",
        pulseDot: "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
