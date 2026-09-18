"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n/translations";

type LanguageContextType = {
  locale: Locale;
  isEn: boolean;
  isTr: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "tentamark_lang";
const CHANGE_EVENT = "tentamark:language-change";
let fallbackLocale: Locale = "tr";

function getClientLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "tr" || stored === "en" ? stored : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function subscribeToLocale(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getClientLocale, () => "tr" as Locale);

  const setLocale = (newLocale: Locale) => {
    fallbackLocale = newLocale;
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Ignore localStorage write errors
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  const toggleLocale = () => {
    setLocale(locale === "tr" ? "en" : "tr");
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const isEn = locale === "en";
  const isTr = locale === "tr";
  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, isEn, isTr, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
