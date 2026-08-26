"use client";

import { useI18n } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { Check, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";

const PLAN_MANAGEMENT_URL = "https://oceanquiet.app";

const plans: Array<{
  nameKey: TranslationKey;
  detailKey: TranslationKey;
  valueKey: TranslationKey;
  current: boolean;
}> = [
  {
    nameKey: "profile.plan.weekly",
    detailKey: "profile.plan.weeklyDetail",
    valueKey: "profile.plan.weeklyValue",
    current: false,
  },
  {
    nameKey: "profile.plan.monthly",
    detailKey: "profile.plan.monthlyDetail",
    valueKey: "profile.plan.monthlyValue",
    current: true,
  },
  {
    nameKey: "profile.plan.quarterly",
    detailKey: "profile.plan.quarterlyDetail",
    valueKey: "profile.plan.quarterlyValue",
    current: false,
  },
  {
    nameKey: "profile.plan.annual",
    detailKey: "profile.plan.annualDetail",
    valueKey: "profile.plan.annualValue",
    current: false,
  },
];

export default function UserPlanCard() {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <CreditCard size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
              {t("profile.subscription")}
            </p>
            <h4 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("profile.yourPlan")}
            </h4>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("profile.planDescription")}
            </p>
          </div>
        </div>

        <a
          href={PLAN_MANAGEMENT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-auto"
        >
          {t("profile.managePlan")}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.nameKey}
            className={`relative rounded-xl border p-4 transition-colors ${
              plan.current
                ? "border-brand-300 bg-brand-50/70 dark:border-brand-500/50 dark:bg-brand-500/10"
                : "border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t(plan.nameKey)}
              </p>
              {plan.current && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Check size={10} strokeWidth={3} aria-hidden="true" />
                  {t("profile.current")}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {t(plan.detailKey)}
            </p>
            <p className="mt-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t(plan.valueKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <ShieldCheck
          size={15}
          className="shrink-0 text-brand-500 dark:text-brand-300"
          aria-hidden="true"
        />
        {t("profile.planSecurity")}
      </div>
    </section>
  );
}
