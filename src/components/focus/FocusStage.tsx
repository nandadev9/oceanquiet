"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { AmbientEngine, playChime } from "@/lib/ocean/ambient";
import {
  DEFAULT_FOCUS_SETTINGS,
  FOCUS_PRESETS,
  FOCUS_HISTORY_KEY,
  FOCUS_SETTINGS_KEY,
  FOCUS_THEMES,
  themeAssetPaths,
  type FocusSettings,
  type FocusThemeId,
} from "@/lib/ocean/focus";
import type { Task } from "@/lib/ocean/types";
import OceanAssistant from "@/components/ocean/OceanAssistant";

type Phase = "focus" | "break" | "longBreak";

const presetLabelKeys: Record<(typeof FOCUS_PRESETS)[number]["id"], TranslationKey> = {
  leve: "focus.preset.leve",
  classico: "focus.preset.classico",
  fundo: "focus.preset.fundo",
};

const themeLabelKeys: Record<FocusThemeId, { name: TranslationKey; sound: TranslationKey }> = {
  "oceano-quieto": { name: "focus.theme.oceano-quieto.name", sound: "focus.theme.oceano-quieto.sound" },
  "canto-no-campo": { name: "focus.theme.canto-no-campo.name", sound: "focus.theme.canto-no-campo.sound" },
  companhia: { name: "focus.theme.companhia.name", sound: "focus.theme.companhia.sound" },
  estrada: { name: "focus.theme.estrada.name", sound: "focus.theme.estrada.sound" },
  cafeteria: { name: "focus.theme.cafeteria.name", sound: "focus.theme.cafeteria.sound" },
  chuva: { name: "focus.theme.chuva.name", sound: "focus.theme.chuva.sound" },
  "onda-de-foco": { name: "focus.theme.onda-de-foco.name", sound: "focus.theme.onda-de-foco.sound" },
  classico: { name: "focus.theme.classico.name", sound: "focus.theme.classico.sound" },
  silencio: { name: "focus.theme.silencio.name", sound: "focus.theme.silencio.sound" },
};

