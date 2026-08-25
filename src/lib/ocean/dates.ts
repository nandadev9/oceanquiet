import { HOUR_END, HOUR_START, SNAP_MINUTES } from "./constants";
import { TRASH_RETENTION_DAYS } from "./types";

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDueLabel(iso: string | null): string | null {
  if (!iso) return null;
  const d = parseISODate(iso);
  const today = parseISODate(todayISO());
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatLongDate(iso: string, locale = "pt-BR"): string {
  const d = parseISODate(iso);
  const s = d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function minutesToTimeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeLabelToMinutes(label: string): number {
  const [h, m] = label.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function snapMinutes(min: number): number {
  return Math.round(min / SNAP_MINUTES) * SNAP_MINUTES;
}

export function clampScheduleStart(minutes: number): number {
  const minBound = HOUR_START * 60;
  const maxBound = HOUR_END * 60 - SNAP_MINUTES;
  return Math.min(Math.max(snapMinutes(minutes), minBound), maxBound);
}

export function clampDuration(startMinutes: number, duration: number): number {
  const endLimit = HOUR_END * 60;
  return Math.max(SNAP_MINUTES, Math.min(duration, endLimit - startMinutes));
}

export function daysUntilPurge(archivedAt: string): number {
  const expires = new Date(archivedAt).getTime() + TRASH_RETENTION_DAYS * 86400000;
  return Math.max(0, Math.ceil((expires - Date.now()) / 86400000));
}

export function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export function dateFromMinutes(isoDate: string, minutes: number): Date {
  const d = parseISODate(isoDate);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}
