/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        brand: {
          50: "#FFF5F0",
          100: "#FFE8D9",
          200: "#FFD0B3",
          300: "#FFB080",
          400: "#FF8F4D",
          500: "#FF7A45",
          600: "#E85C2A",
          700: "#C2471E",
          800: "#9C3818",
          900: "#7A2C13",
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E",
          600: "#16A34A",
        },
        danger: {
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        info: {
          50: "#EFF6FF",
          500: "#3B82F6",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        display: ['"LXGW WenKai"', '"KaiTi"', '"STKaiti"', "serif"],
      },
      boxShadow: {
        card: "0 4px 24px -8px rgba(15, 23, 42, 0.08)",
        "card-hover": "0 8px 32px -8px rgba(255, 122, 69, 0.18)",
        button: "0 2px 8px rgba(255, 122, 69, 0.35)",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan-line": {
          "0%": { top: "0%" },
          "50%": { top: "95%" },
          "100%": { top: "0%" },
        },
        "check-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "scan-line": "scan-line 2.4s ease-in-out infinite",
        "check-in": "check-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