function loadSettings(): FocusSettings {
  if (typeof window === "undefined") return DEFAULT_FOCUS_SETTINGS;
  try {
    const raw = window.localStorage.getItem(FOCUS_SETTINGS_KEY);
    if (!raw) return DEFAULT_FOCUS_SETTINGS;
    return { ...DEFAULT_FOCUS_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FOCUS_SETTINGS;
  }
}

function formatMmSs(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function phaseDuration(phase: Phase, settings: FocusSettings) {
  if (phase === "focus") return settings.focusMinutes * 60 * 1000;
  if (phase === "break") return settings.breakMinutes * 60 * 1000;
  return settings.longBreakMinutes * 60 * 1000;
}

export default function FocusStage() {
  const { t } = useLanguage();
  const { ready, tasksByBoard, getCategory, toggleDone, setStatus } = useTasks();
  const daily = tasksByBoard("daily");
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS);
  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(DEFAULT_FOCUS_SETTINGS.focusMinutes * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(new AmbientEngine());
  const soundStarted = useRef(false);
  const remainingRef = useRef(remaining);
  const phaseRef = useRef(phase);
  const completedRef = useRef(completed);
  const settingsRef = useRef(settings);

  useEffect(() => {
    remainingRef.current = remaining;
    phaseRef.current = phase;
    completedRef.current = completed;
    settingsRef.current = settings;
  }, [remaining, phase, completed, settings]);

  const theme = FOCUS_THEMES.find((t) => t.id === settings.themeId) ?? FOCUS_THEMES[0];
  const assets = themeAssetPaths(theme.id);
  const selected = daily.find((t) => t.id === selectedId) ?? daily[0] ?? null;

  useEffect(() => {
    const loaded = loadSettings();
    queueMicrotask(() => {
      setSettings(loaded);
      setRemaining(loaded.focusMinutes * 60 * 1000);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FOCUS_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const startSound = useCallback(async () => {
    if (muted) return;
    soundStarted.current = true;
    await engineRef.current.start(theme, settings.volume);
  }, [muted, theme, settings.volume]);

  useEffect(() => {
    if (!soundStarted.current) return;
    if (muted) {
      engineRef.current.stop();
      return;
    }
    engineRef.current.start(theme, settings.volume);
  }, [theme, muted, settings.volume]);

  useEffect(() => {
    const engine = engineRef.current;
    return () => {
      engine.stop();
    };
  }, []);

  useEffect(() => {
    engineRef.current.setVolume(muted ? 0 : settings.volume);
  }, [settings.volume, muted]);

  const advancePhase = () => {
    playChime();
    const current = phaseRef.current;
    const s = settingsRef.current;
    if (current === "focus") {
      const nextCount = completedRef.current + 1;
      setCompleted(nextCount);
      try {
        const raw = window.localStorage.getItem(FOCUS_HISTORY_KEY);
        const history = raw ? JSON.parse(raw) : [];
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        window.localStorage.setItem(
          FOCUS_HISTORY_KEY,
          JSON.stringify([...history, { date, minutes: s.focusMinutes }].slice(-365))
        );
      } catch {
        // Focus history is optional when browser storage is unavailable.
      }
      const nextPhase: Phase = nextCount % s.sessionsUntilLong === 0 ? "longBreak" : "break";
      setPhase(nextPhase);
      setRemaining(phaseDuration(nextPhase, s));
    } else {
      setPhase("focus");
      setRemaining(phaseDuration("focus", s));
    }
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const next = remainingRef.current - 250;
      if (next <= 0) {
        advancePhase();
        return;
      }
      remainingRef.current = next;
      setRemaining(next);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const applyPreset = (focus: number, brk: number, longBreak: number) => {
    const next = { ...settings, focusMinutes: focus, breakMinutes: brk, longBreakMinutes: longBreak };
    setSettings(next);
    if (!running) {
      setPhase("focus");
      setRemaining(focus * 60 * 1000);
    }
  };

  const handleStart = async () => {
    await startSound();
    if (selected && phase === "focus") setStatus(selected.id, "doing");
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(phaseDuration(phase, settings));
  };

  const handleSkip = () => {
    advancePhase();
  };

  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const total = phaseDuration(phase, settings);
  const progress = total === 0 ? 0 : 1 - remaining / total;
  const radius = 112;
  const circ = 2 * Math.PI * radius;
  const phaseLabel =
    phase === "focus"
      ? t("focus.phase.focus")
      : phase === "break"
        ? t("focus.phase.break")
        : t("focus.phase.longBreak");
  const ringColor = phase === "focus" ? "#7dd3fc" : phase === "break" ? "#6ee7b7" : "#c4b5fd";

  const openTasks = useMemo(() => daily.filter((t) => t.status !== "done"), [daily]);

  if (!ready || !hydrated) {
    return <div className="h-[calc(100dvh-8.5rem)] rounded-2xl bg-slate-900" />;
  }

  return (
    <div
      ref={stageRef}
      className="relative h-[calc(100dvh-8.5rem)] min-h-[560px] overflow-hidden rounded-2xl text-white"
    >
      {/* Theme covers live in /public and swap at runtime; next/image is less practical here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={assets.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <video
        key={theme.id}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoOk ? "opacity-100" : "opacity-0"
        }`}
        src={assets.video}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setVideoOk(true)}
        onError={() => setVideoOk(false)}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6">
          <div className="min-w-0 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">{t("focus.heading")}</p>
            <OceanAssistant tone="onDark" className="mb-0">
              {openTasks.length === 0
                ? t("focus.assistantEmpty")
                : t("focus.assistant")}
            </OceanAssistant>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setMuted((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15"
              aria-label={muted ? t("focus.enableSound") : t("focus.mute")}
              title={muted ? t("focus.enableSound") : t("focus.mute")}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md border border-white/15 ${
                showSettings ? "bg-white/25" : "bg-white/10 hover:bg-white/20"
              }`}
              aria-label={t("focus.adjustTimes")}
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15"
              aria-label={fullscreen ? t("focus.exitFullscreen") : t("focus.fullscreen")}
              title={fullscreen ? t("focus.exitFullscreen") : t("focus.fullscreen")}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Square size={18} />}
            </button>
          </div>
        </header>

        {showSettings && (
          <div className="mx-4 sm:mx-6 mt-2 rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl p-4 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-wide text-white/50 mb-3">{t("focus.pomodoroPace")}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {FOCUS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.focus, p.brk, p.longBreak)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                    settings.focusMinutes === p.focus && settings.breakMinutes === p.brk
                      ? "bg-white text-slate-900 border-white"
                      : "bg-white/10 border-white/15 hover:bg-white/20"
                  }`}
                >
                  {t(presetLabelKeys[p.id])} · {p.focus}/{p.brk}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <NumberField
                label={t("focus.minutes")}
                value={settings.focusMinutes}
                onChange={(focusMinutes) => {
                  setSettings((s) => ({ ...s, focusMinutes }));
                  if (!running && phase === "focus") setRemaining(focusMinutes * 60 * 1000);
                }}
              />
              <NumberField
                label={t("focus.break")}
                value={settings.breakMinutes}
                onChange={(breakMinutes) => setSettings((s) => ({ ...s, breakMinutes }))}
              />
              <NumberField
                label={t("focus.longBreak")}
                value={settings.longBreakMinutes}
                onChange={(longBreakMinutes) => setSettings((s) => ({ ...s, longBreakMinutes }))}
              />
            </div>
            <label className="flex items-center gap-3 mt-4 text-sm text-white/80">
              <span className="w-16 text-xs uppercase tracking-wide text-white/50">{t("focus.sound")}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={settings.volume}
                onChange={(e) => setSettings((s) => ({ ...s, volume: Number(e.target.value) }))}
                className="flex-1 accent-sky-300"
              />
            </label>
          </div>
        )}

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr] gap-4 px-4 sm:px-6 py-4">
          <aside className="min-h-0 rounded-2xl border border-white/15 bg-black/35 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-bold">{t("focus.todayFocus")}</h2>
              <span className="text-xs text-white/50">{t("focus.openTasks", { count: openTasks.length })}</span>
            </div>
            <div className="oq-scroll flex-1 overflow-y-auto p-3 space-y-2">
              {daily.length === 0 && (
                <p className="text-sm text-white/55 px-2 py-8 text-center leading-relaxed">
                  {t("focus.emptyTasks")}
                </p>
              )}
              {daily.map((task, index) => (
                <FocusTaskRow
                  key={task.id}
                  task={task}
                  index={index + 1}
                  categoryName={getCategory(task.categoryId)?.name}
                  selected={selected?.id === task.id}
                  onSelect={() => setSelectedId(task.id)}
                  onToggle={() => toggleDone(task.id)}
                />
              ))}
            </div>
            <div className="px-4 py-3 border-t border-white/10 text-[11px] text-white/45">
              {completed === 1
                ? t("focus.completedBlock", { count: completed })
                : t("focus.completedBlocks", { count: completed })}
            </div>
          </aside>

          <div className="flex flex-col items-center justify-center min-h-[360px]">
            <div className="relative">
              <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
                <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - progress)}
                  className="transition-[stroke-dashoffset] duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55 mb-1">{phaseLabel}</p>
                <p className="text-5xl font-semibold tabular-nums tracking-tight">{formatMmSs(remaining)}</p>
                <p className="mt-2 text-sm text-white/70 line-clamp-2">
                  {phase === "focus"
                    ? selected?.title || t("focus.chooseTask")
                    : t("focus.breathe")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {running ? (
                <button
                  onClick={() => setRunning(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-2.5 text-sm font-bold hover:bg-white/90"
                >
                  <Pause size={16} /> {t("focus.pause")}
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-2.5 text-sm font-bold hover:bg-white/90"
                >
                  <Play size={16} /> {t("focus.start")}
                </button>
              )}
              <button
                onClick={handleSkip}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/15 hover:bg-white/20"
                aria-label={t("focus.skipBlock")}
                title={t("focus.skip")}
              >
                <SkipForward size={16} />
              </button>
              <button
                onClick={handleReset}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/15 hover:bg-white/20"
                aria-label={t("focus.resetBlock")}
                title={t("focus.reset")}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <div className="oq-scroll flex gap-2 overflow-x-auto pb-1">
            {FOCUS_THEMES.map((item) => {
              const active = item.id === theme.id;
              const thumb = themeAssetPaths(item.id).cover;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setVideoOk(false);
                    setSettings((s) => ({ ...s, themeId: item.id as FocusThemeId }));
                  }}
                  className={`relative flex-shrink-0 w-36 overflow-hidden rounded-xl border text-left transition ${
                    active ? "border-white ring-2 ring-white/70" : "border-white/15 hover:border-white/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt="" className="h-16 w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 right-2">
                    <span className="block text-[11px] font-bold truncate">{t(themeLabelKeys[item.id].name)}</span>
                    <span className="block text-[10px] text-white/65 truncate">{t(themeLabelKeys[item.id].sound)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-white/50 mb-1">{label}</span>
      <input
        type="number"
        min={1}
        max={120}
        value={value}
        onChange={(e) => onChange(Math.min(120, Math.max(1, Number(e.target.value) || 1)))}
        className="w-full rounded-lg bg-white/10 border border-white/15 px-2 py-1.5 text-sm outline-none focus:border-white/40"
      />
    </label>
  );
}

function FocusTaskRow({
  task,
  index,
  categoryName,
  selected,
  onSelect,
  onToggle,
}: {
  task: Task;
  index: number;
  categoryName?: string;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const done = task.status === "done";
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-2.5 py-2 cursor-pointer transition ${
        selected ? "border-sky-300/80 bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${done ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <span className="text-[11px] font-bold text-white/40 w-4 pt-0.5">{index}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="mt-0.5 flex-shrink-0 text-white/50 hover:text-white"
        aria-label={t("focus.markDone")}
      >
        {done ? <Check size={16} /> : <span className="block h-4 w-4 rounded-full border border-white/40" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${done ? "line-through text-white/50" : "text-white"}`}>{task.title}</p>
        {categoryName && <p className="text-[10px] text-white/45 mt-0.5">{categoryName}</p>}
      </div>
    </div>
  );
}
