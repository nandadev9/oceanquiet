import { STATUS_META } from "@/lib/ocean/constants";
import { useI18n } from "@/context/LanguageContext";
import type { Locale } from "@/i18n/translations";
import type { TaskStatus } from "@/lib/ocean/types";

const STATUS_LABELS: Record<Locale, Record<TaskStatus, string>> = {
  "pt-BR": { todo: "A fazer", doing: "Fazendo", done: "Feito", blocked: "Bloqueado" },
  en: { todo: "To do", doing: "In progress", done: "Done", blocked: "Blocked" },
  es: { todo: "Por hacer", doing: "En curso", done: "Hecho", blocked: "Bloqueado" },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const { locale } = useI18n();
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {STATUS_LABELS[locale][status]}
    </span>
  );
}
