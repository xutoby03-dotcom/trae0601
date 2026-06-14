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
        steel: {
          50: "#f0f5fa",
          100: "#dbe7f3",
          200: "#b4cde4",
          300: "#82aad0",
          400: "#4d82b8",
          500: "#2b639d",
          600: "#1e3a5f",
          700: "#1a3354",
          800: "#182c47",
          900: "#16283d",
          950: "#0d1725",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        signal: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
        },
        forest: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
        },
        slate2: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        "card-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
        "industrial": "0 4px 6px -1px rgba(30, 58, 95, 0.15), 0 2px 4px -2px rgba(30, 58, 95, 0.08)",
      },
      backgroundImage: {
        "grid-texture":
          "linear-gradient(rgba(30, 58, 95, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 95, 0.04) 1px, transparent 1px)",
        "noise-overlay":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "grid-20": "20px 20px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "blink-dot": "blinkDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blinkDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
      },
    },
  },
  plugins: [],
};
