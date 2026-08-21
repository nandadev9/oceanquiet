import { DEFAULT_CATEGORIES } from "./constants";
import { todayISO } from "./dates";
import { STORAGE_KEY, TRASH_RETENTION_DAYS, type OceanStore, type ScheduleBlock, type Task } from "./types";

function sampleTasks(today: string): Task[] {
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  return [
    {
      id: "t1",
      title: "Revisar capítulo 3 do curso",
      categoryId: "estudos",
      dueDate: tomorrow,
      status: "todo",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t2",
      title: "Fazer resumo da aula gravada",
      categoryId: "estudos",
      dueDate: null,
      status: "todo",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t3",
      title: "Responder e-mails pendentes",
      categoryId: "trabalho",
      dueDate: today,
      status: "doing",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t4",
      title: "Preparar apresentação do projeto",
      categoryId: "trabalho",
      dueDate: today,
      status: "todo",
      favorite: true,
      board: "weekly",
      description: "",
      subtasks: [
        { id: "s1", title: "Reunir dados", done: true },
        { id: "s2", title: "Montar slides", done: false },
      ],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t5",
      title: "Organizar gaveta de documentos",
      categoryId: "pessoal",
      dueDate: null,
      status: "done",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t6",
      title: "Ligar para a vó",
      categoryId: "familia",
      dueDate: today,
      status: "todo",
      favorite: true,
      board: "daily",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t7",
      title: "Consulta odontológica",
      categoryId: "saude",
      dueDate: today,
      status: "todo",
      favorite: false,
      board: "daily",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t8",
      title: "Beber mais água durante o dia",
      categoryId: "saude",
      dueDate: null,
      status: "todo",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t9",
      title: "Acordar devagar + água",
      categoryId: "saude",
      dueDate: today,
      status: "todo",
      favorite: false,
      board: "daily",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t10",
      title: "Meditação guiada",
      categoryId: "pessoal",
      dueDate: today,
      status: "todo",
      favorite: false,
      board: "daily",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
    {
      id: "t11",
      title: "Marcar o dentista",
      categoryId: "saude",
      dueDate: null,
      status: "todo",
      favorite: false,
      board: "weekly",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: "2026-01-01T12:00:00.000Z",
    },
  ];
}

export function getDefaultStore(): OceanStore {
  const today = todayISO();
  return {
    version: 1,
    categories: DEFAULT_CATEGORIES,
    tasks: sampleTasks(today),
    schedule: [
      { id: "sch-0", taskId: null, title: "Acordar", date: today, startMinutes: 6 * 60, durationMinutes: 30, color: "primary" },
      { id: "sch-1", taskId: "t9", date: today, title: "", startMinutes: 6 * 60 + 30, durationMinutes: 30, color: "primary" },
      { id: "sch-2", taskId: "t10", date: today, title: "", startMinutes: 7 * 60, durationMinutes: 30, color: "success" },
      { id: "sch-3", taskId: "t7", date: today, title: "", startMinutes: 14 * 60, durationMinutes: 60, color: "warning" },
    ],
  };
}

export function purgeExpiredTrash(store: OceanStore): OceanStore {
  const cutoff = Date.now() - TRASH_RETENTION_DAYS * 86400000;
  const tasks = store.tasks.filter(
    (t) => !t.archivedAt || new Date(t.archivedAt).getTime() >= cutoff
  );
  const ids = new Set(tasks.map((t) => t.id));
  return {
    ...store,
    tasks,
    schedule: store.schedule.filter((s) => !s.taskId || ids.has(s.taskId)),
  };
}

export function loadStore(): OceanStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OceanStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tasks)) return null;
    const schedule: ScheduleBlock[] = (parsed.schedule || []).map((s) => ({
      id: s.id,
      taskId: s.taskId ?? null,
      title: s.title ?? "",
      date: s.date,
      startMinutes: s.startMinutes,
      durationMinutes: s.durationMinutes,
      color: s.color === "danger" || s.color === "success" || s.color === "warning" ? s.color : "primary",
    }));
    return purgeExpiredTrash({ ...parsed, schedule });
  } catch {
    return null;
  }
}

export function saveStore(store: OceanStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota / private mode
  }
}
