"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/LanguageContext";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";
import {
  DEFAULT_PROFILE_AVATAR,
  prepareProfileAvatar,
  removeProfileAvatar,
  saveProfileAvatar,
} from "@/lib/profile/avatar";
import type { TranslationKey } from "@/i18n/translations";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export default function UserMetaCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const userName = user?.name || t("profile.member");
  const avatar = useProfileAvatar(user?.id);
  const canRemoveAvatar = avatar !== DEFAULT_PROFILE_AVATAR;

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setErrorKey(null);
    setIsProcessing(true);

    try {
      const avatarDataUrl = await prepareProfileAvatar(file);
      saveProfileAvatar(user?.id, avatarDataUrl);
    } catch (error) {
      const code = error instanceof Error ? error.message : "processing";
      setErrorKey(
        code === "invalid-type"
          ? "profile.avatarInvalidType"
          : code === "too-large"
            ? "profile.avatarTooLarge"
            : "profile.avatarProcessingError",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRemoveAvatar() {
    try {
      removeProfileAvatar(user?.id);
      setErrorKey(null);
    } catch {
      setErrorKey("profile.avatarStorageError");
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
        <div className="relative h-20 w-20 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            aria-label={t("profile.editPhoto")}
            className="group relative h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition focus:outline-none focus:ring-3 focus:ring-brand-500/30 disabled:cursor-wait dark:border-gray-800 dark:bg-gray-800"
          >
            {/* A data URL is used here after the user crops their own image locally. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={t("profile.avatarAlt")}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-gray-950/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {isProcessing ? (
                <LoaderCircle size={21} className="animate-spin" aria-hidden="true" />
              ) : (
                <Camera size={21} aria-hidden="true" />
              )}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {userName}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("profile.personalSpace")}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isProcessing}
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 disabled:cursor-wait disabled:opacity-60 dark:text-brand-300 dark:hover:text-brand-200"
            >
              {isProcessing
                ? t("profile.avatarSaving")
                : canRemoveAvatar
                  ? t("profile.changePhoto")
                  : t("profile.editPhoto")}
            </button>
            {canRemoveAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
              >
                <Trash2 size={14} aria-hidden="true" />
                {t("profile.removePhoto")}
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {t("profile.avatarHint")}
          </p>
          {errorKey && (
            <p className="mt-2 text-xs font-medium text-error-600 dark:text-error-400" role="alert">
              {t(errorKey)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
