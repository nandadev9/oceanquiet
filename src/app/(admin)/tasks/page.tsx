"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ListChecks, Search, ChevronRight, Home,
  MoreHorizontal, Pencil, Trash2, SlidersHorizontal,
  Plus, X, Calendar, GripVertical, Check,
  Bold, Italic, Underline, List, Table as TableIcon, Link2, Paperclip, CircleCheck, Circle,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap');
.oq-font { font-family: 'Mulish', ui-sans-serif, system-ui, sans-serif; }
.oq-scroll::-webkit-scrollbar { width: 5px; }
.oq-scroll::-webkit-scrollbar-track { background: transparent; }
.oq-scroll::-webkit-scrollbar-thumb { background-color: #e4e7ec; border-radius: 9999px; }
.oq-scroll { scrollbar-width: thin; scrollbar-color: #e4e7ec transparent; }
.oq-rte table { border-collapse: collapse; margin: 6px 0; }
.oq-rte td { border: 1px solid #e4e7ec; padding: 4px 8px; min-width: 40px; }
.oq-rte ul { list-style: disc; padding-left: 1.25rem; }
.oq-rte:empty:before { content: attr(data-placeholder); color: #98a2b3; }`;

const CAT_NAME_LIMIT = 15;

const COLOR_OPTIONS = [
  { name: "violet", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  { name: "indigo", dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700" },
  { name: "emerald", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  { name: "amber", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
  { name: "rose", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700" },
  { name: "sky", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700" },
];

const initialCategories = [
  { id: "estudos", name: "Estudos", color: COLOR_OPTIONS[0] },
  { id: "trabalho", name: "Trabalho", color: COLOR_OPTIONS[1] },
  { id: "pessoal", name: "Pessoal", color: COLOR_OPTIONS[2] },
  { id: "familia", name: "Família", color: COLOR_OPTIONS[3] },
  { id: "saude", name: "Saúde", color: COLOR_OPTIONS[4] },
];

const initialTasks = [
  { id: "t1", title: "Revisar capítulo 3 do curso", categoryId: "estudos", date: "Amanhã", completed: false, subtasks: [], links: [] },
  { id: "t2", title: "Fazer resumo da aula gravada", categoryId: "estudos", date: null, completed: false, subtasks: [], links: [] },
  { id: "t3", title: "Responder e-mails pendentes", categoryId: "trabalho", date: "Hoje", completed: false, subtasks: [], links: [] },
  { id: "t4", title: "Preparar apresentação do projeto", categoryId: "trabalho", date: "Sex, 21", completed: false, subtasks: [{ id: "s1", title: "Reunir dados", done: true }, { id: "s2", title: "Montar slides", done: false }], links: [] },
  { id: "t5", title: "Organizar gaveta de documentos", categoryId: "pessoal", date: null, completed: true, subtasks: [], links: [] },
  { id: "t6", title: "Ligar para a vó", categoryId: "familia", date: "Hoje", completed: false, subtasks: [], links: [] },
  { id: "t7", title: "Consulta odontológica", categoryId: "saude", date: "Qui, 20", completed: false, subtasks: [], links: [] },
  { id: "t8", title: "Beber mais água durante o dia", categoryId: "saude", date: null, completed: false, subtasks: [], links: [] },
];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function TarefasPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [tasks, setTasks] = useState(initialTasks);
  const [activeFilter, setActiveFilter] = useState("all");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [addingTaskFor, setAddingTaskFor] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dueFilter, setDueFilter] = useState("all"); // all | with | without
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | done
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const newTaskInputRef = useRef(null);

  // --- New task modal state ---
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalCategoryId, setModalCategoryId] = useState(initialCategories[0]?.id || "");
  const [modalDueDate, setModalDueDate] = useState("");
  const [modalCompleted, setModalCompleted] = useState(false);
  const [modalSubtasks, setModalSubtasks] = useState([]);
  const [modalNewSubtask, setModalNewSubtask] = useState("");
  const [modalLinks, setModalLinks] = useState([]);
  const [modalNewLink, setModalNewLink] = useState("");
  const descRef = useRef(null);

  useEffect(() => {
    const closeMenus = () => { setOpenMenuFor(null); setShowFilterMenu(false); };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dueFilter === "with" && !t.date) return false;
    if (dueFilter === "without" && t.date) return false;
    if (statusFilter === "pending" && t.completed) return false;
    if (statusFilter === "done" && !t.completed) return false;
    return true;
  });
  const tasksForCategory = (catId) => filteredTasks.filter((t) => t.categoryId === catId);
  const filtersActive = dueFilter !== "all" || statusFilter !== "all";

  const handleDragStart = (taskId) => setDraggedTaskId(taskId);
  const handleDragOver = (e, catId) => {
    e.preventDefault();
    setDragOverCol(catId);
  };
  const handleDrop = (catId) => {
    if (draggedTaskId) {
      setTasks((prev) => prev.map((t) => (t.id === draggedTaskId ? { ...t, categoryId: catId } : t)));
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const startAddTask = (catId) => {
    setAddingTaskFor(catId);
    setNewTaskTitle("");
    setTimeout(() => newTaskInputRef.current?.focus(), 0);
  };
  const commitAddTask = (catId) => {
    const title = newTaskTitle.trim();
    if (title) setTasks((prev) => [...prev, { id: uid("t"), title, categoryId: catId, date: null, completed: false, subtasks: [], links: [] }]);
    setAddingTaskFor(null);
    setNewTaskTitle("");
  };
  const removeTask = (taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId));
  const toggleTaskDone = (taskId) => setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));

  const openNewTaskModal = () => {
    setModalTitle("");
    setModalCategoryId(activeFilter !== "all" ? activeFilter : categories[0]?.id || "");
    setModalDueDate("");
    setModalCompleted(false);
    setModalSubtasks([]);
    setModalNewSubtask("");
    setModalLinks([]);
    setModalNewLink("");
    setShowNewTaskModal(true);
    setTimeout(() => { if (descRef.current) descRef.current.innerHTML = ""; }, 0);
  };
  const commitModalTask = () => {
    const title = modalTitle.trim();
    if (!title || !modalCategoryId) return;
    const description = descRef.current ? descRef.current.innerHTML : "";
    setTasks((prev) => [
      ...prev,
      {
        id: uid("t"),
        title,
        categoryId: modalCategoryId,
        date: formatDate(modalDueDate),
        completed: modalCompleted,
        description,
        subtasks: modalSubtasks,
        links: modalLinks,
      },
    ]);
    setShowNewTaskModal(false);
  };

  const addModalSubtask = () => {
    const title = modalNewSubtask.trim();
    if (!title) return;
    setModalSubtasks((prev) => [...prev, { id: uid("sub"), title, done: false }]);
    setModalNewSubtask("");
  };
  const toggleModalSubtask = (id) => setModalSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const removeModalSubtask = (id) => setModalSubtasks((prev) => prev.filter((s) => s.id !== id));
  const subtaskProgress = modalSubtasks.length ? Math.round((modalSubtasks.filter((s) => s.done).length / modalSubtasks.length) * 100) : 0;

  const addModalLink = () => {
    const url = modalNewLink.trim();
    if (!url) return;
    setModalLinks((prev) => [...prev, url]);
    setModalNewLink("");
  };
  const removeModalLink = (idx) => setModalLinks((prev) => prev.filter((_, i) => i !== idx));

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    descRef.current?.focus();
  };
  const insertTable = () => {
    exec(
      "insertHTML",
      "<table><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table><br/>"
    );
  };

  const commitAddCategory = () => {
    const name = newCatName.trim().slice(0, CAT_NAME_LIMIT);
    if (name) {
      const color = COLOR_OPTIONS[categories.length % COLOR_OPTIONS.length];
      setCategories((prev) => [...prev, { id: uid("cat"), name, color }]);
    }
    setAddingCategory(false);
    setNewCatName("");
  };
  const removeCategory = (catId) => {
    const count = tasksForCategory(catId).length;
    if (count > 0) {
      const ok = window.confirm(`Essa categoria tem ${count} tarefa(s). Excluir a categoria também vai excluir essas tarefas. Continuar?`);
      if (!ok) return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    setTasks((prev) => prev.filter((t) => t.categoryId !== catId));
    if (activeFilter === catId) setActiveFilter("all");
  };
  const startEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setOpenMenuFor(null);
  };
  const commitEditCategory = (catId) => {
    const name = editingCatName.trim().slice(0, CAT_NAME_LIMIT);
    if (name) setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, name } : c)));
    setEditingCatId(null);
  };

  const taskMeta = (task, cat) => (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cat.color.badge}`}>{cat.name}</span>
      {task.date && (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={11} />
          {task.date}
        </span>
      )}
      {task.subtasks?.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <ListChecks size={11} />
          {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
        </span>
      )}
      {task.links?.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
          <Paperclip size={11} />
          {task.links.length}
        </span>
      )}
    </div>
  );

  const renderColumn = (cat) => {
    const catTasks = tasksForCategory(cat.id);
    const isOver = dragOverCol === cat.id;
    return (
      <div
        key={cat.id}
        onDragOver={(e) => handleDragOver(e, cat.id)}
        onDrop={() => handleDrop(cat.id)}
        onDragLeave={() => setDragOverCol((c) => (c === cat.id ? null : c))}
        className={`rounded-2xl border bg-white transition-colors flex flex-col ${
          isOver ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${cat.color.dot}`} />
            <h3 className="text-sm font-bold text-gray-800 truncate" title={cat.name}>{cat.name}</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 rounded-full px-1.5 flex-shrink-0">{catTasks.length}</span>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenuFor(openMenuFor === cat.id ? null : cat.id); }}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Mais opções"
            >
              <MoreHorizontal size={16} />
            </button>
            {openMenuFor === cat.id && (
              <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-10">
                <button onClick={() => startEditCategory(cat)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <Pencil size={13} /> Renomear
                </button>
                <button onClick={() => { setOpenMenuFor(null); removeCategory(cat.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="oq-scroll p-3 space-y-2.5 min-h-[80px] max-h-[420px] overflow-y-auto">
          {catTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              className={`group rounded-xl border border-gray-200 bg-white p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${
                draggedTaskId === task.id ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <GripVertical size={14} className="mt-0.5 text-gray-300 flex-shrink-0" />
                <button onClick={() => toggleTaskDone(task.id)} className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-indigo-500" aria-label="Marcar concluída">
                  {task.completed ? <CircleCheck size={16} className="text-indigo-500" /> : <Circle size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{task.title}</p>
                  {taskMeta(task, cat)}
                </div>
                <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-opacity flex-shrink-0" aria-label="Remover tarefa">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {addingTaskFor === cat.id ? (
            <div className="rounded-xl border border-indigo-300 bg-white p-2.5">
              <input
                ref={newTaskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAddTask(cat.id);
                  if (e.key === "Escape") setAddingTaskFor(null);
                }}
                placeholder="Título da tarefa"
                className="w-full text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => commitAddTask(cat.id)} className="inline-flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-2.5 py-1.5">
                  <Check size={12} /> Salvar
                </button>
                <button onClick={() => setAddingTaskFor(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => startAddTask(cat.id)} className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2.5 text-xs font-medium text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors">
              <Plus size={13} /> Nova tarefa
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAddCategoryCard = () => (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 flex items-center justify-center min-h-[120px] p-3">
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
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 mb-2"
          />
          <div className="flex items-center gap-2">
            <button onClick={commitAddCategory} className="inline-flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-2.5 py-1.5">
              <Check size={12} /> Criar
            </button>
            <button onClick={() => setAddingCategory(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">Cancelar</button>
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

  const renderCategoryList = (cat) => {
    const catTasks = tasksForCategory(cat.id);
    return (
      <div key={cat.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
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
                className="text-base font-bold text-gray-800 bg-transparent border-b border-indigo-400 outline-none"
              />
            ) : (
              <h2 className="text-base font-bold text-gray-800 truncate">{cat.name}</h2>
            )}
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5 flex-shrink-0">{catTasks.length} tarefa(s)</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => startAddTask(cat.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <Plus size={13} /> Tarefa
            </button>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenuFor(openMenuFor === cat.id ? null : cat.id); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Mais opções"
              >
                <MoreHorizontal size={16} />
              </button>
              {openMenuFor === cat.id && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-10">
                  <button onClick={() => startEditCategory(cat)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <Pencil size={13} /> Renomear
                  </button>
                  <button onClick={() => { setOpenMenuFor(null); removeCategory(cat.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="oq-scroll divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
          {catTasks.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">Nenhuma tarefa aqui ainda.</p>}
          {catTasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60">
              <GripVertical size={15} className="text-gray-300 flex-shrink-0" />
              <button onClick={() => toggleTaskDone(task.id)} className="flex-shrink-0 text-gray-300 hover:text-indigo-500" aria-label="Marcar concluída">
                {task.completed ? <CircleCheck size={17} className="text-indigo-500" /> : <Circle size={17} />}
              </button>
              <span className={`flex-1 min-w-0 text-sm truncate ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{task.title}</span>
              {task.subtasks?.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <ListChecks size={12} />
                  {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
                </span>
              )}
              {task.date && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Calendar size={12} />
                  {task.date}
                </span>
              )}
              <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-opacity flex-shrink-0" aria-label="Remover tarefa">
                <X size={15} />
              </button>
            </div>
          ))}

          {addingTaskFor === cat.id && (
            <div className="flex items-center gap-3 px-5 py-3.5">
              <GripVertical size={15} className="text-gray-200 flex-shrink-0" />
              <input
                ref={newTaskInputRef}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAddTask(cat.id);
                  if (e.key === "Escape") setAddingTaskFor(null);
                }}
                placeholder="Título da tarefa"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
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

  return (
    <div className="oq-font">
      <style>{FONT_IMPORT}</style>

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Tarefas</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={12} />
          <span>Home</span>
          <ChevronRight size={12} />
          <span className="text-gray-500 font-semibold">Tarefas</span>
        </div>
      </div>

          {/* Toolbar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setActiveFilter("all")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  activeFilter === "all" ? "bg-gray-100 text-gray-800" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Todas
                <span className="text-xs rounded-full px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-bold">{filteredTasks.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  title={cat.name}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors max-w-[160px] ${
                    activeFilter === cat.id ? "bg-gray-100 text-gray-800" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cat.color.dot}`} />
                  <span className="truncate">{cat.name}</span>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-gray-100 text-gray-500 font-bold flex-shrink-0">{tasksForCategory(cat.id).length}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFilterMenu((v) => !v); }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    filtersActive ? "border-indigo-300 text-indigo-600 bg-indigo-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Filtrar
                </button>
                {showFilterMenu && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-3 z-10 space-y-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                      <Search size={13} className="text-gray-400 flex-shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por palavra-chave"
                        className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Prazo</p>
                      {[["all", "Todas"], ["with", "Com prazo"], ["without", "Sem prazo"]].map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 px-1 py-1 text-sm text-gray-600 cursor-pointer">
                          <input type="radio" name="dueFilter" checked={dueFilter === val} onChange={() => setDueFilter(val)} className="text-indigo-600 focus:ring-indigo-400" />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Status</p>
                      {[["all", "Todas"], ["pending", "Pendentes"], ["done", "Concluídas"]].map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 px-1 py-1 text-sm text-gray-600 cursor-pointer">
                          <input type="radio" name="statusFilter" checked={statusFilter === val} onChange={() => setStatusFilter(val)} className="text-indigo-600 focus:ring-indigo-400" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={openNewTaskModal}
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

      {/* New task modal */}
      {showNewTaskModal && (
        <div className="absolute inset-0 bg-black/40 z-40 overflow-y-auto py-8 px-4" onClick={() => setShowNewTaskModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg mx-auto">
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-extrabold text-gray-800">Nova tarefa</h3>
                <button onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-5">Organize seu dia — adicione os detalhes que fizerem sentido.</p>
            </div>

            <div className="px-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Título</label>
                <input
                  autoFocus
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="O que você precisa fazer?"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={modalDueDate}
                    onChange={(e) => setModalDueDate(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Status</label>
                  <select
                    value={modalCompleted ? "done" : "pending"}
                    onChange={(e) => setModalCompleted(e.target.value === "done")}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="pending">Pendente</option>
                    <option value="done">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Categoria</label>
                <select
                  value={modalCategoryId}
                  onChange={(e) => setModalCategoryId(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-400 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Descrição</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-1.5 py-1">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200" aria-label="Negrito">
                      <Bold size={14} />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200" aria-label="Itálico">
                      <Italic size={14} />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200" aria-label="Sublinhado">
                      <Underline size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200" aria-label="Lista">
                      <List size={14} />
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 rounded text-gray-500 hover:bg-gray-200" aria-label="Tabela">
                      <TableIcon size={14} />
                    </button>
                  </div>
                  <div
                    ref={descRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Escreva os detalhes da tarefa..."
                    className="oq-rte min-h-[100px] max-h-[220px] overflow-y-auto p-3 text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500">Subtarefas</label>
                  {modalSubtasks.length > 0 && <span className="text-xs text-gray-400">{subtaskProgress}%</span>}
                </div>
                {modalSubtasks.length > 0 && (
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${subtaskProgress}%` }} />
                  </div>
                )}
                <div className="space-y-1.5 mb-2">
                  {modalSubtasks.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 group">
                      <button type="button" onClick={() => toggleModalSubtask(s.id)} className="flex-shrink-0 text-gray-300 hover:text-indigo-500">
                        {s.done ? <CircleCheck size={16} className="text-indigo-500" /> : <Circle size={16} />}
                      </button>
                      <span className={`flex-1 text-sm ${s.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{s.title}</span>
                      <button type="button" onClick={() => removeModalSubtask(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={modalNewSubtask}
                    onChange={(e) => setModalNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addModalSubtask())}
                    placeholder="Adicionar subtarefa"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                  />
                  <button type="button" onClick={addModalSubtask} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex-shrink-0">
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Anexos</label>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-400 cursor-not-allowed"
                  title="Upload em breve"
                >
                  <Paperclip size={15} />
                  Anexar arquivo <span className="text-xs">(máx. 5MB — em breve)</span>
                </button>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
                    <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                    <input
                      value={modalNewLink}
                      onChange={(e) => setModalNewLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addModalLink())}
                      placeholder="Colar um link"
                      className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
                    />
                  </div>
                  <button type="button" onClick={addModalLink} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex-shrink-0">
                    <Plus size={15} />
                  </button>
                </div>
                {modalLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {modalLinks.map((link, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-full pl-2.5 pr-1 py-1 text-gray-600 max-w-[220px]">
                        <span className="truncate">{link}</span>
                        <button type="button" onClick={() => removeModalLink(i)} className="text-gray-400 hover:text-rose-500 flex-shrink-0">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-5 mt-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={commitModalTask} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
                Salvar tarefa
              </button>
              <button onClick={() => setShowNewTaskModal(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
