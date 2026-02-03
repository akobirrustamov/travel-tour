// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const savedLang = localStorage.getItem("appLang") || "ru";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: "en",
    debug: true, // 👈 временно включи, чтобы видеть логи загрузки
    interpolation: {
      escapeValue: false,
    },
    backend: {
      // 🔥 обязательно без точки, чтобы корректно работало в Vite
      loadPath: "/locales/{{lng}}/translation.json",
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
