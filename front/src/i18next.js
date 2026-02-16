import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uz from "../public/locales/uz/translation.json";
import ru from "../public/locales/ru/translation.json";
import en from "../public/locales/en/translation.json";
import turk from "../public/locales/turk/translation.json";

const savedLang = localStorage.getItem("appLang") || "uz";

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
    turk: { translation: turk },
  },
  lng: savedLang,
  fallbackLng: "uz",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
