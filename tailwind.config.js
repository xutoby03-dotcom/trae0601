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
          bg: "#0A0A0A",
          panel: "#141414",
          card: "#1A1A1A",
          border: "#2A2A2A",
          hover: "#252525",
          muted: "#6B7280",
          text: "#E5E5E5",
          textDim: "#9CA3AF",
        },
        accent: {
          amber: "#F5A524",
          amberHover: "#D97706",
          purple: "#7C3AED",
          purpleHover: "#6D28D9",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        annotation: {
          sibilance: "#EF4444",
          nasality: "#F59E0B",
          plosives: "#3B82F6",
          noiseFloor: "#8B5CF6",
          emotion: "#10B981",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "studio-glow": "0 0 20px rgba(245, 165, 36, 0.15)",
        "studio-glow-lg": "0 0 40px rgba(245, 165, 36, 0.25)",
        "card-inset": "inset 0 1px 0 rgba(255,255,255,0.05)",
        "btn-pressed": "inset 0 2px 4px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(245, 165, 36, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(245, 165, 36, 0.6)" },
        },
        "vu-bounce": {
          "0%": { transform: "scaleY(0.1)" },
          "100%": { transform: "scaleY(var(--vu-level, 0.5))" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
