"use client";

import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { useTasks } from "@/context/TasksContext";
import { EVENT_SIGNALS } from "@/lib/ocean/constants";
import { clampDuration, clampScheduleStart, dateFromMinutes, toISODate } from "@/lib/ocean/dates";
import type { EventColor } from "@/lib/ocean/types";
import SlotModal from "./SlotModal";
import TaskModal from "./TaskModal";

type SlotDraft = {
  id?: string;
  date: string;
  title: string;
  startMinutes: number;
  durationMinutes: number;
  color: EventColor;
};

function partsFromDate(d: Date) {
  return {
    date: toISODate(d),
    startMinutes: d.getHours() * 60 + d.getMinutes(),
  };
}

export default function OceanCalendar() {
  const { schedule, getTask, getCategory, addFreeSlot, updateSchedule, removeSchedule } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskDate, setTaskDate] = useState<string | undefined>(undefined);
  const [taskOpen, setTaskOpen] = useState(false);
  const [slotDraft, setSlotDraft] = useState<SlotDraft | null>(null);

  const events = useMemo(
    () =>
      schedule
        .map((block) => {
          const task = block.taskId ? getTask(block.taskId) : undefined;
          if (block.taskId && (!task || task.archivedAt)) return null;
          const title = task?.title || block.title || "Evento";
          const cat = task ? getCategory(task.categoryId) : undefined;
          const color: EventColor = block.color || "primary";
          return {
            id: block.id,
            title,
            start: dateFromMinutes(block.date, block.startMinutes),
            end: dateFromMinutes(block.date, block.startMinutes + block.durationMinutes),
            extendedProps: {
              kind: block.taskId ? "task" : "free",
              taskId: block.taskId,
              category: cat?.name,
              color,
            },
            classNames: [`oq-cal-${color}`],
          };
        })
        .filter(Boolean),
    [schedule, getTask, getCategory]
  );

  const persistTimes = (id: string, start: Date | null, end: Date | null) => {
    if (!start) return;
    const { date, startMinutes } = partsFromDate(start);
    const endDate = end ?? new Date(start.getTime() + 30 * 60000);
    const duration = Math.max(15, Math.round((endDate.getTime() - start.getTime()) / 60000));
    updateSchedule(id, {
      date,
      startMinutes: clampScheduleStart(startMinutes),
      durationMinutes: clampDuration(clampScheduleStart(startMinutes), duration),
    });
  };

  const onSelect = (info: DateSelectArg) => {
    const { date, startMinutes } = partsFromDate(info.start);
    const duration = Math.max(15, Math.round((info.end.getTime() - info.start.getTime()) / 60000));
    setSlotDraft({ date, title: "", startMinutes, durationMinutes: duration, color: "primary" });
    info.view.calendar.unselect();
  };

  const onEventClick = (info: EventClickArg) => {
    const kind = info.event.extendedProps.kind as "task" | "free";
    const linked = info.event.extendedProps.taskId as string | null;
    if (kind === "task" && linked) {
      setTaskId(linked);
      setTaskDate(info.event.start ? toISODate(info.event.start) : undefined);
      setTaskOpen(true);
      return;
    }
    const start = info.event.start;
    const end = info.event.end;
    if (!start) return;
    const { date, startMinutes } = partsFromDate(start);
    const duration = end ? Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)) : 30;
    setSlotDraft({
      id: info.event.id,
      date,
      title: info.event.title,
      startMinutes,
      durationMinutes: duration,
      color: (info.event.extendedProps.color as EventColor) || "primary",
    });
  };

  const onDrop = (info: EventDropArg) => persistTimes(info.event.id, info.event.start, info.event.end);
  const onResize = (info: EventResizeDoneArg) => persistTimes(info.event.id, info.event.start, info.event.end);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <style>{`
        .oq-calendar .fc.fc-media-screen { min-height: 0 !important; }
        .oq-calendar .fc-toolbar.fc-header-toolbar {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 16px 20px 12px;
        }
        .oq-calendar .fc-toolbar-title {
          font-size: 16px !important;
          font-weight: 800 !important;
          color: #1d2939 !important;
        }
        .oq-calendar .fc-button {
          background: #fff !important;
          border: 1px solid #e4e7ec !important;
          color: #475467 !important;
          border-radius: 8px !important;
          box-shadow: none !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          height: 36px !important;
          padding: 0 12px !important;
          text-transform: none !important;
          line-height: 1 !important;
        }
        .oq-calendar .fc-button:hover {
          background: #f9fafb !important;
          color: #344054 !important;
        }
        .oq-calendar .fc-button:disabled {
          opacity: 0.45 !important;
        }
        .oq-calendar .fc-button-primary:not(:disabled).fc-button-active,
        .oq-calendar .fc-button-primary:not(:disabled):active {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
          color: #fff !important;
        }
        .oq-calendar .fc-prev-button,
        .oq-calendar .fc-next-button {
          width: 36px !important;
          padding: 0 !important;
        }
        .oq-calendar .fc-addSlotButton-button {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
          color: #fff !important;
        }
        .oq-calendar .fc-addSlotButton-button:hover {
          background: #4338ca !important;
          border-color: #4338ca !important;
          color: #fff !important;
        }
        .oq-calendar .fc-header-toolbar .fc-toolbar-chunk:last-child {
          background: #f2f4f7;
          border-radius: 8px;
          padding: 3px;
          display: flex;
          gap: 2px;
        }
        .oq-calendar .fc-header-toolbar .fc-toolbar-chunk:last-child .fc-button {
          border: 0 !important;
          background: transparent !important;
          height: 30px !important;
          padding: 0 12px !important;
        }
        .oq-calendar .fc-header-toolbar .fc-toolbar-chunk:last-child .fc-button.fc-button-active {
          background: #fff !important;
          color: #1d2939 !important;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06) !important;
        }
        .oq-calendar .fc {
          font-family: inherit;
        }
        .oq-calendar .fc-timegrid-slot-label {
          vertical-align: top !important;
        }
        .oq-calendar .fc-direction-ltr .fc-timegrid-slot-label-frame {
          text-align: right;
          padding: 2px 8px 0 0;
        }
        .oq-calendar .fc-timegrid-slot-label-cushion,
        .oq-calendar .fc-timegrid-axis-cushion {
          font-family: inherit !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #667085 !important;
          line-height: 1.2 !important;
        }
        .oq-calendar .fc-timegrid-col.fc-day-today {
          background: #f9fafb !important;
        }
        .oq-calendar .fc-event,
        .oq-calendar .fc-event .fc-event-main,
        .oq-calendar .fc-event .fc-event-time,
        .oq-calendar .fc-event .fc-event-title {
          font-family: inherit !important;
          color: inherit !important;
        }
        .oq-calendar .fc-timegrid-event {
          border: 0 !important;
          box-shadow: none !important;
          border-radius: 6px !important;
        }
        .oq-calendar .oq-cal-primary { background: #e0e7ff !important; color: #312e81 !important; box-shadow: inset 3px 0 0 #4f46e5 !important; }
        .oq-calendar .oq-cal-danger { background: #fee4e2 !important; color: #7a271a !important; box-shadow: inset 3px 0 0 #f04438 !important; }
        .oq-calendar .oq-cal-success { background: #d1fadf !important; color: #054f31 !important; box-shadow: inset 3px 0 0 #12b76a !important; }
        .oq-calendar .oq-cal-warning { background: #fef0c7 !important; color: #7a2e0e !important; box-shadow: inset 3px 0 0 #f79009 !important; }
      `}</style>
      <div className="oq-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={ptBrLocale}
          initialView="timeGridDay"
          headerToolbar={{
            left: "prev,next today addSlotButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
          customButtons={{
            addSlotButton: {
              text: "Evento +",
              click: () => {
                const api = calendarRef.current?.getApi();
                const cursor = api?.getDate() ?? new Date();
                setSlotDraft({
                  date: toISODate(cursor),
                  title: "",
                  startMinutes: 9 * 60,
                  durationMinutes: 30,
                  color: "primary",
                });
              },
            },
          }}
          events={events as { id: string; title: string }[]}
          selectable
          selectMirror
          editable
          nowIndicator
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:15:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          height="auto"
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          slotLabelInterval="00:30:00"
          eventDidMount={(info) => {
            const key = (info.event.extendedProps.color as EventColor) || "primary";
            const meta = EVENT_SIGNALS[key];
            info.el.style.background = meta.bg;
            info.el.style.color = meta.text;
            info.el.style.border = "0";
            info.el.style.boxShadow = `inset 3px 0 0 ${meta.border}`;
          }}
          select={onSelect}
          eventClick={onEventClick}
          eventDrop={onDrop}
          eventResize={onResize}
          eventOverlap
        />
      </div>

      <TaskModal
        isOpen={taskOpen}
        onClose={() => {
          setTaskOpen(false);
          setTaskId(null);
        }}
        taskId={taskId}
        scheduleDate={taskDate}
      />

      <SlotModal
        key={slotDraft ? `${slotDraft.id ?? "new"}-${slotDraft.date}-${slotDraft.startMinutes}` : "closed"}
        isOpen={Boolean(slotDraft)}
        onClose={() => setSlotDraft(null)}
        startMinutes={slotDraft?.startMinutes ?? 0}
        durationMinutes={slotDraft?.durationMinutes ?? 30}
        title={slotDraft?.title ?? ""}
        color={slotDraft?.color ?? "primary"}
        isEdit={Boolean(slotDraft?.id)}
        onSave={(title, startMinutes, durationMinutes, color) => {
          if (!slotDraft) return;
          if (slotDraft.id) {
            updateSchedule(slotDraft.id, { title, startMinutes, durationMinutes, date: slotDraft.date, color });
          } else {
            addFreeSlot(slotDraft.date, startMinutes, durationMinutes, title, color);
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
    </div>
  );
}
