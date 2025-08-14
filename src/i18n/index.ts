import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import viCommon from "./locales/vi/common.json";

import enCommon from "./locales/en/common.json";

import enSshKey from "./locales/en/sshkey.json";
import viSshKey from "./locales/vi/sshkey.json";

import enWorkload from "./locales/en/workload.json";
import viWorkload from "./locales/vi/workload.json";
// Configuration
i18n.use(initReactI18next).init({
  // Default language
  lng: "vi",
  fallbackLng: "en",

  // Namespaces
  ns: ["common"],
  defaultNS: "common",

  // Resources
  resources: {
    vi: {
      common: viCommon,
      sshkey: viSshKey,
      workload: viWorkload,
    },
    en: {
      common: enCommon,
      sshkey: enSshKey,
      workload: enWorkload,
    },
  },

  // Development settings
  debug: process.env.NODE_ENV === "development",

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Load language from localStorage if available
  react: {
    useSuspense: false,
  },
});

// Save language preference to localStorage
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});

// Load saved language preference
const savedLanguage = localStorage.getItem("i18nextLng");
if (savedLanguage && ["vi", "en"].includes(savedLanguage)) {
  i18n.changeLanguage(savedLanguage);
}

export default i18n;
