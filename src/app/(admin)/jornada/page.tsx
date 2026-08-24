"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, ChevronDown, ChevronLeft, ChevronRight, Cloud, Heart, Plus, X } from "lucide-react";
import { todayISO } from "@/lib/ocean/dates";

type Answer = 0 | 1 | 2;
type QuestionId = "thoughts" | "energy" | "selfCriticism" | "frustration" | "tension" | "sleep";
type CheckIn = Partial<Record<QuestionId, Answer>>;
type PenColor = "ink" | "blue" | "red";
type WritingStyle = "hand" | "neat" | "typewriter";
type Entry = { id: string; date: string; content: string; favorite: boolean; createdAt: string; penColor?: PenColor; writingStyle?: WritingStyle };
type Store = { entries: Entry[]; checkIns: Record<string, CheckIn> };

const STORAGE_KEY = "oceanquiet.journey.v1";
const MAX_BOOKMARKS = 20;
const questions: { id: QuestionId; title: string; options: string[] }[] = [
  { id: "thoughts", title: "Como está a velocidade dos seus pensamentos?", options: ["Calmos e sob controle", "Moderadamente acelerados", "Difíceis de frear"] },
  { id: "energy", title: "Como está sua energia mental hoje?", options: ["Boa disposição", "Cansado, mas capaz", "Profundamente esgotado"] },
  { id: "selfCriticism", title: "Como foi sua autocrítica hoje?", options: ["Em paz comigo", "Algumas dúvidas", "Muito intensa"] },
  { id: "frustration", title: "Como você reagiu aos obstáculos?", options: ["Com calma", "Com frustração passageira", "Com paralisia ou desespero"] },
  { id: "tension", title: "Como seu corpo se sentiu?", options: ["Relaxado", "Levemente tenso", "Muito tenso ou agitado"] },
  { id: "sleep", title: "Como foi seu sono?", options: ["Restaurador", "Regular", "Ruim ou inquieto"] },
];
const moods = ["☺", "◐", "☹"];
const penClasses: Record<PenColor, string> = { ink: "text-slate-800", blue: "text-blue-800", red: "text-rose-800" };
const typeClasses: Record<WritingStyle, string> = { hand: "font-hand", neat: "font-serif", typewriter: "font-mono text-[15px]" };

