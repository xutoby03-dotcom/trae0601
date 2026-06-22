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
          50: "#eef4fb",
          100: "#d5e4f2",
          200: "#aac9e5",
          300: "#74a7d2",
          400: "#4484bc",
          500: "#2b6aa3",
          600: "#1e3a5f",
          700: "#1a314f",
          800: "#172a42",
          900: "#0f1b2b",
        },
        accent: {
          coral: "#ff6b6b",
          mint: "#2ed573",
          amber: "#ffa502",
          red: "#ff4757",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Source Han Sans CN"', '"PingFang SC"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif SC"', '"Source Han Serif CN"', '"Songti SC"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(30, 58, 95, 0.15)",
        card: "0 2px 12px -2px rgba(0, 0, 0, 0.08)",
        float: "0 8px 32px -8px rgba(30, 58, 95, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
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
