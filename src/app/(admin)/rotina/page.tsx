"use client";

import { useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import DayTimeline from "@/components/ocean/DayTimeline";
import OceanAssistant from "@/components/ocean/OceanAssistant";
import { OceanPage } from "@/components/ocean/OceanStyles";
import PriorityColumn from "@/components/ocean/PriorityColumn";
import TaskModal from "@/components/ocean/TaskModal";
import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { todayISO } from "@/lib/ocean/dates";

export default function RotinaPage() {
  const { t } = useLanguage();
  const { ready, tasksByBoard } = useTasks();
  const weeklyCount = tasksByBoard("weekly").length;
  const dailyCount = tasksByBoard("daily").length;
  const [date, setDate] = useState(todayISO);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openTask = (id: string) => {
    setOpenTaskId(id);
    setModalOpen(true);
  };

  if (!ready) {
    return (
      <OceanPage>
        <div className="h-[calc(100vh-180px)] min-h-[320px] rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
      </OceanPage>
    );
  }

  return (
    <OceanPage>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight dark:text-white/90">{t("routine.title")}</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={12} />
          <span>{t("navigation.home")}</span>
          <ChevronRight size={12} />
          <span className="text-gray-500 font-semibold dark:text-gray-300">{t("routine.title")}</span>
        </div>
      </div>

      <OceanAssistant>
        {weeklyCount === 0 && dailyCount === 0
          ? t("routine.assistantEmpty")
          : t("routine.assistant")}
      </OceanAssistant>

      <div className="xl:h-[calc(100vh-180px)] min-h-[560px] rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 xl:h-full xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <DayTimeline date={date} onDateChange={setDate} onOpenTask={openTask} />
          <PriorityColumn
            board="daily"
            title={t("routine.focusToday")}
            emptyText={t("routine.emptyFocusToday")}
            onOpenTask={openTask}
          />
          <PriorityColumn
            board="weekly"
            title={t("routine.focusWeekly")}
            emptyText={t("routine.emptyFocusWeekly")}
            onOpenTask={openTask}
          />
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setOpenTaskId(null);
        }}
        taskId={openTaskId}
        scheduleDate={date}
      />
    </OceanPage>
  );
}
