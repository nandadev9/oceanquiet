"use client";

import { useState } from "react";
import { ChevronRight, Home, RotateCcw, Trash2 } from "lucide-react";
import { OceanPage } from "@/components/ocean/OceanStyles";
import StatusBadge from "@/components/ocean/StatusBadge";
import TaskModal from "@/components/ocean/TaskModal";
import { useTasks } from "@/context/TasksContext";
import { BOARD_LABELS } from "@/lib/ocean/constants";
import { daysUntilPurge, formatDueLabel } from "@/lib/ocean/dates";

export default function LixeiraPage() {
  const { ready, trashTasks, getCategory, restoreTask, deleteForever, emptyTrash } = useTasks();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEmpty = () => {
    if (trashTasks.length === 0) return;
    const ok = window.confirm("Esvaziar a lixeira? Os cards serão apagados para sempre.");
    if (ok) emptyTrash();
  };

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
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight dark:text-white/90">Lixeira</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={12} />
          <span>Home</span>
          <ChevronRight size={12} />
          <span className="text-gray-500 font-semibold dark:text-gray-300">Lixeira</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cards arquivados ficam aqui por <span className="font-semibold text-gray-700 dark:text-gray-300">30 dias</span>.
          Depois somem de vez. Restaurar devolve o card completo.
        </p>
        <button
          onClick={handleEmpty}
          disabled={trashTasks.length === 0}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-500/30 dark:hover:bg-rose-500/10"
        >
          <Trash2 size={15} />
          Esvaziar
        </button>
      </div>

      {trashTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-white/5">
            <Trash2 size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Lixeira vazia</p>
          <p className="text-xs text-gray-400 mt-1">Arquivar um card em Tarefas ou na Rotina traz ele para cá.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="oq-scroll divide-y divide-gray-100 dark:divide-gray-800">
            {trashTasks.map((task) => {
              const cat = getCategory(task.categoryId);
              const days = task.archivedAt ? daysUntilPurge(task.archivedAt) : 0;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-white/[0.03]"
                >
                  <button
                    onClick={() => {
                      setOpenTaskId(task.id);
                      setModalOpen(true);
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-semibold text-gray-700 truncate dark:text-gray-200">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {cat && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.color.badge}`}>
                          {cat.name}
                        </span>
                      )}
                      <StatusBadge status={task.status} />
                      <span className="text-[11px] text-gray-400">{BOARD_LABELS[task.board]}</span>
                      {task.dueDate && (
                        <span className="text-[11px] text-gray-400">{formatDueLabel(task.dueDate)}</span>
                      )}
                      <span className={`text-[11px] font-semibold ${days <= 5 ? "text-rose-500" : "text-gray-400"}`}>
                        {days === 0 ? "Apaga hoje" : `${days} dia(s) restantes`}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                    title="Restaurar"
                  >
                    <RotateCcw size={13} /> Restaurar
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Excluir para sempre? Isso não pode ser desfeito.")) {
                        deleteForever(task.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    aria-label="Excluir para sempre"
                    title="Excluir para sempre"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setOpenTaskId(null);
        }}
        taskId={openTaskId}
      />
    </OceanPage>
  );
}
