"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/LanguageContext";
import Image from "next/image";

export default function UserMetaCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const userName = user?.name || t("profile.member");

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          <Image
            width={80}
            height={80}
            src="/images/user/owner.jpg"
            alt={t("profile.avatarAlt")}
          />
        </div>
        <div className="text-center sm:text-left">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {userName}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("profile.personalSpace")}
          </p>
        </div>
      </div>
    </section>
  );
}
