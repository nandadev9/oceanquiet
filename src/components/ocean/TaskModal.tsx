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
import { useTasks } from "@/context/TasksContext";
import { BOARD_LABELS, DURATION_OPTIONS, STATUS_META } from "@/lib/ocean/constants";
import {
  clampDuration,
  clampScheduleStart,
  minutesToTimeLabel,
  timeLabelToMinutes,
  uid,
} from "@/lib/ocean/dates";
import type { Subtask, TaskBoard, TaskStatus } from "@/lib/ocean/types";

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
            {isEdit ? "Editar tarefa" : "Nova tarefa"}
          </h3>
          <div className="flex items-center gap-1">
            {task && (
              <button
                onClick={() => toggleFavorite(task.id)}
                className={`p-1.5 rounded-lg ${task.favorite ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                aria-label="Favoritar"
                title="Favoritar"
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
            ? "Esta tarefa está na lixeira. Restaure para voltar aos boards."
            : "Organize seu dia. Adicione os detalhes que fizerem sentido."}
        </p>
      </div>

      <div className="px-5 space-y-4 max-h-[60vh] overflow-y-auto oq-scroll">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Título</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que você precisa fazer?"
            disabled={isArchived}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Data</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {(Object.keys(STATUS_META) as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {STATUS_META[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Categoria</label>
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
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Onde está</label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value as TaskBoard)}
              disabled={isArchived}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {(Object.keys(BOARD_LABELS) as TaskBoard[]).map((key) => (
                <option key={key} value={key}>
                  {BOARD_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && scheduleDate && (
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 mb-2">Horário na rotina deste dia</p>
            {startTime || slot ? (
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[11px] text-gray-400 mb-1">Início</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isArchived}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-[11px] text-gray-400 mb-1">Duração</label>
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
                    Tirar do dia
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Arraste o card para um horário na rotina do dia. Ele continua na lista. O horário é só um ponteiro.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Descrição</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
            <div className="flex items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-1.5 py-1 dark:border-gray-800 dark:bg-white/[0.03]">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Negrito">
                <Bold size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Itálico">
                <Italic size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Sublinhado">
                <Underline size={14} />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1 dark:bg-gray-700" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Lista">
                <List size={14} />
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Tabela">
                <TableIcon size={14} />
              </button>
            </div>
            <div
              ref={descRef}
              contentEditable={!isArchived}
              suppressContentEditableWarning
              data-placeholder="Escreva os detalhes da tarefa..."
              className="oq-rte min-h-[100px] max-h-[180px] overflow-y-auto p-3 text-sm text-gray-700 outline-none dark:text-gray-300"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-500">Subtarefas</label>
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
                placeholder="Adicionar subtarefa"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <button type="button" onClick={addSubtask} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5 flex-shrink-0">
                <Plus size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="pb-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5">Anexos</label>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-400 cursor-not-allowed dark:border-gray-700"
            title="Upload em breve"
          >
            <Paperclip size={15} />
            Anexar arquivo <span className="text-xs">(máx. 5MB, em breve)</span>
          </button>
          {!isArchived && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2 dark:border-gray-700">
                <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  placeholder="Colar um link"
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
              Restaurar
            </button>
            <button
              onClick={() => {
                if (window.confirm("Excluir para sempre? Isso não pode ser desfeito.")) {
                  deleteForever(task.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </>
        ) : (
          <>
            <button
              onClick={save}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              {isEdit ? "Salvar alterações" : "Salvar tarefa"}
            </button>
            {task && (
              <button
                onClick={() => {
                  archiveTask(task.id);
                  onClose();
                }}
                className="p-2.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                aria-label="Arquivar"
                title="Arquivar"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
