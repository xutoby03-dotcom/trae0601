/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B1220",
          light: "#111827",
          card: "rgba(30, 41, 59, 0.6)",
        },
        surface: {
          DEFAULT: "#1E293B",
          hover: "#334155",
          border: "#475569",
        },
        teal: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        danger: {
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: "#F59E0B",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(15, 118, 110, 0.35)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.35)",
        card: "0 4px 24px -8px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-1": "radial-gradient(at 40% 20%, rgba(15,118,110,0.20) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(245,158,11,0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(13,148,136,0.10) 0px, transparent 50%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
