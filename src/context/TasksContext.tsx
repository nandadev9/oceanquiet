"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { COLOR_OPTIONS } from "@/lib/ocean/constants";
import { addDaysISO, uid } from "@/lib/ocean/dates";
import { getDefaultStore, loadStore, saveStore } from "@/lib/ocean/storage";
import type {
  Category,
  EventColor,
  OceanStore,
  ScheduleBlock,
  Task,
  TaskBoard,
  TaskStatus,
} from "@/lib/ocean/types";

type TaskDraft = Partial<Task> & { title: string; categoryId: string };

type TasksContextValue = {
  ready: boolean;
  categories: Category[];
  tasks: Task[];
  schedule: ScheduleBlock[];
  activeTasks: Task[];
  trashTasks: Task[];
  draggingTaskId: string | null;
  setDraggingTaskId: (id: string | null) => void;
  getCategory: (id: string) => Category | undefined;
  getTask: (id: string) => Task | undefined;
  tasksByBoard: (board: TaskBoard) => Task[];
  scheduleForDate: (date: string) => ScheduleBlock[];
  slotForTaskOnDate: (taskId: string, date: string) => ScheduleBlock | undefined;
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  toggleDone: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setBoard: (id: string, board: TaskBoard) => void;
  prioritize: (id: string) => void;
  archiveTask: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteForever: (id: string) => void;
  emptyTrash: () => void;
  addCategory: (name: string) => Category | null;
  renameCategory: (id: string, name: string) => void;
  removeCategory: (id: string) => void;
  upsertSchedule: (
    taskId: string,
    date: string,
    startMinutes: number,
    durationMinutes: number
  ) => void;
  addFreeSlot: (
    date: string,
    startMinutes: number,
    durationMinutes: number,
    title: string,
    color?: EventColor
  ) => ScheduleBlock;
  updateSchedule: (
    id: string,
    patch: Partial<Pick<ScheduleBlock, "startMinutes" | "durationMinutes" | "date" | "title" | "color">>
  ) => void;
  removeSchedule: (id: string) => void;
  copyScheduleToDate: (fromDate: string, toDate: string) => number;
  findPreviousBusyDate: (date: string) => string | null;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<OceanStore>(getDefaultStore);
  const [ready, setReady] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadStore();
    // Hydrate from localStorage after mount (not available during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external store
    if (saved) setStore(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveStore(store);
  }, [store, ready]);

  const patchStore = useCallback((updater: (prev: OceanStore) => OceanStore) => {
    setStore(updater);
  }, []);

  const getCategory = useCallback(
    (id: string) => store.categories.find((c) => c.id === id),
    [store.categories]
  );

  const getTask = useCallback(
    (id: string) => store.tasks.find((t) => t.id === id),
    [store.tasks]
  );

  const activeTasks = useMemo(
    () => store.tasks.filter((t) => !t.archivedAt),
    [store.tasks]
  );

  const trashTasks = useMemo(
    () =>
      store.tasks
        .filter((t) => t.archivedAt)
        .sort((a, b) => (b.archivedAt || "").localeCompare(a.archivedAt || "")),
    [store.tasks]
  );

  const tasksByBoard = useCallback(
    (board: TaskBoard) =>
      activeTasks
        .filter((t) => t.board === board)
        .sort((a, b) => Number(b.favorite) - Number(a.favorite)),
    [activeTasks]
  );

  const scheduleForDate = useCallback(
    (date: string) => store.schedule.filter((s) => s.date === date),
    [store.schedule]
  );

  const slotForTaskOnDate = useCallback(
    (taskId: string, date: string) =>
      store.schedule.find((s) => s.taskId === taskId && s.date === date),
    [store.schedule]
  );

  const addTask = useCallback((draft: TaskDraft) => {
    const task: Task = {
      id: uid("t"),
      dueDate: null,
      status: "todo",
      favorite: false,
      board: "inbox",
      description: "",
      subtasks: [],
      links: [],
      archivedAt: null,
      createdAt: new Date().toISOString(),
      ...draft,
    };
    patchStore((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    return task;
  }, [patchStore]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    patchStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch, id: t.id } : t)),
    }));
  }, [patchStore]);

  const setStatus = useCallback(
    (id: string, status: TaskStatus) => updateTask(id, { status }),
    [updateTask]
  );

  const toggleDone = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
      ),
    }));
  }, [patchStore]);

  const toggleFavorite = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
    }));
  }, [patchStore]);

  const setBoard = useCallback(
    (id: string, board: TaskBoard) => updateTask(id, { board }),
    [updateTask]
  );

  const prioritize = useCallback((id: string) => setBoard(id, "weekly"), [setBoard]);

  const archiveTask = useCallback((id: string) => {
    updateTask(id, { archivedAt: new Date().toISOString() });
  }, [updateTask]);

  const restoreTask = useCallback((id: string) => {
    updateTask(id, { archivedAt: null });
  }, [updateTask]);

  const deleteForever = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
      schedule: prev.schedule.filter((s) => s.taskId !== id),
    }));
  }, [patchStore]);

  const emptyTrash = useCallback(() => {
    patchStore((prev) => {
      const trashIds = new Set(prev.tasks.filter((t) => t.archivedAt).map((t) => t.id));
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => !t.archivedAt),
        schedule: prev.schedule.filter((s) => !s.taskId || !trashIds.has(s.taskId)),
      };
    });
  }, [patchStore]);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 15);
    if (!trimmed) return null;
    const category: Category = {
      id: uid("cat"),
      name: trimmed,
      color: COLOR_OPTIONS[store.categories.length % COLOR_OPTIONS.length],
    };
    patchStore((prev) => ({ ...prev, categories: [...prev.categories, category] }));
    return category;
  }, [patchStore, store.categories.length]);

  const renameCategory = useCallback((id: string, name: string) => {
    const trimmed = name.trim().slice(0, 15);
    if (!trimmed) return;
    patchStore((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    }));
  }, [patchStore]);

  const removeCategory = useCallback((id: string) => {
    const now = new Date().toISOString();
    patchStore((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      tasks: prev.tasks.map((t) =>
        t.categoryId === id && !t.archivedAt ? { ...t, archivedAt: now } : t
      ),
    }));
  }, [patchStore]);

  const upsertSchedule = useCallback(
    (taskId: string, date: string, startMinutes: number, durationMinutes: number) => {
      patchStore((prev) => {
        const existing = prev.schedule.find((s) => s.taskId === taskId && s.date === date);
        if (existing) {
          return {
            ...prev,
            schedule: prev.schedule.map((s) =>
              s.id === existing.id ? { ...s, startMinutes, durationMinutes } : s
            ),
          };
        }
        return {
          ...prev,
          schedule: [
            ...prev.schedule,
            { id: uid("sch"), taskId, title: "", date, startMinutes, durationMinutes, color: "primary" },
          ],
        };
      });
    },
    [patchStore]
  );

  const addFreeSlot = useCallback(
    (date: string, startMinutes: number, durationMinutes: number, title: string, color: EventColor = "primary") => {
      const block: ScheduleBlock = {
        id: uid("sch"),
        taskId: null,
        title: title.trim() || "Evento",
        date,
        startMinutes,
        durationMinutes,
        color,
      };
      patchStore((prev) => ({ ...prev, schedule: [...prev.schedule, block] }));
      return block;
    },
    [patchStore]
  );

  const updateSchedule = useCallback(
    (id: string, patch: Partial<Pick<ScheduleBlock, "startMinutes" | "durationMinutes" | "date" | "title" | "color">>) => {
      patchStore((prev) => ({
        ...prev,
        schedule: prev.schedule.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    [patchStore]
  );

  const removeSchedule = useCallback((id: string) => {
    patchStore((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== id),
    }));
  }, [patchStore]);

  const findPreviousBusyDate = useCallback(
    (date: string) => {
      for (let i = 1; i <= 14; i++) {
        const d = addDaysISO(date, -i);
        if (store.schedule.some((s) => s.date === d)) return d;
      }
      return null;
    },
    [store.schedule]
  );

  const copyScheduleToDate = useCallback(
    (fromDate: string, toDate: string) => {
      let added = 0;
      patchStore((prev) => {
        if (prev.schedule.some((s) => s.date === toDate)) return prev;
        const clones = prev.schedule
          .filter((s) => s.date === fromDate)
          .map((s, i) => ({ ...s, id: `${uid("sch")}-${i}`, date: toDate }));
        added = clones.length;
        if (!clones.length) return prev;
        return { ...prev, schedule: [...prev.schedule, ...clones] };
      });
      return added;
    },
    [patchStore]
  );

  const value = useMemo<TasksContextValue>(
    () => ({
      ready,
      categories: store.categories,
      tasks: store.tasks,
      schedule: store.schedule,
      activeTasks,
      trashTasks,
      draggingTaskId,
      setDraggingTaskId,
      getCategory,
      getTask,
      tasksByBoard,
      scheduleForDate,
      slotForTaskOnDate,
      addTask,
      updateTask,
      setStatus,
      toggleDone,
      toggleFavorite,
      setBoard,
      prioritize,
      archiveTask,
      restoreTask,
      deleteForever,
      emptyTrash,
      addCategory,
      renameCategory,
      removeCategory,
      upsertSchedule,
      addFreeSlot,
      updateSchedule,
      removeSchedule,
      copyScheduleToDate,
      findPreviousBusyDate,
    }),
    [
      ready,
      store.categories,
      store.tasks,
      store.schedule,
      activeTasks,
      trashTasks,
      draggingTaskId,
      getCategory,
      getTask,
      tasksByBoard,
      scheduleForDate,
      slotForTaskOnDate,
      addTask,
      updateTask,
      setStatus,
      toggleDone,
      toggleFavorite,
      setBoard,
      prioritize,
      archiveTask,
      restoreTask,
      deleteForever,
      emptyTrash,
      addCategory,
      renameCategory,
      removeCategory,
      upsertSchedule,
      addFreeSlot,
      updateSchedule,
      removeSchedule,
      copyScheduleToDate,
      findPreviousBusyDate,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
