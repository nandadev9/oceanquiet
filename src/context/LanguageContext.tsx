"use client";

import {
  DATE_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  translations,
  type Locale,
  type TranslationKey,
} from "@/i18n/translations";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const LANGUAGE_STORAGE_KEY = "oceanquiet.locale.v1";
type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  locale: Locale;
  dateLocale: string;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  formatDate: (
    value: Date | number | string,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (isLocale(savedLocale)) {
        setCurrentLocale(savedLocale);
      }

      setHasLoadedPreference(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && isLocale(event.newValue)) {
        setCurrentLocale(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;

    if (hasLoadedPreference) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    }
  }, [hasLoadedPreference, locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setCurrentLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      const translation =
        translations[locale][key] ?? translations[DEFAULT_LOCALE][key];

      if (!params) return translation;

      return Object.entries(params).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        translation,
      );
    },
    [locale],
  );

  const formatDate = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(DATE_LOCALES[locale], options).format(
        value instanceof Date ? value : new Date(value),
      ),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, dateLocale: DATE_LOCALES[locale], setLocale, t, formatDate }),
    [formatDate, locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }

  return context;
}

// Alias semântico para componentes que preferirem nomear o contexto por idioma.
export const useLanguage = useI18n;
