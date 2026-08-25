"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import { TASK_DRAG_MIME, type TaskBoard } from "@/lib/ocean/types";
import TaskCard from "./TaskCard";

interface PriorityColumnProps {
  board: Exclude<TaskBoard, "inbox">;
  title: string;
  emptyText?: string;
  onOpenTask: (id: string) => void;
}

export default function PriorityColumn({
  board,
  title,
  emptyText,
  onOpenTask,
}: PriorityColumnProps) {
  const { t } = useLanguage();
  const { tasksByBoard, setBoard } = useTasks();
  const tasks = tasksByBoard(board);
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData(TASK_DRAG_MIME) || e.dataTransfer.getData("text/plain");
    if (id) setBoard(id, board);
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col min-h-[280px] xl:min-h-0 h-[360px] xl:h-full border-t xl:border-t-0 xl:border-l border-gray-100 dark:border-gray-800 ${
        isOver ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
      }`}
    >
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white/90 truncate">{title}</h2>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-2 py-0.5 flex-shrink-0">
          {tasks.length}
        </span>
      </header>
      <div className="oq-scroll flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[120px]">
        {tasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center px-3 py-8 leading-relaxed">
            {emptyText ?? t("routine.dropTaskHere")}
          </p>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} variant="priority" onOpen={onOpenTask} />
        ))}
      </div>
    </section>
  );
}
