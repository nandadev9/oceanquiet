"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/LanguageContext";
import {
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
  type TranslationKey,
} from "@/i18n/translations";
import { Globe2 } from "lucide-react";

const languageLabelKeys: Record<Locale, TranslationKey> = {
  "pt-BR": "profile.language.pt-BR",
  en: "profile.language.en",
  es: "profile.language.es",
};

function getNameParts(name?: string) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    firstName: parts[0] ?? "—",
    lastName: parts.slice(1).join(" ") || "—",
  };
}

export default function UserInfoCard() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { firstName, lastName } = getNameParts(user?.name);

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("profile.personalInformation")}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("profile.personalInformationDescription")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7">
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            {t("profile.firstName")}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {firstName}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            {t("profile.lastName")}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {lastName}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            {t("profile.email")}
          </p>
          <p className="break-all text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.email || "—"}
          </p>
        </div>
      </div>

      <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
        <div className="flex gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Globe2 size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <label
              htmlFor="profile-language"
              className="text-sm font-semibold text-gray-800 dark:text-white/90"
            >
              {t("profile.language")}
            </label>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("profile.languageDescription")}
            </p>
            <select
              id="profile-language"
              value={locale}
              onChange={(event) => {
                if (isLocale(event.target.value)) {
                  setLocale(event.target.value);
                }
              }}
              className="mt-4 h-11 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
            >
              {SUPPORTED_LOCALES.map((supportedLocale) => (
                <option key={supportedLocale} value={supportedLocale}>
                  {t(languageLabelKeys[supportedLocale])}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
