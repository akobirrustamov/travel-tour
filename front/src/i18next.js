// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const savedLang = localStorage.getItem("appLang") || "uz"; // Default to Russian

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: savedLang, // Set the default language based on savedLang or fallback
        fallbackLng: "en", // Fallback language if the selected language is not available
        debug: true, // 👈 Temporarily enable to see the loading logs
        interpolation: {
            escapeValue: false, // Disable escaping of variables (React already does this)
        },
        backend: {
            // 🔥 Path to your translation files; ensure the language code corresponds to file names
            loadPath: "/locales/{{lng}}/translation.json",
        },
        react: {
            useSuspense: false, // Avoid suspension when loading translations
        },
        supportedLngs: ["uz", "ru", "en", "turk"], // Add the languages you want to support
    });

export default i18n;