"use client";

import {
  ArrowUp,
  Calendar,
  Circle,
  CircleCheck,
  GripVertical,
  ListChecks,
  Paperclip,
  Star,
  Trash2,
} from "lucide-react";
import { useRef } from "react";
import { useI18n } from "@/context/LanguageContext";
import type { Locale } from "@/i18n/translations";
import { useTasks } from "@/context/TasksContext";
import { formatDueLabel } from "@/lib/ocean/dates";
import { setDragTaskId } from "@/lib/ocean/drag";
import { TASK_DRAG_MIME } from "@/lib/ocean/types";
import type { Task } from "@/lib/ocean/types";
import StatusBadge from "./StatusBadge";

type Variant = "board" | "list" | "priority";

const CARD_COPY: Record<Locale, {
  markDone: string;
  favorite: string;
  unfavorite: string;
  prioritize: string;
  prioritizeTitle: string;
  archive: string;
  archiveTitle: string;
}> = {
  "pt-BR": { markDone: "Marcar como feito", favorite: "Favoritar", unfavorite: "Desfavoritar", prioritize: "Priorizar: enviar para o foco da semana", prioritizeTitle: "Priorizar: vai para o Foco da semana", archive: "Arquivar", archiveTitle: "Arquivar (lixeira 30 dias)" },
  en: { markDone: "Mark as done", favorite: "Add to favorites", unfavorite: "Remove from favorites", prioritize: "Prioritize: send to weekly focus", prioritizeTitle: "Prioritize: moves to weekly focus", archive: "Archive", archiveTitle: "Archive (trash for 30 days)" },
  es: { markDone: "Marcar como hecha", favorite: "Agregar a favoritos", unfavorite: "Quitar de favoritos", prioritize: "Priorizar: enviar al enfoque semanal", prioritizeTitle: "Priorizar: va al enfoque semanal", archive: "Archivar", archiveTitle: "Archivar (papelera durante 30 días)" },
};

interface TaskCardProps {
  task: Task;
  variant?: Variant;
  draggable?: boolean;
  showPrioritize?: boolean;
  onOpen: (taskId: string) => void;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
}

export default function TaskCard({
  task,
  variant = "board",
  draggable = true,
  showPrioritize = false,
  onOpen,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const { getCategory, toggleDone, toggleFavorite, prioritize, archiveTask, setDraggingTaskId } = useTasks();
  const { dateLocale, locale } = useI18n();
  const copy = CARD_COPY[locale];
  const cat = getCategory(task.categoryId);
  const didDrag = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    didDrag.current = true;
    e.dataTransfer.setData(TASK_DRAG_MIME, task.id);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "copyMove";
    setDraggingTaskId(task.id);
    setDragTaskId(task.id);
    onDragStart?.(task.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragTaskId(null);
    onDragEnd?.();
  };

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    onOpen(task.id);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (variant === "list") {
    return (
      <div
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className={`group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-white/[0.03] cursor-pointer ${
          task.favorite ? "bg-amber-50/40 dark:bg-amber-500/5" : ""
        }`}
      >
        {draggable && <GripVertical size={15} className="text-gray-300 flex-shrink-0 cursor-grab" />}
        <button
          onClick={(e) => {
            stop(e);
            toggleDone(task.id);
          }}
          className="flex-shrink-0 text-gray-300 hover:text-indigo-500"
          aria-label={copy.markDone}
        >
          {task.status === "done" ? (
            <CircleCheck size={17} className="text-indigo-500" />
          ) : (
            <Circle size={17} />
          )}
        </button>
        <span
          className={`flex-1 min-w-0 text-sm truncate ${
            task.status === "done" ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {task.title}
        </span>
        <StatusBadge status={task.status} />
        {task.subtasks.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <ListChecks size={12} />
            {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
          </span>
        )}
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Calendar size={12} />
            {formatDueLabel(task.dueDate, dateLocale)}
          </span>
        )}
        <CardActions
          task={task}
          showPrioritize={showPrioritize}
          onToggleFavorite={() => toggleFavorite(task.id)}
          onPrioritize={() => prioritize(task.id)}
          onArchive={() => archiveTask(task.id)}
        />
      </div>
    );
  }

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`group rounded-xl border bg-white p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow dark:bg-white/[0.03] ${
        task.favorite
          ? "border-amber-200 dark:border-amber-500/30"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-start gap-2">
        {draggable && <GripVertical size={14} className="mt-0.5 text-gray-300 flex-shrink-0" />}
        <button
          onClick={(e) => {
            stop(e);
            toggleDone(task.id);
          }}
          className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-indigo-500"
          aria-label={copy.markDone}
        >
          {task.status === "done" ? (
            <CircleCheck size={16} className="text-indigo-500" />
          ) : (
            <Circle size={16} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-snug ${
              task.status === "done"
                ? "text-gray-400 line-through"
                : variant === "priority"
                  ? "text-black dark:text-white/90"
                  : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {cat && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.color.badge}`}>
                {cat.name}
              </span>
            )}
            <StatusBadge status={task.status} />
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Calendar size={11} />
                {formatDueLabel(task.dueDate, dateLocale)}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <ListChecks size={11} />
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
              </span>
            )}
            {task.links.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Paperclip size={11} />
                {task.links.length}
              </span>
            )}
          </div>
        </div>
        <CardActions
          task={task}
          showPrioritize={showPrioritize}
          onToggleFavorite={() => toggleFavorite(task.id)}
          onPrioritize={() => prioritize(task.id)}
          onArchive={() => archiveTask(task.id)}
        />
      </div>
    </div>
  );
}

function CardActions({
  task,
  showPrioritize,
  onToggleFavorite,
  onPrioritize,
  onArchive,
}: {
  task: Task;
  showPrioritize: boolean;
  onToggleFavorite: () => void;
  onPrioritize: () => void;
  onArchive: () => void;
}) {
  const { locale } = useI18n();
  const copy = CARD_COPY[locale];
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <button
        onClick={(e) => {
          stop(e);
          onToggleFavorite();
        }}
        className={`p-0.5 rounded ${
          task.favorite
            ? "text-amber-500"
            : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-500"
        } transition-opacity`}
        aria-label={task.favorite ? copy.unfavorite : copy.favorite}
        title={task.favorite ? copy.unfavorite : copy.favorite}
      >
        <Star size={14} fill={task.favorite ? "currentColor" : "none"} />
      </button>
      {showPrioritize && task.board === "inbox" && (
        <button
          onClick={(e) => {
            stop(e);
            onPrioritize();
          }}
          className="p-0.5 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity"
          aria-label={copy.prioritize}
          title={copy.prioritizeTitle}
        >
          <ArrowUp size={14} />
        </button>
      )}
      <button
        onClick={(e) => {
          stop(e);
          onArchive();
        }}
        className="p-0.5 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
        aria-label={copy.archive}
        title={copy.archiveTitle}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
