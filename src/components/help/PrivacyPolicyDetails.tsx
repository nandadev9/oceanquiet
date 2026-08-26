"use client";

import { useI18n } from "@/context/LanguageContext";
import { HELP_CONTENT } from "./helpContent";

const LGPD_LAW_URL = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm";
const SERPRO_GUIDE_URL = "https://www.serpro.gov.br/lgpd/noticias/2019/elabora-politica-privacidade-aderente-lgpd-dados-pessoais";

export default function PrivacyPolicyDetails() {
  const { locale } = useI18n();
  const copy = HELP_CONTENT[locale].privacy;

  return (
    <>
      <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
          {copy.summary}
        </p>
        <p className="mt-4 text-xs font-medium text-gray-400 dark:text-gray-500">{copy.updated}</p>
      </div>

      <div className="space-y-7">
        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{copy.sourcesLabel}</p>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>
            <a
              href={LGPD_LAW_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline decoration-brand-300 underline-offset-4 transition hover:text-brand-700 dark:text-brand-300 dark:decoration-brand-500/60 dark:hover:text-brand-200"
            >
              {copy.lgpdLaw}
            </a>
          </li>
          <li>
            <a
              href={SERPRO_GUIDE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline decoration-brand-300 underline-offset-4 transition hover:text-brand-700 dark:text-brand-300 dark:decoration-brand-500/60 dark:hover:text-brand-200"
            >
              {copy.serproGuide}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
