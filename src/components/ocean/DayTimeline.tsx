"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CloudMoon,
  CloudSun,
  Copy,
  Moon,
  Plus,
  Sun,
  Sunrise,
  Sunset,
  X,
} from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import {
  DAY_PERIODS,
  DEFAULT_DURATION_MINUTES,
  EVENT_SIGNALS,
  PERIOD_HEADER_PX,
  PX_PER_HOUR,
} from "@/lib/ocean/constants";
import {
  addDaysISO,
  formatLongDate,
  minutesToTimeLabel,
  nowMinutes,
  todayISO,
} from "@/lib/ocean/dates";
import { getDragTaskId } from "@/lib/ocean/drag";
import {
  blockHeightPx,
  clientYToMinutes,
  minutesToPx,
  periodBlockHeight,
  periodHeaderTop,
  snapRange,
  timelineHours,
  totalTimelineHeight,
} from "@/lib/ocean/timeline";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { TASK_DRAG_MIME } from "@/lib/ocean/types";
import type { EventColor, ScheduleBlock } from "@/lib/ocean/types";
import SlotModal from "./SlotModal";

interface DayTimelineProps {
  date: string;
  onDateChange: (iso: string) => void;
  onOpenTask: (taskId: string) => void;
}

type LiveDrag =
  | { mode: "move"; id: string; start: number; duration: number }
  | { mode: "resize"; id: string; start: number; duration: number }
  | { mode: "ghost"; title: string; start: number; duration: number };

type SlotDraft = {
  id?: string;
  title: string;
  startMinutes: number;
  durationMinutes: number;
  color: EventColor;
};

