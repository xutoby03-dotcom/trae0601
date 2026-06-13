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
        forest: {
          50: "#F0F5EC",
          100: "#DCE8D3",
          200: "#B9D1A8",
          300: "#96BA7D",
          400: "#73A352",
          500: "#6B8E4E",
          600: "#4E7239",
          700: "#3A562B",
          800: "#2D5A27",
          900: "#1F3E1C",
        },
        moss: {
          50: "#F7F5EF",
          100: "#EFE9D6",
          200: "#DFD3AD",
          300: "#CFBD84",
          400: "#BFA75B",
          500: "#A89048",
          600: "#867339",
          700: "#65562A",
          800: "#433A1C",
          900: "#221D0E",
        },
        cream: {
          50: "#FBFAF6",
          100: "#F5F1E8",
          200: "#EBE3D0",
          300: "#E1D5B8",
          400: "#D7C7A0",
          500: "#CDB988",
        },
        amber: {
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(45, 90, 39, 0.08), 0 4px 16px rgba(45, 90, 39, 0.04)",
        "card-hover":
          "0 4px 16px rgba(45, 90, 39, 0.12), 0 8px 32px rgba(45, 90, 39, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
