"use client";

import {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from "react";
import { useTranslation }     from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLang } from "@/i18n/config";

interface LangCtxValue {
  lang:      SupportedLang;
  dir:       "ltr" | "rtl";
  setLang:   (l: SupportedLang) => void;
  languages: typeof SUPPORTED_LANGUAGES;
}

const LangCtx = createContext<LangCtxValue>({
  lang:      "en",
  dir:       "ltr",
  setLang:   () => {},
  languages: SUPPORTED_LANGUAGES,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState<SupportedLang>(
    (i18n.language as SupportedLang) ?? "en"
  );

  const dir = SUPPORTED_LANGUAGES.find(l => l.code === lang)?.dir ?? "ltr";

  const setLang = useCallback((l: SupportedLang) => {
    i18n.changeLanguage(l);
    localStorage.setItem("i18nextLng", l);
    setLangState(l);
  }, [i18n]);

  // Sync when i18n changes externally
  useEffect(() => {
    const handler = (l: string) => setLangState(l as SupportedLang);
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, [i18n]);

  // Apply dir + font-class to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir",  dir);
    html.classList.toggle("font-urdu", lang === "ur");
  }, [lang, dir]);

  return (
    <LangCtx.Provider value={{ lang, dir, setLang, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
