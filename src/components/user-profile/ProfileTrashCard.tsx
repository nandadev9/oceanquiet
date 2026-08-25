"use client";

import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import { useI18n } from "@/context/LanguageContext";

export default function ProfileTrashCard() {
  const { ready, trashTasks } = useTasks();
  const { t } = useI18n();
  const trashCount = trashTasks.length;
  const countLabel = !ready
    ? t("profile.trashLoading")
    : trashCount === 0
      ? t("profile.trashEmpty")
      : `${trashCount} ${
          trashCount === 1 ? t("profile.trashItem") : t("profile.trashItems")
        }.`;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-5 dark:border-gray-700 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between lg:p-6">
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Trash2 size={19} aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {t("profile.trash")}
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {countLabel} {t("profile.trashRetention")}
          </p>
        </div>
      </div>

      <Link
        href="/lixeira"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.06] sm:w-auto"
      >
        {t("profile.openTrash")}
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
