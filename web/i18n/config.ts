import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ur from "./locales/ur.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" as const },
  { code: "ur", label: "اردو",    dir: "rtl" as const },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

// Safe init — works in both SSR and browser
if (!i18n.isInitialized) {
  // Detect saved language only in browser
  const savedLang =
    typeof window !== "undefined"
      ? (localStorage.getItem("i18nextLng") ?? "en")
      : "en";

  i18n
    .use(initReactI18next)   // No LanguageDetector — avoids SSR window access
    .init({
      resources: {
        en: { translation: en },
        ur: { translation: ur },
      },
      lng: savedLang,
      fallbackLng: "en",
      supportedLngs: ["en", "ur"],
      interpolation: { escapeValue: false },
    });
}

export default i18n;
