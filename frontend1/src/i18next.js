import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uz from "./locales/uz/translation.json";
import ru from "./locales/ru/translation.json";
import en from "./locales/en/translation.json";
import turk from "./locales/turk/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
    turk: { translation: turk },
  },
  lng: "uz",
  fallbackLng: "uz",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
