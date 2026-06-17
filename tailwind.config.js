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
        bg: {
          primary: "#0f1219",
          secondary: "#1a1f2e",
          tertiary: "#252b3d",
          elevated: "#2d3449",
        },
        accent: {
          copper: "#c89b3c",
          "copper-light": "#e0b85c",
          "copper-dark": "#a87f2e",
        },
        state: {
          success: "#2d5a3d",
          "success-light": "#3d7a52",
          danger: "#8b3a3a",
          "danger-light": "#a84a4a",
          warning: "#8b6a3a",
          "warning-light": "#a8824a",
          info: "#2d4a5a",
          "info-light": "#3d6a7a",
        },
        text: {
          primary: "#f0e8d8",
          secondary: "#a89f8f",
          muted: "#6b6458",
        },
        border: {
          subtle: "#3d3428",
          strong: "#5a4a32",
        },
      },
      fontFamily: {
        display: ["'Noto Serif SC'", "serif"],
        body: ["'Noto Sans SC'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(200, 155, 60, 0.15)",
        "glow-strong": "0 0 40px rgba(200, 155, 60, 0.25)",
        card: "0 4px 20px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
