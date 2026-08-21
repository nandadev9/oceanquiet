import type { Category, CategoryColor, EventColor, TaskBoard, TaskStatus } from "./types";

export const CAT_NAME_LIMIT = 15;

export const COLOR_OPTIONS: CategoryColor[] = [
  { name: "violet", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { name: "indigo", dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  { name: "emerald", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { name: "amber", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  { name: "rose", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { name: "sky", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
];

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; badge: string }
> = {
  todo: {
    label: "A fazer",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400",
  },
  doing: {
    label: "Fazendo",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  done: {
    label: "Feito",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  blocked: {
    label: "Bloqueado",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

export const BOARD_LABELS: Record<TaskBoard, string> = {
  inbox: "Tarefas",
  daily: "Foco de hoje",
  weekly: "Foco da semana",
};

export const HOUR_START = 0;
export const HOUR_END = 24;
export const PX_PER_HOUR = 64;
export const PERIOD_HEADER_PX = 28;
export const SNAP_MINUTES = 15;
export const DEFAULT_DURATION_MINUTES = 60;

export const DAY_PERIODS = [
  { id: "amanhecer", label: "Amanhecer", startHour: 5, endHour: 7, tint: "bg-amber-50/70 dark:bg-amber-500/5" },
  { id: "manha", label: "Manhã", startHour: 7, endHour: 12, tint: "bg-sky-50/60 dark:bg-sky-500/5" },
  { id: "tarde", label: "Tarde", startHour: 12, endHour: 18, tint: "bg-orange-50/50 dark:bg-orange-500/5" },
  { id: "entardecer", label: "Entardecer", startHour: 18, endHour: 21, tint: "bg-violet-50/60 dark:bg-violet-500/5" },
  { id: "noite", label: "Noite", startHour: 21, endHour: 24, tint: "bg-indigo-50/40 dark:bg-indigo-500/5" },
  { id: "madrugada", label: "Madrugada", startHour: 0, endHour: 5, tint: "bg-slate-100/70 dark:bg-white/[0.03]" },
] as const;

export const EVENT_SIGNALS: Record<
  EventColor,
  { label: string; swatch: string; bar: string; bg: string; border: string; text: string }
> = {
  primary: {
    label: "Primária",
    swatch: "bg-indigo-500",
    bar: "bg-indigo-500",
    bg: "#e0e7ff",
    border: "#4f46e5",
    text: "#312e81",
  },
  danger: {
    label: "Urgente",
    swatch: "bg-rose-500",
    bar: "bg-rose-500",
    bg: "#fee4e2",
    border: "#f04438",
    text: "#7a271a",
  },
  success: {
    label: "Tranquilo",
    swatch: "bg-emerald-500",
    bar: "bg-emerald-500",
    bg: "#d1fadf",
    border: "#12b76a",
    text: "#054f31",
  },
  warning: {
    label: "Atenção",
    swatch: "bg-orange-500",
    bar: "bg-orange-500",
    bg: "#fef0c7",
    border: "#f79009",
    text: "#7a2e0e",
  },
};

export const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 h", value: 60 },
  { label: "1 h 30", value: 90 },
  { label: "2 h", value: 120 },
];

export const FALLBACK_CATEGORY_COLOR: CategoryColor = COLOR_OPTIONS[0];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "estudos", name: "Estudos", color: COLOR_OPTIONS[0] },
  { id: "trabalho", name: "Trabalho", color: COLOR_OPTIONS[1] },
  { id: "pessoal", name: "Pessoal", color: COLOR_OPTIONS[2] },
  { id: "familia", name: "Família", color: COLOR_OPTIONS[3] },
  { id: "saude", name: "Saúde", color: COLOR_OPTIONS[4] },
];
