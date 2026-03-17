import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const STORAGE_KEY = "lmcs-lang";

export const LANGUAGES = [
  { code: "en", labelKey: "common.english" as const },
  { code: "fr", labelKey: "common.french" as const },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

function getStoredLanguage(): string {
  if (typeof window === "undefined") return "fr";
  return localStorage.getItem(STORAGE_KEY) ?? "fr";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getStoredLanguage(),
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