function isoFrom(date: Date) { return date.toISOString().slice(0, 10); }
function moveDate(date: string, offset: number) { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + offset); return isoFrom(next); }
function longDate(date: string) { return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`)); }
function shortMonth(date: Date) { return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").slice(0, 3); }
function weekFor(date: string) { return Array.from({ length: 7 }, (_, i) => moveDate(date, i - 3)); }
function weather(checkIn: CheckIn) {
  const values = Object.values(checkIn);
  if (!values.length) return { symbol: "☁", label: "Sem registro" };
  const mean = values.reduce<number>((sum, value) => sum + value, 0) / values.length;
  return mean < .7 ? { symbol: "☀", label: "Dia leve" } : mean < 1.4 ? { symbol: "◐", label: "Dia oscilante" } : { symbol: "☁", label: "Dia exigente" };
}

export default function JornadaPage() {
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, CheckIn>>({});
  const [editing, setEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [penColor, setPenColor] = useState<PenColor>("ink");
  const [writingStyle, setWritingStyle] = useState<WritingStyle>("hand");
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(`${todayISO()}T12:00:00`));
  const [limitMessage, setLimitMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const parsed = JSON.parse(saved) as Store; setEntries(parsed.entries || []); setCheckIns(parsed.checkIns || {}); }
    } finally { setReady(true); }
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, checkIns })); }, [entries, checkIns, ready]);

  const dayEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [entries, selectedDate]);
  const bookmarked = entries.filter((entry) => entry.favorite);
  const bookmarkedDates = new Set(bookmarked.map((entry) => entry.date));
  const writtenDates = new Set(entries.map((entry) => entry.date));
  const checkIn = checkIns[selectedDate] || {};
  const currentWeather = weather(checkIn);
  const weeklyDates = weekFor(selectedDate);
  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: offset + count }, (_, index) => index < offset ? null : index - offset + 1);
  }, [calendarMonth]);

  const openEditor = () => {
    const existing = dayEntries.at(-1);
    if (existing) {
      setDraft(existing.content);
      setPenColor(existing.penColor || "ink");
      setWritingStyle(existing.writingStyle || "hand");
      setEditingEntryId(existing.id);
    } else {
      setDraft("");
      setEditingEntryId(null);
    }
    setEditing(true);
  };
  const saveEntry = () => {
    const content = draft.trim();
    if (!content) return;
    if (editingEntryId) {
      setEntries((current) => current.map((entry) => entry.id === editingEntryId ? { ...entry, content, penColor, writingStyle } : entry));
    } else {
      setEntries((current) => [...current, { id: crypto.randomUUID(), date: selectedDate, content, favorite: false, createdAt: new Date().toISOString(), penColor, writingStyle }]);
    }
    setDraft("");
    setEditingEntryId(null);
    setEditing(false);
  };
  const toggleBookmark = (id: string) => {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;
    if (!entry.favorite && bookmarked.length >= MAX_BOOKMARKS) { setLimitMessage("Você já marcou 20 páginas. Remova um marcador para escolher outra."); return; }
    setLimitMessage("");
    setEntries((current) => current.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
  };
  const answer = (value: Answer) => {
    if (activeQuestion === null) return;
    const question = questions[activeQuestion];
    setCheckIns((current) => ({ ...current, [selectedDate]: { ...(current[selectedDate] || {}), [question.id]: value } }));
    setActiveQuestion(activeQuestion === questions.length - 1 ? null : activeQuestion + 1);
  };

  return (
    <main className="journey-layout mx-auto max-w-7xl pb-8 text-slate-800">
      <style>{`
        .font-hand { font-family: "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive; }
        @keyframes journey-in { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        .journey-layout button { transition: color .18s ease, background-color .18s ease, border-color .18s ease, transform .18s ease, opacity .18s ease; }
        .journey-layout button:active { transform: scale(.97); }
        .journey-layout > section > div.absolute,
        .journey-layout div:has(> textarea),
        .journey-layout aside > div { animation: journey-in .22s ease-out both; }
        .journey-layout div:has(> textarea:placeholder-shown) > div:first-child > p { color: #cbd5e1; font-weight: 400; }
        .journey-layout div:has(> textarea:not(:placeholder-shown)) > div:first-child > p { display: none; }
        .journey-layout > section > div.absolute { position: static; width: 100%; margin-top: 12px; padding: 6px; }
        .journey-layout > section > div.absolute .grid { gap: 1px; }
        .journey-layout > section > div.absolute .h-9 { height: 20px; font-size: 9px; }
        .journey-layout > section > div.absolute > div:first-child p { font-size: 10px; white-space: nowrap; }

        @media (min-width: 1024px) {
          .journey-layout { display: grid; grid-template-columns: minmax(0, 1fr) 118px; grid-template-rows: auto minmax(0, 1fr); column-gap: 28px; row-gap: 22px; align-items: start; }
          .journey-layout > section { grid-column: 2; grid-row: 1 / span 2; margin: 0; border-right: 0; border-bottom: 0; border-left: 1px solid #e2e8f0; padding: 0 0 0 20px; }
          .journey-layout > section > div:nth-child(2) { grid-template-columns: 1fr; }
          .journey-layout > div.grid { display: contents; }
          .journey-layout > div.grid > aside { grid-column: 1; grid-row: 1; border-left: 0; border-bottom: 1px solid #e2e8f0; padding: 0 0 20px; }
          .journey-layout > div.grid > section { grid-column: 1; grid-row: 2; }
        }

        /* Night mode keeps the notebook feeling, without a bright paper panel. */
        .dark .journey-layout { color: #e5edf8; }
        .dark .journey-layout > section,
        .dark .journey-layout > div.grid > aside { border-color: #314158; }
        .dark .journey-layout .border-slate-200 { border-color: #314158 !important; }
        .dark .journey-layout .border-slate-400 { border-color: #60728c !important; }
        .dark .journey-layout .border-slate-900 { border-color: #4c6385 !important; }
        .dark .journey-layout .bg-white { background-color: #162033 !important; }
        .dark .journey-layout .bg-white.h-1 { background-color: #e5edf8 !important; }
        .dark .journey-layout .bg-slate-100 { background-color: #24334a !important; }
        .dark .journey-layout .bg-slate-900 { background-color: #26364f !important; }
        .dark .journey-layout .bg-slate-800 { background-color: #cbd5e1 !important; }
        .dark .journey-layout .bg-blue-700 { background-color: #2563eb !important; }
        .dark .journey-layout .bg-rose-700 { background-color: #e11d48 !important; }
        .dark .journey-layout .text-slate-900,
        .dark .journey-layout .text-slate-800 { color: #f1f5f9 !important; }
        .dark .journey-layout .text-slate-700 { color: #d8e2f0 !important; }
        .dark .journey-layout .text-slate-600,
        .dark .journey-layout .text-slate-500 { color: #aebed3 !important; }
        .dark .journey-layout .text-slate-400 { color: #8ea1ba !important; }
        .dark .journey-layout .text-slate-300 { color: #647891 !important; }
        .dark .journey-layout .text-blue-800 { color: #60a5fa !important; }
        .dark .journey-layout .text-rose-800 { color: #fb7185 !important; }
        .dark .journey-layout .hover\\:text-slate-900:hover { color: #f8fafc !important; }
        .dark .journey-layout .hover\\:border-slate-400:hover,
        .dark .journey-layout .hover\\:border-slate-700:hover { border-color: #8ea1ba !important; }
        .dark .journey-layout .hover\\:bg-slate-100:hover { background-color: #26364f !important; }
        .dark .journey-layout .journey-paper {
          background-color: #151e2d !important;
          background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 34px, rgba(104, 137, 174, .3) 35px) !important;
          border-color: #354660 !important;
          box-shadow: 0 12px 28px rgba(2, 8, 23, .24);
        }
        .dark .journey-layout .journey-paper-header { background-color: rgba(21, 30, 45, .88) !important; }
        .dark .journey-layout .journey-page-margin { background-color: rgba(251, 113, 133, .28) !important; }
        .dark .journey-layout textarea { color: #e5edf8; caret-color: #e5edf8; }
        .dark .journey-layout textarea::placeholder { color: #70839c !important; }
        .dark .journey-layout div:has(> textarea:placeholder-shown) > div:first-child > p { color: #8ea1ba !important; }
        .dark .journey-layout .ring-offset-2 { --tw-ring-offset-color: #151e2d; }
        .dark .journey-layout > section > div.absolute {
          background-color: #162033;
          border-color: #354660 !important;
          box-shadow: 0 14px 30px rgba(2, 8, 23, .38);
        }
      `}</style>
      <section className="relative mb-7 border-b border-slate-200 pb-5">
        <div className="mb-3"><p className="text-sm font-medium text-slate-600">Minha Semana</p></div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">{weeklyDates.map((date) => { const day = new Date(`${date}T12:00:00`); const selected = date === selectedDate; return <button key={date} onClick={() => { setSelectedDate(date); setEditing(false); }} className={`relative min-h-14 rounded-lg border px-2 py-2 text-center transition ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}><span className="block text-[10px] uppercase opacity-60">{day.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3)}</span><span className="block text-sm font-semibold">{day.getDate()}</span>{bookmarkedDates.has(date) && <Bookmark size={12} fill="currentColor" className={`absolute right-1.5 top-1.5 ${selected ? "text-white" : "text-slate-700"}`} />}</button>; })}</div>
        <button onClick={() => setCalendarOpen((value) => !value)} className="mt-5 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">Expandir <ChevronDown size={14} className={calendarOpen ? "rotate-180" : ""} /></button>
        {calendarOpen && <div className="absolute right-0 top-7 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><button onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button><p className="text-sm font-medium text-slate-700">{shortMonth(calendarMonth)} {calendarMonth.getFullYear()}</p><button onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button></div><div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">{["S", "T", "Q", "Q", "S", "S", "D"].map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div><div className="mt-1 grid grid-cols-7 gap-1">{calendarDays.map((day, index) => { if (!day) return <span key={`empty-${index}`} />; const date = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const written = writtenDates.has(date); const marked = bookmarkedDates.has(date); return <button key={date} onClick={() => { setSelectedDate(date); setEditing(false); setCalendarOpen(false); }} className={`relative grid h-9 place-items-center rounded-lg text-xs ${date === selectedDate ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}>{day}{written && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${date === selectedDate ? "bg-white" : "bg-slate-500"}`} />}{marked && <Bookmark size={10} fill="currentColor" className={`absolute right-0.5 top-0.5 ${date === selectedDate ? "text-white" : "text-slate-700"}`} />}</button>; })}</div></div>}
        {limitMessage && <p className="mt-3 text-xs text-slate-500">{limitMessage}</p>}
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="journey-paper relative min-h-[620px] overflow-hidden rounded-xl border border-slate-200 bg-[#fffefb] shadow-sm" onClick={() => { if (!editing) openEditor(); }} style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 34px, #e7eef4 35px)", backgroundPosition: "0 132px" }}>
          <div className="journey-page-margin absolute bottom-0 left-10 top-0 w-px bg-rose-100" />
          <div className="journey-paper-header relative flex items-center justify-between border-b border-slate-200 bg-white/70 px-10 py-6"><button aria-label="Dia anterior" onClick={(event) => { event.stopPropagation(); setSelectedDate(moveDate(selectedDate, -1)); setEditing(false); }}><ChevronLeft size={18} /></button><div className="text-center"><p className="font-hand text-xl text-slate-800 capitalize">{longDate(selectedDate)}</p><p className="mt-1 text-[11px] uppercase tracking-[.16em] text-slate-400">Diário pessoal</p></div><button aria-label="Próximo dia" onClick={(event) => { event.stopPropagation(); setSelectedDate(moveDate(selectedDate, 1)); setEditing(false); }}><ChevronRight size={18} /></button></div>
          <div className="relative px-16 py-9">
            {editing ? <div onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><p className="font-hand text-xl text-slate-700">Escreva sem pressa</p><div className="flex items-center gap-2">{(["ink", "blue", "red"] as PenColor[]).map((color) => <button key={color} onClick={() => setPenColor(color)} aria-label={`Caneta ${color}`} className={`h-5 w-5 rounded-full ${color === "ink" ? "bg-slate-800" : color === "blue" ? "bg-blue-700" : "bg-rose-700"} ${penColor === color ? "ring-2 ring-slate-400 ring-offset-2" : ""}`} />)}{(["hand", "neat", "typewriter"] as WritingStyle[]).map((style) => <button key={style} onClick={() => setWritingStyle(style)} className={`ml-1 text-xs ${writingStyle === style ? "font-bold text-slate-900" : "text-slate-400"}`}>{style === "hand" ? "Aa" : style === "neat" ? "Ab" : "TT"}</button>)}</div></div><textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Meu dia hoje está sendo..." rows={12} className={`w-full resize-none bg-transparent leading-[35px] outline-none placeholder:text-slate-300 ${penClasses[penColor]} ${typeClasses[writingStyle]}`} /><div className="mt-5 flex justify-end"><button onClick={saveEntry} disabled={!draft.trim()} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"><Plus size={15} /> Salvar página</button></div></div> : <div className="cursor-text">{dayEntries.length ? <div className="space-y-7">{dayEntries.map((entry) => <article key={entry.id} className="group relative pr-9"><button onClick={(event) => { event.stopPropagation(); toggleBookmark(entry.id); }} className={`absolute right-0 top-0 ${entry.favorite ? "text-slate-800" : "text-slate-300 opacity-0 group-hover:opacity-100"}`} aria-label="Marcar página"><Bookmark size={17} fill={entry.favorite ? "currentColor" : "none"} /></button><p className={`whitespace-pre-wrap leading-[35px] ${penClasses[entry.penColor || "ink"]} ${typeClasses[entry.writingStyle || "hand"]}`}>{entry.content}</p></article>)}</div> : <p className="pt-16 text-center font-hand text-lg text-slate-300">Toque na página para começar a escrever.</p>}</div>}
          </div>
        </section>

        <aside className="self-start border-l border-slate-200 pl-6">
          {activeQuestion === null ? <div><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-400">Clima interno</p><button className="relative text-slate-700" aria-label="Resumo do dia"><Heart size={20} /><Cloud size={11} className="absolute -bottom-1 -right-1 bg-white" /></button></div><p className="mt-4 font-serif text-xl text-slate-800">{currentWeather.symbol} {currentWeather.label}</p><p className="mt-2 text-sm leading-6 text-slate-500">Um check-in breve ajuda você a entender seus padrões com o tempo.</p><button onClick={() => setActiveQuestion(0)} className="mt-5 text-sm font-medium text-slate-800 underline underline-offset-4">Fazer check-in</button></div> : <div><button onClick={() => setActiveQuestion(null)} className="float-right text-slate-400"><X size={16} /></button><p className="text-xs font-semibold uppercase tracking-[.15em] text-slate-400">Check-in {activeQuestion + 1}/{questions.length}</p><div className="mt-3 h-px bg-slate-200"><div className="h-px bg-slate-800" style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }} /></div><p className="mt-5 font-serif text-lg leading-7 text-slate-800">{questions[activeQuestion].title}</p><div className="mt-5 grid grid-cols-3 gap-2">{[...moods].reverse().map((mood, index) => { const value = (2 - index) as Answer; return <button key={mood} onClick={() => answer(value)} className="rounded-lg border border-slate-200 px-3 py-3 text-center text-slate-700 hover:border-slate-700"><span className="block text-2xl">{mood}</span><span className="mt-2 block text-xs leading-5 text-slate-500">{questions[activeQuestion].options[value]}</span></button>; })}</div></div>}
        </aside>
      </div>
    </main>
  );
}
