import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        border:   "#E7E3D8",
        muted:    "#5B6478",
        surface:  "#FFFFFF",
      },

      fontFamily: {
        heading:   ["var(--font-playfair)",   "Playfair Display", "Georgia", "serif"],
        cormorant: ["var(--font-cormorant)",  "Cormorant Garamond", "Georgia", "serif"],
        body:      ["var(--font-inter)",      "Inter", "system-ui", "sans-serif"],
        urdu:      ["var(--font-noto-urdu)",  "Noto Nastaliq Urdu", "serif"],
        mono:      ["ui-monospace",           "SFMono-Regular", "Menlo", "monospace"],
      },

      fontSize: {
        xs:   ["12px", { lineHeight: "1.5" }],
        sm:   ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        lg:   ["18px", { lineHeight: "1.5" }],
        xl:   ["22px", { lineHeight: "1.35" }],
        "2xl":["28px", { lineHeight: "1.25" }],
        "3xl":["34px", { lineHeight: "1.15" }],
      },

      borderRadius: {
        sm:   "8px",
        md:   "12px",
        lg:   "16px",
        xl:   "24px",
        "2xl":"1rem",
        "3xl":"1.5rem",
        full: "9999px",
      },

      boxShadow: {
        xs:          "0 1px 2px rgba(11,27,58,.06)",
        sm:          "0 1px 3px rgba(11,27,58,.08), 0 1px 2px rgba(11,27,58,.04)",
        md:          "0 4px 12px rgba(11,27,58,.08), 0 2px 4px rgba(11,27,58,.04)",
        lg:          "0 12px 28px rgba(11,27,58,.12), 0 4px 8px rgba(11,27,58,.05)",
        gold:        "0 6px 18px rgba(138,100,20,.28)",
        "inner-top": "0 -4px 16px rgba(11,27,58,.08)",
        // legacy aliases (point to scale)
        card:        "0 1px 3px rgba(11,27,58,.08), 0 1px 2px rgba(11,27,58,.04)",
        "card-hover":"0 4px 12px rgba(11,27,58,.08), 0 2px 4px rgba(11,27,58,.04)",
        modal:       "0 12px 28px rgba(11,27,58,.12), 0 4px 8px rgba(11,27,58,.05)",
        navbar:      "0 -4px 16px rgba(11,27,58,.08)",
        sidebar:     "1px 0 0 0 rgba(11,27,58,.08)",
        input:       "0 0 0 3px rgba(138,100,20,.15)",
      },

      backgroundImage: {
        "navy-header": "linear-gradient(135deg, #0B1B3A 0%, #13264D 100%)",
        "gold-cta":    "linear-gradient(135deg, #A57A1F 0%, #8A6414 100%)",
      },

      screens: {
        xs:   "375px",
        sm:   "640px",
        md:   "768px",
        lg:   "1024px",
        xl:   "1280px",
        "2xl":"1440px",
      },

      keyframes: {
        "slide-up": { "0%": { transform: "translateY(100%)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        "slide-down": { "0%": { transform: "translateY(-8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "press": { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(.98)" }, "100%": { transform: "scale(1)" } },
        "count-up": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "bell-shake": { "0%,100%": { transform: "rotate(0)" }, "25%": { transform: "rotate(-12deg)" }, "75%": { transform: "rotate(12deg)" } },
        "glow-pulse": { "0%,100%": { boxShadow: "0 0 0 0 rgba(138,100,20,.4)" }, "50%": { boxShadow: "0 0 0 8px rgba(138,100,20,0)" } },
        "check-draw": { "0%": { strokeDashoffset: "100" }, "100%": { strokeDashoffset: "0" } },
      },
      animation: {
        "slide-up":   "slide-up 0.25s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "fade-in":    "fade-in 0.15s ease-out",
        shimmer:      "shimmer 1.6s linear infinite",
        press:        "press .15s ease-out",
        "count-up":   "count-up .6s ease-out",
        "bell-shake": "bell-shake .5s ease-out",
        "glow-pulse": "glow-pulse 1.8s ease-in-out infinite",
        "check-draw": "check-draw .4s ease-out forwards",
      },

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
