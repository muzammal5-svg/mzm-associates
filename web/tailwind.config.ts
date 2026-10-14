import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Palette ────────────────────────────────────────────────────
      colors: {
        gold: {
          DEFAULT: "#8A6414",
          50:  "#FDF8EE",
          100: "#F7EDCF",
          200: "#EDD99F",
          300: "#E0C06A",
          400: "#CFA53A",
          500: "#8A6414",
          600: "#6E4F10",
          700: "#543C0C",
          800: "#3A2A08",
          900: "#211704",
        },
        navy: {
          DEFAULT: "#0B1B3A",
          50:  "#E8EBF2",
          100: "#C5CCDF",
          200: "#8E9DC0",
          300: "#5A6EA0",
          400: "#2E4480",
          500: "#0B1B3A",
          600: "#09162F",
          700: "#071025",
          800: "#050B1A",
          900: "#02060F",
        },
        offwhite: "#F7F7F4",
        success:  "#1F7A4D",
        danger:   "#C0392B",
        warning:  "#D97706",
        info:     "#2563EB",
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        heading:   ["var(--font-playfair)",   "Playfair Display", "Georgia", "serif"],
        cormorant: ["var(--font-cormorant)",  "Cormorant Garamond", "Georgia", "serif"],
        body:      ["var(--font-inter)",      "Inter", "system-ui", "sans-serif"],
        urdu:      ["var(--font-noto-urdu)",  "Noto Nastaliq Urdu", "serif"],
        mono:      ["ui-monospace",           "SFMono-Regular", "Menlo", "monospace"],
      },

      // ── Spacing / Sizing ─────────────────────────────────────────────────
      spacing: {
        "4.5": "1.125rem",
        "18":  "4.5rem",
        "22":  "5.5rem",
      },

      // ── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // ── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        card:    "0 1px 4px 0 rgba(11,27,58,0.08), 0 0 1px 0 rgba(11,27,58,0.06)",
        "card-hover": "0 4px 16px 0 rgba(11,27,58,0.12), 0 0 1px 0 rgba(11,27,58,0.08)",
        modal:   "0 8px 32px 0 rgba(11,27,58,0.20), 0 0 1px 0 rgba(11,27,58,0.10)",
        navbar:  "0 -1px 0 0 rgba(11,27,58,0.08)",
        sidebar: "1px 0 0 0 rgba(11,27,58,0.08)",
        input:   "0 0 0 3px rgba(138,100,20,0.15)",
      },

      // ── Screens ──────────────────────────────────────────────────────────
      screens: {
        xs:   "375px",
        sm:   "640px",
        md:   "768px",
        lg:   "1024px",
        xl:   "1280px",
        "2xl":"1440px",
      },

      // ── Animation ────────────────────────────────────────────────────────
      keyframes: {
        "slide-up": {
          "0%":   { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-down": {
          "0%":   { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-up":   "slide-up 0.25s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "fade-in":    "fade-in 0.15s ease-out",
        shimmer:      "shimmer 1.6s linear infinite",
      },

      // ── Z-index ──────────────────────────────────────────────────────────
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
