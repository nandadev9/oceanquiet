"use client";

import { ChevronRight, Home } from "lucide-react";
import OceanCalendar from "@/components/ocean/OceanCalendar";
import { OceanPage } from "@/components/ocean/OceanStyles";
import { useTasks } from "@/context/TasksContext";

export default function CalendarioPage() {
  const { ready } = useTasks();

  if (!ready) {
    return (
      <OceanPage>
        <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" />
      </OceanPage>
    );
  }

  return (
    <OceanPage>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight dark:text-white/90">Calendário</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={12} />
          <span>Home</span>
          <ChevronRight size={12} />
          <span className="text-gray-500 font-semibold dark:text-gray-300">Calendário</span>
        </div>
      </div>
      <OceanCalendar />
    </OceanPage>
  );
}
