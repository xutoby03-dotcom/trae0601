/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        cream: "#FFFAF3",
        warm: {
          50: "#FFF5EC",
          100: "#FFE8D4",
          200: "#FFD1A8",
          300: "#FFB878",
          400: "#FFA050",
          500: "#FF8C42",
          600: "#E87020",
          700: "#C25810",
          800: "#8F4008",
          900: "#5C2804",
        },
        mint: {
          50: "#EDFAF8",
          100: "#D4F4EF",
          200: "#A8E8DE",
          300: "#7DDBCD",
          400: "#58D0C0",
          500: "#4ECDC4",
          600: "#35B0A8",
          700: "#228780",
          800: "#16605C",
          900: "#0B3A38",
        },
        ink: {
          50: "#F6F7F7",
          100: "#E3E6E7",
          200: "#C7CED0",
          300: "#9DA7AB",
          400: "#6B787D",
          500: "#4A575C",
          600: "#394449",
          700: "#2D3436",
          800: "#1E2325",
          900: "#111415",
        },
        alert: {
          50: "#FFF1F1",
          100: "#FFDEDE",
          200: "#FFC0C0",
          300: "#FF9696",
          400: "#FF7A7A",
          500: "#FF6B6B",
          600: "#E04848",
          700: "#B32E2E",
          800: "#801A1A",
          900: "#4D0E0E",
        },
      },
      fontFamily: {
        display: ["'Lora'", "serif"],
        sans: ["'Nunito'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(45, 52, 54, 0.08)",
        "soft-lg": "0 10px 40px -4px rgba(45, 52, 54, 0.12)",
        warm: "0 4px 20px -2px rgba(255, 140, 66, 0.25)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
        xl4: "1.5rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "slide-down": "slide-down 0.35s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