export default function DayTimeline({ date, onDateChange, onOpenTask }: DayTimelineProps) {
  const { t, dateLocale } = useLanguage();
  const {
    getTask,
    getCategory,
    scheduleForDate,
    upsertSchedule,
    updateSchedule,
    removeSchedule,
    addFreeSlot,
    copyScheduleToDate,
    findPreviousBusyDate,
  } = useTasks();
  const gridRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{
    mode: "move" | "resize";
    id: string;
    origStart: number;
    origDuration: number;
  } | null>(null);
  const liveRef = useRef<LiveDrag | null>(null);
  const didDrag = useRef(false);
  const skipClick = useRef(false);
  const [live, setLiveState] = useState<LiveDrag | null>(null);
  const setLive = (value: LiveDrag | null) => {
    liveRef.current = value;
    setLiveState(value);
  };
  const [now, setNow] = useState(nowMinutes);
  const [slotDraft, setSlotDraft] = useState<SlotDraft | null>(null);
  const isToday = date === todayISO();
  const isPast = date < todayISO();
  const hours = timelineHours();
  const blocks = scheduleForDate(date);
  const previousBusy = blocks.length === 0 ? findPreviousBusyDate(date) : null;

  useEffect(() => {
    const t = window.setInterval(() => setNow(nowMinutes()), 30000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ptr = pointerRef.current;
      const grid = gridRef.current;
      if (!ptr || !grid) return;
      didDrag.current = true;
      const minutes = clientYToMinutes(e.clientY, grid);
      if (ptr.mode === "move") {
        const { start, duration } = snapRange(minutes, ptr.origDuration);
        setLive({ mode: "move", id: ptr.id, start, duration });
      } else {
        const { start, duration } = snapRange(ptr.origStart, minutes - ptr.origStart);
        setLive({ mode: "resize", id: ptr.id, start, duration });
      }
    };
    const onUp = () => {
      const ptr = pointerRef.current;
      const current = liveRef.current;
      if (ptr && current && (current.mode === "move" || current.mode === "resize") && current.id === ptr.id) {
        updateSchedule(ptr.id, { startMinutes: current.start, durationMinutes: current.duration });
      }
      pointerRef.current = null;
      setLive(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateSchedule]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const grid = gridRef.current;
    if (!grid) return;
    const { start, duration } = snapRange(clientYToMinutes(e.clientY, grid), DEFAULT_DURATION_MINUTES);
    const taskId = getDragTaskId();
    const task = taskId ? getTask(taskId) : undefined;
    setLive({
      mode: "ghost",
      title: task?.title || t("routine.dragTask"),
      start,
      duration,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const grid = gridRef.current;
    const taskId = e.dataTransfer.getData(TASK_DRAG_MIME) || e.dataTransfer.getData("text/plain");
    if (!grid || !taskId || !getTask(taskId)) {
      setLive(null);
      return;
    }
    const { start, duration } = snapRange(clientYToMinutes(e.clientY, grid), DEFAULT_DURATION_MINUTES);
    upsertSchedule(taskId, date, start, duration);
    setLive(null);
    skipClick.current = true;
  };

  const beginPointer = (e: React.PointerEvent, block: ScheduleBlock, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
    pointerRef.current = {
      mode,
      id: block.id,
      origStart: block.startMinutes,
      origDuration: block.durationMinutes,
    };
    setLive({ mode, id: block.id, start: block.startMinutes, duration: block.durationMinutes });
  };

  const blockView = (block: ScheduleBlock) => {
    if (live && (live.mode === "move" || live.mode === "resize") && live.id === block.id) {
      return { ...block, startMinutes: live.start, durationMinutes: live.duration };
    }
    return block;
  };

  const openNewSlot = (startMinutes: number, durationMinutes = DEFAULT_DURATION_MINUTES) => {
    const range = snapRange(startMinutes, durationMinutes);
    setSlotDraft({ title: "", startMinutes: range.start, durationMinutes: range.duration, color: "primary" });
  };

  return (
    <section className="flex flex-col min-h-0 min-w-0 h-[560px] xl:h-full">
      <header className="flex items-center justify-between gap-2 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <h2 className={`text-sm font-bold ${isPast ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-white/90"}`}>
            {t("routine.dailyRoutine")}
          </h2>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => openNewSlot(isToday ? nowMinutes() : 9 * 60, 30)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            aria-label={t("routine.newEvent")}
            title={t("routine.newEvent")}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onDateChange(addDaysISO(date, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            aria-label={t("routine.previousDay")}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onDateChange(addDaysISO(date, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
            aria-label={t("routine.nextDay")}
          >
            <ChevronRight size={16} />
          </button>
          <span
            className={`hidden sm:inline text-xs font-semibold px-1 max-w-[160px] truncate ${
              isPast ? "text-gray-400" : isToday ? "text-gray-800 dark:text-white/90" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {formatLongDate(date, dateLocale)}
          </span>
          {!isToday && (
            <button
              onClick={() => onDateChange(todayISO())}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 px-2 whitespace-nowrap"
            >
              {t("routine.goToToday")}
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </header>

      {previousBusy && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-dashed border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-white/[0.02]">
          <p className="text-xs text-gray-500 min-w-0 truncate">
            {t("routine.emptyDay", {
              date: previousBusy === addDaysISO(date, -1)
                ? t("routine.yesterday")
                : formatLongDate(previousBusy, dateLocale),
            })}
          </p>
          <button
            onClick={() => copyScheduleToDate(previousBusy, date)}
            className="inline-flex items-center gap-1.5 flex-shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-transparent dark:hover:bg-indigo-500/10"
          >
            <Copy size={12} />
            {t("routine.copy")}
          </button>
        </div>
      )}

      <div className="oq-scroll flex-1 overflow-y-auto">
        <div
          ref={gridRef}
          className="relative cursor-pointer"
          style={{ height: totalTimelineHeight() }}
          onDragOver={handleDragOver}
          onDragLeave={(e) => {
            const grid = gridRef.current;
            const related = e.relatedTarget as Node | null;
            if (grid && related && grid.contains(related)) return;
            if (liveRef.current?.mode === "ghost") setLive(null);
          }}
          onDrop={handleDrop}
          onClick={(e) => {
            if (skipClick.current) {
              skipClick.current = false;
              return;
            }
            if (didDrag.current) {
              didDrag.current = false;
              return;
            }
            const grid = gridRef.current;
            if (!grid) return;
            const y = e.clientY - grid.getBoundingClientRect().top;
            const onHeader = DAY_PERIODS.some((p) => {
              const top = periodHeaderTop(p.startHour);
              return y >= top && y < top + PERIOD_HEADER_PX;
            });
            if (onHeader) return;
            const start = clientYToMinutes(e.clientY, grid);
            openNewSlot(start, 30);
          }}
        >
          {DAY_PERIODS.map((period) => (
            <div
              key={period.id}
              className={`absolute z-0 pointer-events-none rounded-xl border border-dashed border-gray-200/90 dark:border-gray-700 ${period.tint} ${
                isPast ? "opacity-60" : ""
              }`}
              style={{
                top: periodHeaderTop(period.startHour) + 2,
                height: periodBlockHeight(period.startHour, period.endHour) - 4,
                left: 52,
                right: 12,
              }}
            >
              <span
                className={`absolute left-0 right-0 top-0 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 ${period.tint} rounded-t-xl`}
                style={{ height: PERIOD_HEADER_PX - 2 }}
              >
                <PeriodIcon id={period.id} />
                <span className={isPast ? "text-gray-300 dark:text-gray-600" : ""}>
                  {t(`routine.period.${period.id}` as TranslationKey)}
                </span>
              </span>
            </div>
          ))}

          {hours.map((hour) => (
            <div
              key={hour}
              className="oq-hour-row absolute left-0 right-0 pointer-events-none"
              style={{ top: minutesToPx(hour * 60), height: PX_PER_HOUR }}
            >
              <span
                className={`absolute left-2 top-0 text-[11px] font-medium w-10 pointer-events-none ${
                  isPast ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {String(hour).padStart(2, "0")}:00
              </span>
              <div className="absolute left-[52px] right-3 top-0 border-t border-gray-100 dark:border-gray-800" />
              <div
                className="absolute left-[52px] right-3 border-t border-dashed border-gray-100/80 dark:border-gray-800"
                style={{ top: PX_PER_HOUR / 2 }}
              />
            </div>
          ))}

          {isToday && now >= 0 && now < 24 * 60 && (
            <div
              className="absolute left-[52px] right-3 z-30 pointer-events-none"
              style={{ top: minutesToPx(now) }}
            >
              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-0.5 bg-rose-500" />
            </div>
          )}

          {live?.mode === "ghost" && (
            <div
              className="absolute left-[60px] right-4 z-10 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/80 px-2.5 py-1 pointer-events-none dark:bg-indigo-500/10"
              style={{
                top: minutesToPx(live.start),
                height: blockHeightPx(live.start, live.duration),
              }}
            >
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 truncate">{live.title}</p>
              <p className="text-[10px] text-indigo-500">
                {minutesToTimeLabel(live.start)} – {minutesToTimeLabel(live.start + live.duration)}
              </p>
            </div>
          )}

          {blocks.map((block) => {
            const view = blockView(block);
            if (block.taskId) {
              const task = getTask(block.taskId);
              if (!task || task.archivedAt) return null;
              return (
                <ScheduleCard
                  key={block.id}
                  block={view}
                  title={task.title}
                  subtitle={getCategory(task.categoryId)?.name}
                  accent={getCategory(task.categoryId)?.color.dot || "bg-indigo-500"}
                  kind="task"
                  onOpen={() => {
                    if (didDrag.current) {
                      didDrag.current = false;
                      return;
                    }
                    onOpenTask(task.id);
                  }}
                  onMovePointer={(e) => beginPointer(e, block, "move")}
                  onResizePointer={(e) => beginPointer(e, block, "resize")}
                  onRemove={() => removeSchedule(block.id)}
                />
              );
            }
            return (
              <ScheduleCard
                key={block.id}
                block={view}
                title={block.title || t("calendar.addEvent").replace(" +", "")}
                subtitle={t("routine.onlyThisDay")}
                accent={EVENT_SIGNALS[block.color || "primary"].bar}
                kind="free"
                onOpen={() => {
                  if (didDrag.current) {
                    didDrag.current = false;
                    return;
                  }
                  setSlotDraft({
                    id: block.id,
                    title: block.title,
                    startMinutes: block.startMinutes,
                    durationMinutes: block.durationMinutes,
                    color: block.color || "primary",
                  });
                }}
                onMovePointer={(e) => beginPointer(e, block, "move")}
                onResizePointer={(e) => beginPointer(e, block, "resize")}
                onRemove={() => removeSchedule(block.id)}
              />
            );
          })}
        </div>
      </div>

      <SlotModal
        key={slotDraft ? `${slotDraft.id ?? "new"}-${slotDraft.startMinutes}` : "closed"}
        isOpen={Boolean(slotDraft)}
        onClose={() => setSlotDraft(null)}
        dateLabel={formatLongDate(date, dateLocale)}
        startMinutes={slotDraft?.startMinutes ?? 0}
        durationMinutes={slotDraft?.durationMinutes ?? 30}
        title={slotDraft?.title ?? ""}
        color={slotDraft?.color ?? "primary"}
        isEdit={Boolean(slotDraft?.id)}
        onSave={(title, startMinutes, durationMinutes, color) => {
          if (slotDraft?.id) {
            updateSchedule(slotDraft.id, { title, startMinutes, durationMinutes, color });
          } else {
            addFreeSlot(date, startMinutes, durationMinutes, title, color);
          }
        }}
        onDelete={
          slotDraft?.id
            ? () => {
                removeSchedule(slotDraft.id!);
                setSlotDraft(null);
              }
            : undefined
        }
      />
    </section>
  );
}

function PeriodIcon({ id }: { id: string }) {
  const cls = "h-3 w-3";
  if (id === "madrugada") return <CloudMoon className={cls} />;
  if (id === "amanhecer") return <Sunrise className={cls} />;
  if (id === "manha") return <Sun className={cls} />;
  if (id === "tarde") return <CloudSun className={cls} />;
  if (id === "entardecer") return <Sunset className={cls} />;
  return <Moon className={cls} />;
}

function ScheduleCard({
  block,
  title,
  subtitle,
  accent,
  kind,
  onOpen,
  onMovePointer,
  onResizePointer,
  onRemove,
}: {
  block: ScheduleBlock;
  title: string;
  subtitle?: string;
  accent: string;
  kind: "task" | "free";
  onOpen: () => void;
  onMovePointer: (e: React.PointerEvent) => void;
  onResizePointer: (e: React.PointerEvent) => void;
  onRemove: () => void;
}) {
  const height = blockHeightPx(block.startMinutes, block.durationMinutes);
  return (
    <div
      className={`absolute left-[60px] right-4 z-10 group overflow-hidden rounded-lg shadow-theme-xs ${
        kind === "free"
          ? "border border-dashed border-gray-300 bg-white/90 dark:border-gray-600 dark:bg-gray-900/90"
          : "border border-indigo-100 bg-white dark:bg-gray-900 dark:border-gray-700"
      }`}
      style={{ top: minutesToPx(block.startMinutes), height }}
      onPointerDown={onMovePointer}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
      <div className="pl-2.5 pr-6 py-1 cursor-grab active:cursor-grabbing h-full">
        <p
          className="text-xs font-semibold text-black dark:text-white/90 truncate leading-tight"
        >
          {title}
        </p>
        {height >= 36 && (
          <p className="text-[10px] text-black dark:text-gray-300 truncate">
            {minutesToTimeLabel(block.startMinutes)} – {minutesToTimeLabel(block.startMinutes + block.durationMinutes)}
            {subtitle ? ` · ${subtitle}` : ""}
          </p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute right-1 top-1 p-0.5 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-rose-500"
        aria-label="Remover deste dia"
        title={kind === "task" ? "Remover só o horário (o card continua na lista)" : "Remover este espaço"}
      >
        <X size={12} />
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize" onPointerDown={onResizePointer} />
    </div>
  );
}
