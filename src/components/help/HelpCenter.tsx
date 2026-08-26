"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { BookOpenCheck, ChevronDown, ExternalLink, HelpCircle, Mail, ShieldCheck } from "lucide-react";
import { useI18n } from "@/context/LanguageContext";
import { OceanPage } from "@/components/ocean/OceanStyles";
import { HELP_CONTENT } from "./helpContent";

export default function HelpCenter() {
  const { locale } = useI18n();
  const copy = HELP_CONTENT[locale];
  const [prepared, setPrepared] = useState(false);

  function handleSupportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrepared(true);
  }

  return (
    <OceanPage>
      <div className="mx-auto max-w-5xl space-y-6 pb-8">
        <section className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-teal-50 p-6 shadow-theme-xs dark:border-brand-500/20 dark:from-brand-500/10 dark:via-gray-900 dark:to-teal-500/5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-theme-sm">
                <HelpCircle size={22} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{copy.description}</p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-gray-900/70 dark:text-brand-200">
              {copy.currentPrototype}
            </span>
          </div>
        </section>

        <section id="faq" className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
          <div className="flex gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
              <BookOpenCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">{copy.faq.eyebrow}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{copy.faq.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{copy.faq.description}</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            {copy.faq.items.map((item, index) => (
              <details key={item.question} className="group py-1" open={index === 0}>
                <summary className="flex list-none items-center justify-between gap-4 px-1 py-4 text-sm font-semibold text-gray-800 marker:content-none dark:text-white/90">
                  {item.question}
                  <ChevronDown size={18} className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="max-w-3xl px-1 pb-4 text-sm leading-7 text-gray-500 dark:text-gray-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="privacidade" className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex max-w-3xl gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">{copy.privacy.eyebrow}</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{copy.privacy.title}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">{copy.privacy.summary}</p>
                <p className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-500">{copy.privacy.updated}</p>
              </div>
            </div>
            <Link
              href="/privacidade"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.06]"
            >
              {copy.privacy.readFullPolicy}
              <ExternalLink size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section id="suporte" className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-7">
          <div className="flex gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
              <Mail size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">{copy.support.eyebrow}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{copy.support.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{copy.support.description}</p>
            </div>
          </div>

          <form onSubmit={handleSupportSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label={copy.support.name} name="name" />
            <Field label={copy.support.email} name="email" type="email" />
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{copy.support.category}</span>
              <select name="category" className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90">
                {copy.support.categoryOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <Field label={copy.support.subject} name="subject" />
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{copy.support.message}</span>
              <textarea name="message" rows={5} className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500" />
            </label>
            <div className="sm:col-span-2">
              <p className="text-xs leading-5 text-gray-400 dark:text-gray-500">{copy.support.notice}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-500/25">
                  {copy.support.submit}
                </button>
                {prepared && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300" role="status">{copy.support.prepared}</p>}
              </div>
            </div>
          </form>
        </section>
      </div>
    </OceanPage>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input name={name} type={type} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500" />
    </label>
  );
}
