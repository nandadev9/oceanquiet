"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/context/LanguageContext";
import { DURATION_OPTIONS, EVENT_SIGNALS } from "@/lib/ocean/constants";
import { clampDuration, clampScheduleStart, minutesToTimeLabel, timeLabelToMinutes } from "@/lib/ocean/dates";
import type { TranslationKey } from "@/i18n/translations";
import type { EventColor } from "@/lib/ocean/types";

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateLabel?: string;
  startMinutes: number;
  durationMinutes: number;
  title: string;
  color?: EventColor;
  isEdit?: boolean;
  onSave: (title: string, startMinutes: number, durationMinutes: number, color: EventColor) => void;
  onDelete?: () => void;
}

const signalLabelKeys: Record<EventColor, TranslationKey> = {
  primary: "slot.color.primary",
  danger: "slot.color.danger",
  success: "slot.color.success",
  warning: "slot.color.warning",
};

export default function SlotModal({
  isOpen,
  onClose,
  dateLabel,
  startMinutes,
  durationMinutes,
  title,
  color = "primary",
  isEdit,
  onSave,
  onDelete,
}: SlotModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(title);
  const [time, setTime] = useState(minutesToTimeLabel(startMinutes));
  const [duration, setDuration] = useState(durationMinutes);
  const [signal, setSignal] = useState<EventColor>(color);

  const save = () => {
    const start = clampScheduleStart(timeLabelToMinutes(time));
    onSave(
      name.trim() || t("calendar.addEvent").replace(" +", ""),
      start,
      clampDuration(start, duration),
      signal,
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6" showCloseButton={false}>
      <h3 className="text-lg font-extrabold text-gray-800 dark:text-white/90 mb-1">
        {isEdit ? t("slot.editEvent") : t("slot.newEvent")}
      </h3>
      {dateLabel ? (
        <p className="text-sm text-gray-500 mb-5 dark:text-gray-400">{dateLabel}</p>
      ) : (
        <div className="mb-5" />
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">{t("slot.title")}</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={t("slot.titlePlaceholder")}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2">{t("slot.color")}</label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(EVENT_SIGNALS) as EventColor[]).map((key) => {
              const meta = EVENT_SIGNALS[key];
              const selected = signal === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSignal(key)}
                  className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? "border-gray-800 dark:border-white" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.swatch} ${selected ? "opacity-100" : "opacity-80"}`} />
                  </span>
                  {t(signalLabelKeys[key])}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{t("slot.start")}</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{t("slot.duration")}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={save}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          {t("slot.save")}
        </button>
        {isEdit && onDelete && (
          <button onClick={onDelete} className="px-3 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700">
            {t("slot.remove")}
          </button>
        )}
        <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
          {t("slot.cancel")}
        </button>
      </div>
    </Modal>
  );
}
