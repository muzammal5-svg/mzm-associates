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
        // Rich metallic gold — 400 is the decorative "champagne" tone,
        // 500 (#B8860B) is the accessible text/surface tone.
        gold: {
          DEFAULT: "#B8860B",
          50:  "#FDF9EE",
          100: "#F8EDD2",
          200: "#EFDB9E",
          300: "#E3C264",
          400: "#D4AF37",
          500: "#B8860B",
          600: "#9C6F08",
          700: "#7A5606",
          800: "#5C4005",
          900: "#3D2B03",
        },
        // Deep luxury navy — 700 is the primary surface, 800 the deepest brand tone.
        navy: {
          DEFAULT: "#0F172A",
          50:  "#F1F5F9",
          100: "#E2E8F0",
          200: "#CBD5E1",
          300: "#94A3B8",
          400: "#64748B",
          500: "#334155",
          600: "#1E293B",
          700: "#0F172A",
          800: "#0B132B",
          900: "#060B18",
        },
        offwhite: "#F8FAFC",
        success:  "#1F7A4D",
        danger:   "#C0392B",
        warning:  "#D97706",
        info:     "#2563EB",
        border:   "#E2E8F0",
        muted:    "#5B6478",
        surface:  "#FFFFFF",
      },

      fontFamily: {
        heading:   ["var(--font-playfair)",   "Playfair Display", "Georgia", "serif"],
        cormorant: ["var(--font-cormorant)",  "Cormorant Garamond", "Georgia", "serif"],
        body:      ["var(--font-jakarta)",    "Plus Jakarta Sans", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        jakarta:   ["var(--font-jakarta)",    "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        inter:     ["var(--font-inter)",      "Inter", "system-ui", "sans-serif"],
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
        xs:          "0 1px 2px rgba(15,23,42,.06)",
        sm:          "0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)",
        md:          "0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04)",
        lg:          "0 12px 28px rgba(15,23,42,.12), 0 4px 8px rgba(15,23,42,.05)",
        xl:          "0 24px 56px rgba(15,23,42,.16), 0 8px 16px rgba(15,23,42,.06)",
        gold:        "0 6px 18px rgba(184,134,11,.28)",
        "gold-lg":   "0 14px 34px rgba(184,134,11,.34)",
        // Premium gold glow used on hover states and "most popular" cards.
        "glow-gold": "0 0 15px rgba(212,175,55,.3)",
        "glow-gold-lg": "0 0 0 1px rgba(212,175,55,.45), 0 18px 46px rgba(212,175,55,.22)",
        "glow-navy": "0 0 0 1px rgba(15,23,42,.10), 0 18px 46px rgba(15,23,42,.16)",
        "inner-top": "0 -4px 16px rgba(15,23,42,.08)",
        // legacy aliases (point to scale)
        card:        "0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)",
        "card-hover":"0 4px 12px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04)",
        modal:       "0 12px 28px rgba(15,23,42,.12), 0 4px 8px rgba(15,23,42,.05)",
        navbar:      "0 -4px 16px rgba(15,23,42,.08)",
        sidebar:     "1px 0 0 0 rgba(15,23,42,.08)",
        input:       "0 0 0 3px rgba(184,134,11,.15)",
      },

      backgroundImage: {
        "navy-header": "linear-gradient(135deg, #0B132B 0%, #0F172A 55%, #16233F 100%)",
        "gold-cta":    "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
        "gold-soft":   "linear-gradient(135deg, #F6E7B4 0%, #D4AF37 100%)",
        // Subtle mesh gradient used behind light sections.
        "mesh-surface":"radial-gradient(1100px 520px at 8% -12%, rgba(212,175,55,.16), transparent 60%), radial-gradient(900px 480px at 102% 0%, rgba(15,23,42,.10), transparent 58%), linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        "mesh-dark":   "radial-gradient(900px 480px at 12% 0%, rgba(212,175,55,.18), transparent 55%), radial-gradient(800px 420px at 92% 12%, rgba(37,99,235,.16), transparent 58%), linear-gradient(160deg, #0B132B 0%, #0F172A 60%, #060B18 100%)",
        "text-gold-gradient": "linear-gradient(110deg, #F6E7B4 0%, #D4AF37 42%, #B8860B 100%)",
        "text-navy-gradient": "linear-gradient(110deg, #0F172A 0%, #334155 55%, #B8860B 100%)",
        "glass-sheen": "linear-gradient(135deg, rgba(255,255,255,.85) 0%, rgba(255,255,255,.55) 100%)",
      },

      screens: {
        xs:   "375px",
        sm:   "640px",
        md:   "768px",
        lg:   "1024px",
        xl:   "1280px",
        "2xl":"1440px",
      },

      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-soft": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        "slide-up": { "0%": { transform: "translateY(100%)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        "slide-down": { "0%": { transform: "translateY(-8px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        press: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(.98)" }, "100%": { transform: "scale(1)" } },
        "count-up": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "bell-shake": { "0%,100%": { transform: "rotate(0)" }, "25%": { transform: "rotate(-12deg)" }, "75%": { transform: "rotate(12deg)" } },
        "glow-pulse": { "0%,100%": { boxShadow: "0 0 0 0 rgba(184,134,11,.4)" }, "50%": { boxShadow: "0 0 0 8px rgba(184,134,11,0)" } },
        "check-draw": { "0%": { strokeDashoffset: "100" }, "100%": { strokeDashoffset: "0" } },
        "gradient-pan": { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "pulse-dot": { "0%,100%": { transform: "scale(1)", opacity: ".65" }, "50%": { transform: "scale(2.1)", opacity: "0" } },
        "scale-sway": { "0%,100%": { transform: "rotate(-5deg)" }, "50%": { transform: "rotate(5deg)" } },
        "float-slow": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "drawer-in": { "0%": { transform: "translateX(-28px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        "sheen": { "0%": { transform: "translateX(-120%)" }, "100%": { transform: "translateX(120%)" } },
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
        "gradient-pan": "gradient-pan 6s ease infinite",
        "pulse-dot": "pulse-dot 1.8s ease-out infinite",
        "scale-sway": "scale-sway 3.2s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "drawer-in": "drawer-in 0.28s cubic-bezier(0.16,1,0.3,1)",
        sheen:        "sheen 2.4s ease-in-out infinite",
      },

      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
