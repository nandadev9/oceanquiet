"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/context/LanguageContext";
import { OceanStyles } from "@/components/ocean/OceanStyles";
import { HELP_CONTENT } from "./helpContent";
import PrivacyPolicyDetails from "./PrivacyPolicyDetails";

export default function PrivacyPolicyPage() {
  const { locale } = useI18n();
  const copy = HELP_CONTENT[locale];

  return (
    <div className="oq-font min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6 sm:py-12">
      <OceanStyles />
      <main className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Image src="/images/logo/oceanquiet-logo.svg" alt="OceanQuiet" width={196} height={40} className="dark:hidden" priority />
          <Image src="/images/logo/oceanquiet-logo-dark.svg" alt="OceanQuiet" width={196} height={40} className="hidden dark:block" priority />
          <Link href="/ajuda" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{copy.backToHelp}</span>
          </Link>
        </div>
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-10">
          <PrivacyPolicyDetails />
        </article>
      </main>
    </div>
  );
}
