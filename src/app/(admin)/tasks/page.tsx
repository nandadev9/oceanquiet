"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Home,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from "lucide-react";
import OceanAssistant from "@/components/ocean/OceanAssistant";
import { OceanPage } from "@/components/ocean/OceanStyles";
import TaskCard from "@/components/ocean/TaskCard";
import TaskModal from "@/components/ocean/TaskModal";
import { useTasks } from "@/context/TasksContext";
import { CAT_NAME_LIMIT, STATUS_META } from "@/lib/ocean/constants";
import type { Category, TaskStatus } from "@/lib/ocean/types";

export default function TarefasPage() {
  const {
    ready,
    categories,
    tasksByBoard,
    addTask,
    addCategory,
    renameCategory,
    removeCategory,
    updateTask,
  } = useTasks();

  const inboxTasks = tasksByBoard("inbox");

  const [activeFilter, setActiveFilter] = useState("all");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dueFilter, setDueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuFor(null);
      setShowFilterMenu(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const filteredTasks = inboxTasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dueFilter === "with" && !t.dueDate) return false;
    if (dueFilter === "without" && t.dueDate) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (favoritesOnly && !t.favorite) return false;
    return true;
  });

  const tasksForCategory = (catId: string) => filteredTasks.filter((t) => t.categoryId === catId);
  const filtersActive = dueFilter !== "all" || statusFilter !== "all" || favoritesOnly || Boolean(searchQuery);

  const handleDragOver = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    setDragOverCol(catId);
  };
  const handleDrop = (catId: string) => {
    if (draggedTaskId) updateTask(draggedTaskId, { categoryId: catId });
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const startAddTask = (catId: string) => {
    setAddingTaskFor(catId);
    setNewTaskTitle("");
    setTimeout(() => newTaskInputRef.current?.focus(), 0);
  };
  const commitAddTask = (catId: string) => {
    const title = newTaskTitle.trim();
    if (title) addTask({ title, categoryId: catId, board: "inbox" });
    setAddingTaskFor(null);
    setNewTaskTitle("");
  };

  const openCreate = () => {
    setOpenTaskId(null);
    setModalOpen(true);
  };
  const openTask = (id: string) => {
    setOpenTaskId(id);
    setModalOpen(true);
  };

  const handleRemoveCategory = (catId: string) => {
    const count = tasksForCategory(catId).length;
    if (count > 0) {
      const ok = window.confirm(
        `Essa categoria tem ${count} tarefa(s). Excluir a categoria envia essas tarefas para a lixeira. Continuar?`
      );
      if (!ok) return;
    }
    removeCategory(catId);
    if (activeFilter === catId) setActiveFilter("all");
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setOpenMenuFor(null);
  };
  const commitEditCategory = (catId: string) => {
    renameCategory(catId, editingCatName);
    setEditingCatId(null);
  };
  const commitAddCategory = () => {
    addCategory(newCatName);
    setAddingCategory(false);
    setNewCatName("");
  };

  const renderColumn = (cat: Category) => {
    const catTasks = tasksForCategory(cat.id);
    const isOver = dragOverCol === cat.id;
    return (
      <div
        key={cat.id}
        onDragOver={(e) => handleDragOver(e, cat.id)}
        onDrop={() => handleDrop(cat.id)}
        onDragLeave={() => setDragOverCol((c) => (c === cat.id ? null : c))}
        className={`rounded-2xl border bg-white transition-colors flex flex-col dark:bg-white/[0.03] ${
          isOver ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200 dark:border-gray-800"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${cat.color.dot}`} />
            <h3 className="text-sm font-bold text-gray-800 truncate dark:text-white/90" title={cat.name}>
              {cat.name}
            </h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-1.5 flex-shrink-0">
              {catTasks.length}
            </span>
          </div>
          <ColumnMenu
            open={openMenuFor === cat.id}
            onToggle={() => setOpenMenuFor(openMenuFor === cat.id ? null : cat.id)}
            onRename={() => startEditCategory(cat)}
            onDelete={() => {
              setOpenMenuFor(null);
              handleRemoveCategory(cat.id);
            }}
          />
        </div>

        <div className="oq-scroll p-3 space-y-2.5 min-h-[80px] max-h-[420px] overflow-y-auto">
          {catTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showPrioritize
              onOpen={openTask}
              onDragStart={(id) => setDraggedTaskId(id)}
              onDragEnd={() => {
                setDraggedTaskId(null);
                setDragOverCol(null);
              }}
            />
          ))}

          {addingTaskFor === cat.id ? (
            <QuickAdd
              inputRef={newTaskInputRef}
              value={newTaskTitle}
              onChange={setNewTaskTitle}
              onCommit={() => commitAddTask(cat.id)}
              onCancel={() => setAddingTaskFor(null)}
            />
          ) : (
            <button
              onClick={() => startAddTask(cat.id)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2.5 text-xs font-medium text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors dark:border-gray-700"
            >
              <Plus size={13} /> Nova tarefa
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAddCategoryCard = () => (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 flex items-center justify-center min-h-[120px] p-3 dark:border-gray-700 dark:bg-white/[0.02]">
      {addingCategory ? (
        <div className="w-full">
          <input
            autoFocus
            value={newCatName}
            maxLength={CAT_NAME_LIMIT}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAddCategory();
              if (e.key === "Escape") setAddingCategory(false);
            }}
            placeholder="Nome da categoria"
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 mb-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={commitAddCategory}
              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-2.5 py-1.5"
            >
              <Check size={12} /> Criar
            </button>
            <button onClick={() => setAddingCategory(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCategory(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Plus size={16} /> Categoria
        </button>
      )}
    </div>
  );

  const renderCategoryList = (cat: Category) => {
    const catTasks = tasksForCategory(cat.id);
    return (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`h-3 w-3 rounded-full flex-shrink-0 ${cat.color.dot}`} />
            {editingCatId === cat.id ? (
              <input
                autoFocus
                value={editingCatName}
                maxLength={CAT_NAME_LIMIT}
                onChange={(e) => setEditingCatName(e.target.value)}
                onBlur={() => commitEditCategory(cat.id)}
                onKeyDown={(e) => e.key === "Enter" && commitEditCategory(cat.id)}
                className="text-base font-bold text-gray-800 bg-transparent border-b border-indigo-400 outline-none dark:text-white/90"
              />
            ) : (
              <h2 className="text-base font-bold text-gray-800 truncate dark:text-white/90">{cat.name}</h2>
            )}
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-white/5 rounded-full px-2 py-0.5 flex-shrink-0">
              {catTasks.length} tarefa(s)
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => startAddTask(cat.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Plus size={13} /> Tarefa
            </button>
            <ColumnMenu
              open={openMenuFor === cat.id}
              onToggle={() => setOpenMenuFor(openMenuFor === cat.id ? null : cat.id)}
              onRename={() => startEditCategory(cat)}
              onDelete={() => {
                setOpenMenuFor(null);
                handleRemoveCategory(cat.id);
              }}
            />
          </div>
        </div>

        <div className="oq-scroll divide-y divide-gray-100 dark:divide-gray-800 max-h-[560px] overflow-y-auto">
          {catTasks.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Nenhuma tarefa aqui ainda.</p>}
          {catTasks.map((task) => (
            <TaskCard key={task.id} task={task} variant="list" showPrioritize onOpen={openTask} />
          ))}
          {addingTaskFor === cat.id && (
            <div className="flex items-center gap-3 px-5 py-3.5">
              <input
                ref={newTaskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAddTask(cat.id);
                  if (e.key === "Escape") setAddingTaskFor(null);
                }}
                placeholder="Título da tarefa"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400 dark:text-white/90"
              />
              <button onClick={() => commitAddTask(cat.id)} className="text-indigo-600 hover:text-indigo-700 flex-shrink-0" aria-label="Salvar">
                <Check size={16} />
              </button>
              <button onClick={() => setAddingTaskFor(null)} className="text-gray-300 hover:text-gray-500 flex-shrink-0" aria-label="Cancelar">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeCategory = activeFilter === "all" ? null : categories.find((c) => c.id === activeFilter);

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
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight dark:text-white/90">Tarefas</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={12} />
          <span>Home</span>
          <ChevronRight size={12} />
          <span className="text-gray-500 font-semibold dark:text-gray-300">Tarefas</span>
        </div>
      </div>
      <OceanAssistant>
        Aqui cabem todas as ideias. Você não precisa ver tudo nem fazer tudo agora. Capture primeiro, priorize depois.
      </OceanAssistant>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              activeFilter === "all" ? "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            Todas
            <span className="text-xs rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-500/15 dark:text-indigo-300">
              {filteredTasks.length}
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              title={cat.name}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors max-w-[160px] ${
                activeFilter === cat.id ? "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cat.color.dot}`} />
              <span className="truncate">{cat.name}</span>
              <span className="text-xs rounded-full px-1.5 py-0.5 bg-gray-100 text-gray-500 font-bold flex-shrink-0 dark:bg-white/10">
                {tasksForCategory(cat.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
              favoritesOnly
                ? "border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            }`}
            title="Só favoritos"
          >
            <Star size={15} fill={favoritesOnly ? "currentColor" : "none"} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterMenu((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                filtersActive
                  ? "border-indigo-300 text-indigo-600 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtrar
            </button>
            {showFilterMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-3 z-10 space-y-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 dark:bg-white/5 dark:border-gray-700">
                  <Search size={13} className="text-gray-400 flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por palavra-chave"
                    className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full dark:text-white/90"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Prazo</p>
                  {([["all", "Todas"], ["with", "Com prazo"], ["without", "Sem prazo"]] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 px-1 py-1 text-sm text-gray-600 cursor-pointer dark:text-gray-300">
                      <input
                        type="radio"
                        name="dueFilter"
                        checked={dueFilter === val}
                        onChange={() => setDueFilter(val)}
                        className="text-indigo-600 focus:ring-indigo-400"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Status</p>
                  <label className="flex items-center gap-2 px-1 py-1 text-sm text-gray-600 cursor-pointer dark:text-gray-300">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={statusFilter === "all"}
                      onChange={() => setStatusFilter("all")}
                      className="text-indigo-600 focus:ring-indigo-400"
                    />
                    Todas
                  </label>
                  {(Object.keys(STATUS_META) as TaskStatus[]).map((key) => (
                    <label key={key} className="flex items-center gap-2 px-1 py-1 text-sm text-gray-600 cursor-pointer dark:text-gray-300">
                      <input
                        type="radio"
                        name="statusFilter"
                        checked={statusFilter === key}
                        onChange={() => setStatusFilter(key)}
                        className="text-indigo-600 focus:ring-indigo-400"
                      />
                      {STATUS_META[key].label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Nova tarefa
          </button>
        </div>
      </div>

      {activeFilter === "all" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(renderColumn)}
          {renderAddCategoryCard()}
        </div>
      ) : (
        <div className="w-full">{activeCategory && renderCategoryList(activeCategory)}</div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setOpenTaskId(null);
        }}
        taskId={openTaskId}
        defaultBoard="inbox"
        defaultCategoryId={activeFilter !== "all" ? activeFilter : categories[0]?.id}
      />
    </OceanPage>
  );
}

function ColumnMenu({
  open,
  onToggle,
  onRename,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5"
        aria-label="Mais opções"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-10 dark:border-gray-700 dark:bg-gray-900"
        >
          <button onClick={onRename} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
            <Pencil size={13} /> Renomear
          </button>
          <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            <Trash2 size={13} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function QuickAdd({
  inputRef,
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-indigo-300 bg-white p-2.5 dark:bg-gray-900">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Título da tarefa"
        className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400 dark:text-white/90"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onCommit}
          className="inline-flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-2.5 py-1.5"
        >
          <Check size={12} /> Salvar
        </button>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">
          Cancelar
        </button>
      </div>
    </div>
  );
}
