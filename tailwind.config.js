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
        studio: {
          950: "#0A0F1C",
          900: "#0F172A",
          850: "#141C2F",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        amber: {
          glow: "#F59E0B",
          warm: "#FBBF24",
          dim: "#D97706",
        },
        alert: {
          danger: "#EF4444",
          dangerBg: "rgba(239, 68, 68, 0.12)",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        "amber-glow": "0 0 24px rgba(245, 158, 11, 0.35)",
        "amber-glow-sm": "0 0 12px rgba(245, 158, 11, 0.25)",
        "device-main": "0 0 18px rgba(239, 68, 68, 0.55)",
        "device-fill": "0 0 18px rgba(59, 130, 246, 0.55)",
        "device-rim": "0 0 18px rgba(168, 85, 247, 0.55)",
        "danger-pulse": "0 0 0 3px rgba(239, 68, 68, 0.35)",
      },
      animation: {
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "marker-blink": "marker-blink 1.8s ease-in-out infinite",
        "slide-down": "slide-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        "marker-blink": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "shake": {
          "10%, 90%": { transform: "translateX(-1px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translateX(-3px)" },
          "40%, 60%": { transform: "translateX(3px)" },
        },
      },
    },
  },
  plugins: [],
};
