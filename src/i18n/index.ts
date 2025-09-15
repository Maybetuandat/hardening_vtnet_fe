import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import viCommon from "./locales/vi/common.json";

import enCommon from "./locales/en/common.json";

import enWorkload from "./locales/en/workload.json";
import viWorkload from "./locales/vi/workload.json";
import enNotfound from "./locales/en/notfound.json";
import viNotfound from "./locales/vi/notfound.json";
import enDashboard from "./locales/en/dashboard.json";
import viDashboard from "./locales/vi/dashboard.json";
import enCompliance from "./locales/en/compliance.json";
import viCompliance from "./locales/vi/compliance.json";
import viServer from "./locales/vi/server.json";
import enServer from "./locales/en/server.json";
import enOs from "./locales/en/os.json";
import viOs from "./locales/vi/os.json";
import viAuth from "./locales/vi/auth.json";
import enAuth from "./locales/en/auth.json";
import enUser from "./locales/en/user.json";
import viUser from "./locales/vi/user.json";
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",

  // Namespaces
  ns: [
    "common",
    "workload",
    "notfound",
    "dashboard",
    "compliance",
    "server",
    "os",
    "auth",
  ],
  defaultNS: "common",

  // Resources
  resources: {
    vi: {
      common: viCommon,

      workload: viWorkload,
      notfound: viNotfound,
      dashboard: viDashboard,
      compliance: viCompliance,
      server: viServer,
      auth: viAuth,
      os: viOs,
      user: viUser,
    },
    en: {
      common: enCommon,

      workload: enWorkload,
      notfound: enNotfound,
      dashboard: enDashboard,
      compliance: enCompliance,
      server: enServer,
      os: enOs,
      auth: enAuth,
      user: enUser,
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
