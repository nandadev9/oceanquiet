"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Circle,
  CircleCheck,
  Italic,
  Link2,
  List,
  Paperclip,
  Plus,
  Star,
  Table as TableIcon,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/context/LanguageContext";
import { useTasks } from "@/context/TasksContext";
import type { Locale } from "@/i18n/translations";
import { DURATION_OPTIONS } from "@/lib/ocean/constants";
import {
  clampDuration,
  clampScheduleStart,
  minutesToTimeLabel,
  timeLabelToMinutes,
  uid,
} from "@/lib/ocean/dates";
import type { Subtask, TaskBoard, TaskStatus } from "@/lib/ocean/types";

const TASK_MODAL_COPY: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    editTask: "Editar tarefa", newTask: "Nova tarefa", favorite: "Favoritar", archivedDescription: "Esta tarefa está na lixeira. Restaure para voltar aos boards.", description: "Organize seu dia. Adicione os detalhes que fizerem sentido.", title: "Título", titlePlaceholder: "O que você precisa fazer?", date: "Data", status: "Status", category: "Categoria", board: "Onde está", schedule: "Horário na rotina deste dia", start: "Início", duration: "Duração", removeFromDay: "Tirar do dia", scheduleDescription: "Arraste o card para um horário na rotina do dia. Ele continua na lista. O horário é só um ponteiro.", taskDescription: "Descrição", bold: "Negrito", italic: "Itálico", underline: "Sublinhado", list: "Lista", table: "Tabela", descriptionPlaceholder: "Escreva os detalhes da tarefa...", subtasks: "Subtarefas", addSubtask: "Adicionar subtarefa", attachments: "Anexos", uploadSoon: "Upload em breve", attachFile: "Anexar arquivo", maxSoon: "(máx. 5MB, em breve)", pasteLink: "Colar um link", restore: "Restaurar", deleteForever: "Excluir para sempre", deleteConfirmation: "Excluir para sempre? Isso não pode ser desfeito.", delete: "Excluir", saveChanges: "Salvar alterações", saveTask: "Salvar tarefa", archive: "Arquivar", cancel: "Cancelar", "status.todo": "A fazer", "status.doing": "Fazendo", "status.done": "Feito", "status.blocked": "Bloqueado", "board.inbox": "Tarefas", "board.daily": "Foco de hoje", "board.weekly": "Foco da semana",
  },
  en: {
    editTask: "Edit task", newTask: "New task", favorite: "Add to favorites", archivedDescription: "This task is in the trash. Restore it to return to the boards.", description: "Organize your day. Add the details that make sense.", title: "Title", titlePlaceholder: "What do you need to do?", date: "Date", status: "Status", category: "Category", board: "Location", schedule: "Time in this day’s routine", start: "Start", duration: "Duration", removeFromDay: "Remove from day", scheduleDescription: "Drag the card to a time in the day’s routine. It stays in the list; the time is only a pointer.", taskDescription: "Description", bold: "Bold", italic: "Italic", underline: "Underline", list: "List", table: "Table", descriptionPlaceholder: "Write task details...", subtasks: "Subtasks", addSubtask: "Add subtask", attachments: "Attachments", uploadSoon: "Upload coming soon", attachFile: "Attach file", maxSoon: "(max. 5MB, coming soon)", pasteLink: "Paste a link", restore: "Restore", deleteForever: "Delete forever", deleteConfirmation: "Delete forever? This cannot be undone.", delete: "Delete", saveChanges: "Save changes", saveTask: "Save task", archive: "Archive", cancel: "Cancel", "status.todo": "To do", "status.doing": "In progress", "status.done": "Done", "status.blocked": "Blocked", "board.inbox": "Tasks", "board.daily": "Today’s focus", "board.weekly": "Weekly focus",
  },
  es: {
    editTask: "Editar tarea", newTask: "Nueva tarea", favorite: "Agregar a favoritos", archivedDescription: "Esta tarea está en la papelera. Restáurala para volver a los paneles.", description: "Organiza tu día. Añade los detalles que tengan sentido.", title: "Título", titlePlaceholder: "¿Qué necesitas hacer?", date: "Fecha", status: "Estado", category: "Categoría", board: "Dónde está", schedule: "Horario en la rutina de este día", start: "Inicio", duration: "Duración", removeFromDay: "Quitar del día", scheduleDescription: "Arrastra la tarjeta a un horario de la rutina del día. Sigue en la lista; el horario es solo una referencia.", taskDescription: "Descripción", bold: "Negrita", italic: "Cursiva", underline: "Subrayado", list: "Lista", table: "Tabla", descriptionPlaceholder: "Escribe los detalles de la tarea...", subtasks: "Subtareas", addSubtask: "Agregar subtarea", attachments: "Adjuntos", uploadSoon: "Carga disponible pronto", attachFile: "Adjuntar archivo", maxSoon: "(máx. 5 MB, pronto)", pasteLink: "Pegar un enlace", restore: "Restaurar", deleteForever: "Eliminar para siempre", deleteConfirmation: "¿Eliminar para siempre? No se puede deshacer.", delete: "Eliminar", saveChanges: "Guardar cambios", saveTask: "Guardar tarea", archive: "Archivar", cancel: "Cancelar", "status.todo": "Por hacer", "status.doing": "En curso", "status.done": "Hecho", "status.blocked": "Bloqueado", "board.inbox": "Tareas", "board.daily": "Enfoque de hoy", "board.weekly": "Enfoque semanal",
  },
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  defaultBoard?: TaskBoard;
  defaultCategoryId?: string;
  scheduleDate?: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  taskId,
  defaultBoard = "inbox",
  defaultCategoryId,
  scheduleDate,
}: TaskModalProps) {
  const { locale } = useI18n();
  const copy = TASK_MODAL_COPY[locale];
  const {
    categories,
    getTask,
    addTask,
    updateTask,
    archiveTask,
    restoreTask,
    deleteForever,
    toggleFavorite,
    slotForTaskOnDate,
    upsertSchedule,
    updateSchedule,
    removeSchedule,
  } = useTasks();

  const task = taskId ? getTask(taskId) : undefined;
  const isEdit = Boolean(task);
  const isArchived = Boolean(task?.archivedAt);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [board, setBoard] = useState<TaskBoard>("inbox");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(60);
  const descRef = useRef<HTMLDivElement>(null);

  const slot = taskId && scheduleDate ? slotForTaskOnDate(taskId, scheduleDate) : undefined;

  useEffect(() => {
    if (!isOpen) return;
    const current = taskId ? getTask(taskId) : undefined;
    if (current) {
      setTitle(current.title);
      setCategoryId(current.categoryId);
      setDueDate(current.dueDate || "");
      setStatus(current.status);
      setBoard(current.board);
      setSubtasks(current.subtasks);
      setLinks(current.links);
      setNewSubtask("");
      setNewLink("");
      setTimeout(() => {
        if (descRef.current) descRef.current.innerHTML = current.description || "";
      }, 0);
    } else {
      setTitle("");
      setCategoryId(defaultCategoryId || categories[0]?.id || "");
      setDueDate("");
      setStatus("todo");
      setBoard(defaultBoard);
      setSubtasks([]);
      setLinks([]);
      setNewSubtask("");
      setNewLink("");
      setTimeout(() => {
        if (descRef.current) descRef.current.innerHTML = "";
      }, 0);
    }
    // Only rehydrate when opening a different card, not on every field change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, taskId, defaultBoard, defaultCategoryId]);

  useEffect(() => {
    if (!isOpen) return;
    if (slot) {
      setStartTime(minutesToTimeLabel(slot.startMinutes));
      setDuration(slot.durationMinutes);
    } else {
      setStartTime("");
      setDuration(60);
    }
  }, [isOpen, slot]);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    descRef.current?.focus();
  };
  const insertTable = () => {
    exec(
      "insertHTML",
      "<table><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table><br/>"
    );
  };

  const addSubtask = () => {
    const t = newSubtask.trim();
    if (!t) return;
    setSubtasks((prev) => [...prev, { id: uid("sub"), title: t, done: false }]);
    setNewSubtask("");
  };
  const toggleSub = (id: string) =>
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const removeSub = (id: string) => setSubtasks((prev) => prev.filter((s) => s.id !== id));
  const subtaskProgress = subtasks.length
    ? Math.round((subtasks.filter((s) => s.done).length / subtasks.length) * 100)
    : 0;

  const addLink = () => {
    const url = newLink.trim();
    if (!url) return;
    setLinks((prev) => [...prev, url]);
    setNewLink("");
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed || !categoryId) return;
    const description = descRef.current ? descRef.current.innerHTML : "";
    const payload = {
      title: trimmed,
      categoryId,
      dueDate: dueDate || null,
      status,
      board,
      description,
      subtasks,
      links,
    };
    if (task) {
      updateTask(task.id, payload);
      if (scheduleDate && startTime) {
        const start = clampScheduleStart(timeLabelToMinutes(startTime));
        const dur = clampDuration(start, duration);
        if (slot) updateSchedule(slot.id, { startMinutes: start, durationMinutes: dur });
        else upsertSchedule(task.id, scheduleDate, start, dur);
      }
    } else {
      addTask({ ...payload, favorite: false });
    }
    onClose();
  };

  const removeFromDay = () => {
    if (slot) removeSchedule(slot.id);
    setStartTime("");
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-0" showCloseButton={false}>
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-extrabold text-gray-800 dark:text-white/90">
            {isEdit ? copy.editTask : copy.newTask}
          </h3>
          <div className="flex items-center gap-1">
            {task && (
              <button
                onClick={() => toggleFavorite(task.id)}
                className={`p-1.5 rounded-lg ${task.favorite ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                aria-label={copy.favorite}
                title={copy.favorite}
              >
                <Star size={18} fill={task.favorite ? "currentColor" : "none"} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-5 dark:text-gray-400">
          {isArchived
            ? copy.archivedDescription
            : copy.description}
        </p>
      </div>

      <div className="px-5 space-y-4 max-h-[60vh] overflow-y-auto oq-scroll">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.title}</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={copy.titlePlaceholder}
            disabled={isArchived}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.date}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {(["todo", "doing", "done", "blocked"] as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {copy[`status.${key}`]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.category}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.board}</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value as TaskBoard)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {(["inbox", "daily", "weekly"] as TaskBoard[]).map((key) => (
                <option key={key} value={key}>
                  {copy[`board.${key}`]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && scheduleDate && (
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 mb-2">{copy.schedule}</p>
            {startTime || slot ? (
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[11px] text-gray-400 mb-1">{copy.start}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isArchived}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[11px] text-gray-400 mb-1">{copy.duration}</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={isArchived}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {!isArchived && (
                  <button
                    type="button"
                    onClick={removeFromDay}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-2"
                  >
                    {copy.removeFromDay}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                {copy.scheduleDescription}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.taskDescription}</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
            <div className="flex items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-1.5 py-1 dark:border-gray-800 dark:bg-white/[0.03]">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label={copy.bold}>
                <Bold size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label={copy.italic}>
                <Italic size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label={copy.underline}>
                <Underline size={14} />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1 dark:bg-gray-700" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label={copy.list}>
                <List size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label={copy.table}>
                <TableIcon size={14} />
              </button>
            </div>
            <div
              ref={descRef}
              contentEditable={!isArchived}
              suppressContentEditableWarning
              data-placeholder={copy.descriptionPlaceholder}
              className="oq-rte min-h-[100px] max-h-[180px] overflow-y-auto p-3 text-sm text-gray-700 outline-none dark:text-gray-300"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-500">{copy.subtasks}</label>
            {subtasks.length > 0 && <span className="text-xs text-gray-400">{subtaskProgress}%</span>}
          </div>
          {subtasks.length > 0 && (
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2 dark:bg-gray-800">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${subtaskProgress}%` }} />
            </div>
          )}
          <div className="space-y-1.5 mb-2">
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <button type="button" onClick={() => toggleSub(s.id)} className="flex-shrink-0 text-gray-300 hover:text-indigo-500" disabled={isArchived}>
                  {s.done ? <CircleCheck size={16} className="text-indigo-500" /> : <Circle size={16} />}
                </button>
                <span className={`flex-1 text-sm ${s.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>{s.title}</span>
                {!isArchived && (
                  <button type="button" onClick={() => removeSub(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 flex-shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isArchived && (
            <div className="flex items-center gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                placeholder={copy.addSubtask}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <button type="button" onClick={addSubtask} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5 flex-shrink-0">
                <Plus size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="pb-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5">{copy.attachments}</label>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-400 cursor-not-allowed dark:border-gray-700"
            title={copy.uploadSoon}
          >
            <Paperclip size={15} />
            {copy.attachFile} <span className="text-xs">{copy.maxSoon}</span>
          </button>
          {!isArchived && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2 dark:border-gray-700">
                <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  placeholder={copy.pasteLink}
                  className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0 dark:bg-transparent dark:text-white/90"
                />
              </div>
              <button type="button" onClick={addLink} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5 flex-shrink-0">
                <Plus size={15} />
              </button>
            </div>
          )}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {links.map((link, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-full pl-2.5 pr-1 py-1 text-gray-600 max-w-[220px] dark:bg-white/5 dark:border-gray-700 dark:text-gray-300">
                  <span className="truncate">{link}</span>
                  {!isArchived && (
                    <button type="button" onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-rose-500 flex-shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 p-5 mt-2 border-t border-gray-100 dark:border-gray-800">
        {isArchived && task ? (
          <>
            <button
              onClick={() => {
                restoreTask(task.id);
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              {copy.restore}
            </button>
            <button
              onClick={() => {
                if (window.confirm(copy.deleteConfirmation)) {
                  deleteForever(task.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              <Trash2 size={14} /> {copy.delete}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={save}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              {isEdit ? copy.saveChanges : copy.saveTask}
            </button>
            {task && (
              <button
                onClick={() => {
                  archiveTask(task.id);
                  onClose();
                }}
                className="p-2.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                aria-label={copy.archive}
                title={copy.archive}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
              {copy.cancel}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
