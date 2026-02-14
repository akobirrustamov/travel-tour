import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const savedLang = localStorage.getItem("appLang") || "uz"; // Default to Uzbek

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: savedLang, // Default language
    fallbackLng: "uz", // Fallback to Uzbek if the translation is missing
    debug: true, // Enable debug for development
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      // The path to load the translation files
      loadPath: "/locales/{{lng}}/translation.json", // Ensure this path matches your directory structure
    },
    react: {
      useSuspense: false, // Avoid suspending the app when loading translations
    },
    supportedLngs: ["uz", "ru", "en", "turk"], // Supported languages
  });

export default i18n;
