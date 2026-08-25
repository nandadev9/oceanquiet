"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Activity, Brain, CheckCircle2, Clock3, Focus, HeartPulse, Info, ListTodo, Sparkles, TrendingUp } from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import { useI18n } from "@/context/LanguageContext";
import type { Locale } from "@/i18n/translations";
import { FOCUS_HISTORY_KEY } from "@/lib/ocean/focus";
import { todayISO } from "@/lib/ocean/dates";
import type { Task } from "@/lib/ocean/types";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Answer = 0 | 1 | 2;
type QuestionId = "thoughts" | "energy" | "selfCriticism" | "frustration" | "tension" | "sleep";
type CheckIn = Partial<Record<QuestionId, Answer>>;
type FocusLog = { date: string; minutes: number };
type JourneyStore = { checkIns?: Record<string, CheckIn> };

const JOURNEY_KEY = "oceanquiet.journey.v1";
type RecommendationId = "noData" | "sleepFrustration" | "energySelfCriticism" | "thoughtsTension" | "highSignal" | "stable" | "tooManyDaily" | "tooFewDaily" | "tooManyWeekly" | "tooFewWeekly" | "backlog" | "categoryBalance" | "noHealth";
type RecommendationCopy = { title: string; text: string; tone?: "navy" | "amber" | "teal" };
type InsightsCopy = {
  eyebrow: string;
  intro: string;
  currentWeek: string;
  completed: string;
  weeklyCompleted: string;
  monthlyCompleted: string;
  completedTotal: string;
  completionDate: string;
  focusTime: string;
  focusRecorded: string;
  focusEmpty: string;
  openTasks: string;
  backlog: string;
  completedActivity: string;
  completedActivityDescription: string;
  completions: string;
  inPeriod: string;
  focusRhythm: string;
  minutesPerDay: string;
  minutes: string;
  emotionalTrend: string;
  emotionalDescription: string;
  latestRecord: string;
  scoreNotice: string;
  noReferencesTitle: string;
  noReferencesDescription: string;
  areasBalance: string;
  areasDescription: string;
  noCategories: string;
  recommendationsTitle: string;
  recommendationsDescription: string;
  disclaimer: string;
  recommendations: Record<RecommendationId, RecommendationCopy>;
};

const INSIGHTS_COPY: Record<Locale, InsightsCopy> = {
  "pt-BR": {
    eyebrow: "Visão de bem-estar", intro: "Padrões de organização, foco e autocuidado", currentWeek: "Semana atual", completed: "concluídas",
    weeklyCompleted: "Concluídas na semana", monthlyCompleted: "Concluídas no mês", completedTotal: "concluídas no total", completionDate: "com data de conclusão",
    focusTime: "Tempo de foco", focusRecorded: "blocos concluídos nesta semana", focusEmpty: "conclua um bloco de foco para registrar", openTasks: "Tarefas em aberto", backlog: "no backlog",
    completedActivity: "Atividade concluída", completedActivityDescription: "Tarefas finalizadas nos últimos sete dias.", completions: "Conclusões", inPeriod: "no período",
    focusRhythm: "Ritmo de foco", minutesPerDay: "Minutos por dia.", minutes: "min", emotionalTrend: "Tendência emocional", emotionalDescription: "Índice de leveza baseado nos check-ins do Diário.", latestRecord: "Último registro", scoreNotice: "O índice é um retrato do check-in, não um diagnóstico.",
    noReferencesTitle: "Ainda não há referências suficientes.", noReferencesDescription: "Responda o check-in no Diário para acompanhar seus padrões ao longo do tempo.", areasBalance: "Equilíbrio de áreas", areasDescription: "Tarefas ativas por categoria.", noCategories: "Crie tarefas com categorias para visualizar o equilíbrio.",
    recommendationsTitle: "Leituras e próximos passos", recommendationsDescription: "Prioridade para sinais cruzados do seu check-in, seguida da organização das tarefas.", disclaimer: "Insights de bem-estar e organização; não substituem avaliação profissional.",
    recommendations: {
      noData: { title: "Ainda não há referências suficientes", text: "Responda o check-in no Diário para acompanhar seus padrões ao longo do tempo. Enquanto isso, os indicadores emocionais permanecem equilibrados e sem inferências.", tone: "teal" },
      sleepFrustration: { title: "Alerta de sobrecarga biológica", text: "Uma noite difícil e frustração alta pedem menos exigência hoje. Evite decisões cruciais, reduza as demandas e foque no básico.", tone: "amber" },
      energySelfCriticism: { title: "Alerta de espiral de cobrança", text: "Cansaço e autocrítica podem alimentar uma cobrança injusta. Faça uma pausa ativa e reduza o dia ao essencial antes de seguir.", tone: "amber" },
      thoughtsTension: { title: "Alerta de superaquecimento", text: "Mente acelerada e corpo tenso pedem desaceleração antes de organizar tarefas. Caminhe, beba água e despeje os pensamentos no papel.", tone: "amber" },
      highSignal: { title: "Leitura do seu último check-in", text: "Há um sinal de maior esforço hoje. Proteja seu ritmo, diminua estímulos e escolha apenas o próximo passo possível.", tone: "navy" },
      stable: { title: "Sinal de estabilidade", text: "Seu último check-in está em uma faixa administrável. Preserve o ritmo e aproveite a clareza para uma prioridade de maior valor.", tone: "teal" },
      tooManyDaily: { title: "Rotina diária sobrecarregada", text: "Há mais de cinco tarefas no foco de hoje. Reduza para três prioridades essenciais e proteja sua energia de decisões demais.", tone: "amber" },
      tooFewDaily: { title: "Dê estrutura ao dia", text: "Escolha de duas a três tarefas simples para criar um roteiro externo sem pressionar sua mente.", tone: "navy" },
      tooManyWeekly: { title: "Prioridades semanais em excesso", text: "Mais de dez prioridades aumenta o risco de frustração. Escolha apenas o que é realmente crucial.", tone: "amber" },
      tooFewWeekly: { title: "Planejamento semanal aberto", text: "Defina três conquistas que fariam sua semana valer a pena e transforme-as em pequenos marcos fáceis de começar.", tone: "navy" },
      backlog: { title: "Backlog pedindo triagem", text: "O acúmulo de pendências pode se tornar uma fonte de estresse visual. Arquive o que perdeu sentido e mantenha fora de vista o que não cabe nesta semana.", tone: "amber" },
      categoryBalance: { title: "Equilíbrio de categorias", text: "Quase todas as tarefas ativas estão em Trabalho ou Estudos. Inclua uma tarefa simples de autocuidado ou lazer para sustentar sua energia.", tone: "amber" },
      noHealth: { title: "Autocuidado sem espaço", text: "Não há tarefa de Saúde ou Autocuidado ativa. Sono, alimentação e movimento são parte da base de autorregulação.", tone: "navy" },
    },
  },
  en: {
    eyebrow: "Well-being view", intro: "Patterns in organization, focus, and self-care", currentWeek: "This week", completed: "completed",
    weeklyCompleted: "Completed this week", monthlyCompleted: "Completed this month", completedTotal: "completed in total", completionDate: "with a completion date",
    focusTime: "Focus time", focusRecorded: "focus blocks completed this week", focusEmpty: "complete a focus block to record it", openTasks: "Open tasks", backlog: "in backlog",
    completedActivity: "Completed activity", completedActivityDescription: "Tasks completed over the last seven days.", completions: "Completions", inPeriod: "in this period",
    focusRhythm: "Focus rhythm", minutesPerDay: "Minutes per day.", minutes: "min", emotionalTrend: "Emotional trend", emotionalDescription: "A lightness index based on journal check-ins.", latestRecord: "Latest entry", scoreNotice: "The index is a check-in snapshot, not a diagnosis.",
    noReferencesTitle: "There is not enough reference data yet.", noReferencesDescription: "Answer the check-in in your journal to follow your patterns over time.", areasBalance: "Area balance", areasDescription: "Active tasks by category.", noCategories: "Create tasks with categories to see the balance.",
    recommendationsTitle: "Readings and next steps", recommendationsDescription: "Priority is given to combined signals in your check-in, followed by task organization.", disclaimer: "Well-being and organization insights; they do not replace professional assessment.",
    recommendations: {
      noData: { title: "There is not enough reference data yet", text: "Answer the check-in in your journal to follow your patterns over time. Until then, emotional indicators remain balanced and without inferences.", tone: "teal" },
      sleepFrustration: { title: "Biological overload alert", text: "A difficult night and high frustration call for fewer demands today. Avoid crucial decisions, reduce demands, and focus on the basics.", tone: "amber" },
      energySelfCriticism: { title: "Self-pressure spiral alert", text: "Fatigue and self-criticism can feed unfair pressure. Take an active break and reduce the day to essentials before continuing.", tone: "amber" },
      thoughtsTension: { title: "Overheating alert", text: "A fast mind and a tense body call for slowing down before organizing tasks. Walk, drink water, and put your thoughts on paper.", tone: "amber" },
      highSignal: { title: "Your latest check-in", text: "There is a sign that today takes extra effort. Protect your pace, lower stimulation, and choose only the next possible step.", tone: "navy" },
      stable: { title: "A sign of stability", text: "Your latest check-in is in a manageable range. Keep your pace and use this clarity for a higher-value priority.", tone: "teal" },
      tooManyDaily: { title: "Daily routine is overloaded", text: "There are more than five tasks in today’s focus. Reduce them to three essential priorities and protect your energy from too many decisions.", tone: "amber" },
      tooFewDaily: { title: "Give the day some structure", text: "Choose two or three simple tasks to create an external guide without putting pressure on your mind.", tone: "navy" },
      tooManyWeekly: { title: "Too many weekly priorities", text: "More than ten priorities increases the risk of frustration. Choose only what is truly crucial.", tone: "amber" },
      tooFewWeekly: { title: "Weekly planning is open", text: "Define three outcomes that would make your week worthwhile and turn them into small, easy-to-start milestones.", tone: "navy" },
      backlog: { title: "Backlog needs sorting", text: "A pile of pending tasks can become visual stress. Archive what no longer matters and keep out of sight what does not fit this week.", tone: "amber" },
      categoryBalance: { title: "Category balance", text: "Almost all active tasks are in Work or Study. Add a simple self-care or leisure task to sustain your energy.", tone: "amber" },
      noHealth: { title: "No room for self-care", text: "There is no active Health or Self-care task. Sleep, food, and movement are part of the foundation for self-regulation.", tone: "navy" },
    },
  },
  es: {
    eyebrow: "Visión de bienestar", intro: "Patrones de organización, enfoque y autocuidado", currentWeek: "Semana actual", completed: "completadas",
    weeklyCompleted: "Completadas en la semana", monthlyCompleted: "Completadas en el mes", completedTotal: "completadas en total", completionDate: "con fecha de finalización",
    focusTime: "Tiempo de enfoque", focusRecorded: "bloques de enfoque completados esta semana", focusEmpty: "completa un bloque de enfoque para registrarlo", openTasks: "Tareas abiertas", backlog: "en el backlog",
    completedActivity: "Actividad completada", completedActivityDescription: "Tareas finalizadas en los últimos siete días.", completions: "Finalizaciones", inPeriod: "en el período",
    focusRhythm: "Ritmo de enfoque", minutesPerDay: "Minutos por día.", minutes: "min", emotionalTrend: "Tendencia emocional", emotionalDescription: "Índice de ligereza basado en los check-ins del diario.", latestRecord: "Último registro", scoreNotice: "El índice es un retrato del check-in, no un diagnóstico.",
    noReferencesTitle: "Aún no hay suficientes referencias.", noReferencesDescription: "Responde el check-in en el diario para acompañar tus patrones con el tiempo.", areasBalance: "Equilibrio de áreas", areasDescription: "Tareas activas por categoría.", noCategories: "Crea tareas con categorías para visualizar el equilibrio.",
    recommendationsTitle: "Lecturas y próximos pasos", recommendationsDescription: "Se da prioridad a las señales cruzadas de tu check-in, seguidas de la organización de tareas.", disclaimer: "Insights de bienestar y organización; no sustituyen una evaluación profesional.",
    recommendations: {
      noData: { title: "Aún no hay suficientes referencias", text: "Responde el check-in en el diario para acompañar tus patrones con el tiempo. Mientras tanto, los indicadores emocionales permanecen equilibrados y sin inferencias.", tone: "teal" },
      sleepFrustration: { title: "Alerta de sobrecarga biológica", text: "Una noche difícil y mucha frustración piden menos exigencia hoy. Evita decisiones cruciales, reduce las demandas y céntrate en lo básico.", tone: "amber" },
      energySelfCriticism: { title: "Alerta de espiral de autoexigencia", text: "El cansancio y la autocrítica pueden alimentar una presión injusta. Haz una pausa activa y reduce el día a lo esencial antes de continuar.", tone: "amber" },
      thoughtsTension: { title: "Alerta de sobrecalentamiento", text: "Una mente acelerada y un cuerpo tenso piden desacelerar antes de organizar tareas. Camina, bebe agua y escribe tus pensamientos.", tone: "amber" },
      highSignal: { title: "Lectura de tu último check-in", text: "Hay una señal de que hoy requiere más esfuerzo. Protege tu ritmo, reduce los estímulos y elige solo el próximo paso posible.", tone: "navy" },
      stable: { title: "Señal de estabilidad", text: "Tu último check-in está en una franja manejable. Conserva el ritmo y aprovecha la claridad para una prioridad de mayor valor.", tone: "teal" },
      tooManyDaily: { title: "Rutina diaria sobrecargada", text: "Hay más de cinco tareas en el enfoque de hoy. Redúcelas a tres prioridades esenciales y protege tu energía de demasiadas decisiones.", tone: "amber" },
      tooFewDaily: { title: "Dale estructura al día", text: "Elige dos o tres tareas simples para crear una guía externa sin presionar tu mente.", tone: "navy" },
      tooManyWeekly: { title: "Demasiadas prioridades semanales", text: "Más de diez prioridades aumenta el riesgo de frustración. Elige solo lo que sea realmente crucial.", tone: "amber" },
      tooFewWeekly: { title: "Planificación semanal abierta", text: "Define tres logros que harían que tu semana valiera la pena y conviértelos en pequeños hitos fáciles de empezar.", tone: "navy" },
      backlog: { title: "El backlog necesita revisión", text: "La acumulación de pendientes puede convertirse en estrés visual. Archiva lo que perdió sentido y deja fuera de vista lo que no cabe esta semana.", tone: "amber" },
      categoryBalance: { title: "Equilibrio de categorías", text: "Casi todas las tareas activas están en Trabajo o Estudios. Incluye una tarea sencilla de autocuidado u ocio para sostener tu energía.", tone: "amber" },
      noHealth: { title: "Autocuidado sin espacio", text: "No hay tarea activa de Salud o Autocuidado. El sueño, la alimentación y el movimiento son parte de la base de autorregulación.", tone: "navy" },
    },
  },
};

function shiftDay(date: string, offset: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + offset);
  return next.toISOString().slice(0, 10);
}

function daysBack(total: number) {
  return Array.from({ length: total }, (_, index) => shiftDay(todayISO(), index - total + 1));
}

function dateLabel(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(`${date}T12:00:00`)).replace(".", "");
}

function dayLabels(locale: string) {
  return Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, index + 1)).replace(".", ""));
}

function completedOn(task: Task, date: string) {
  return task.status === "done" && task.completedAt?.slice(0, 10) === date;
}

function toPercent(value: number, max: number) {
  return Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
}

function Recommendation({ title, text, tone = "navy" }: { title: string; text: string; tone?: "navy" | "amber" | "teal" }) {
  const color = tone === "amber" ? "border-amber-200 bg-amber-50/70 text-amber-950" : tone === "teal" ? "border-teal-200 bg-teal-50/70 text-teal-950" : "border-slate-200 bg-slate-50 text-slate-900";
  return <article className={`rounded-2xl border p-5 ${color}`}><p className="text-sm font-bold">{title}</p><p className="mt-2 text-sm leading-6 opacity-80">{text}</p></article>;
}

function TrendChart({ values, labels, color = "#0f9ca8", dark, reducedMotion }: { values: number[]; labels: string[]; color?: string; dark: boolean; reducedMotion: boolean }) {
  const axisColor = dark ? "#8ea1ba" : "#94a3b8";
  const gridColor = dark ? "#29384d" : "#e2e8f0";
  const options = useMemo<ApexOptions>(() => ({
    chart: {
      type: "area",
      height: 184,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      animations: {
        enabled: !reducedMotion,
        easing: "easeinout",
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    colors: [color],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3, lineCap: "round" },
    fill: { type: "gradient", gradient: { shadeIntensity: .2, opacityFrom: .3, opacityTo: .02, stops: [0, 92, 100] } },
    markers: { size: 0, strokeColors: dark ? "#162033" : "#fff", strokeWidth: 3, hover: { size: 6 } },
    grid: { borderColor: gridColor, strokeDashArray: 4, padding: { left: 0, right: 5, top: 6, bottom: -3 } },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labels.map(() => axisColor), fontSize: "11px", fontWeight: 500 } },
    },
    yaxis: { show: false, min: 0 },
    tooltip: { theme: dark ? "dark" : "light", x: { show: true }, y: { formatter: (value: number) => String(value) } },
  }), [axisColor, color, dark, gridColor, labels, reducedMotion]);

  return <div className="insight-apex-chart -mx-1" aria-label="Gráfico de tendência"><ApexChart key={`${color}-${values.join("-")}-${dark}-${reducedMotion}`} options={options} series={[{ name: "Índice", data: values }]} type="area" height={184} /></div>;
}

function FocusChart({ values, labels, dark, reducedMotion }: { values: number[]; labels: string[]; dark: boolean; reducedMotion: boolean }) {
  const axisColor = dark ? "#8ea1ba" : "#94a3b8";
  const options = useMemo<ApexOptions>(() => ({
    chart: {
      type: "bar",
      height: 162,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      animations: {
        enabled: !reducedMotion,
        easing: "easeinout",
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    colors: ["#14b8a6"],
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 5, borderRadiusApplication: "end", columnWidth: "42%" } },
    fill: { type: "gradient", gradient: { shade: "light", type: "vertical", shadeIntensity: .15, opacityFrom: 1, opacityTo: .72, stops: [0, 100] } },
    grid: { show: false, padding: { left: -6, right: -6, top: -9, bottom: -7 } },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labels.map(() => axisColor), fontSize: "10px", fontWeight: 500 } },
    },
    yaxis: { show: false, min: 0 },
    tooltip: { theme: dark ? "dark" : "light", x: { show: true }, y: { formatter: (value: number) => `${value} min` } },
  }), [axisColor, dark, labels, reducedMotion]);

  return <div className="insight-apex-chart -mx-2 mt-5" aria-label="Gráfico de minutos de foco"><ApexChart key={`${values.join("-")}-${dark}-${reducedMotion}`} options={options} series={[{ name: "Foco", data: values }]} type="bar" height={162} /></div>;
}

function useReducedMotion() {
  // Start conservatively so a client that requests reduced motion never sees a first-frame animation.
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useDarkTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

export default function InsightsPage() {
  const { ready, tasks, categories } = useTasks();
  const { dateLocale, locale } = useI18n();
  const copy = INSIGHTS_COPY[locale];
  const [checkIns, setCheckIns] = useState<Record<string, CheckIn>>({});
  const [focusLog, setFocusLog] = useState<FocusLog[]>([]);
  const reducedMotion = useReducedMotion();
  const dark = useDarkTheme();

  useEffect(() => {
    try {
      const journey = JSON.parse(localStorage.getItem(JOURNEY_KEY) || "{}") as JourneyStore;
      const focus = JSON.parse(localStorage.getItem(FOCUS_HISTORY_KEY) || "[]") as FocusLog[];
      queueMicrotask(() => {
        setCheckIns(journey.checkIns || {});
        setFocusLog(Array.isArray(focus) ? focus : []);
      });
    } catch {
      queueMicrotask(() => {
        setCheckIns({});
        setFocusLog([]);
      });
    }
  }, []);

  const metrics = useMemo(() => {
    const dates = daysBack(7);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const active = tasks.filter((task) => !task.archivedAt);
    const done = active.filter((task) => task.status === "done");
    const weeklyDone = done.filter((task) => task.completedAt && new Date(task.completedAt) >= new Date(`${dates[0]}T00:00:00`)).length;
    const monthlyDone = done.filter((task) => task.completedAt && new Date(task.completedAt) >= monthStart).length;
    const daily = active.filter((task) => task.board === "daily");
    const weekly = active.filter((task) => task.board === "weekly");
    const backlog = active.filter((task) => task.board === "inbox");
    const weeklyActivity = dates.map((date) => active.filter((task) => completedOn(task, date)).length);
    const focusMinutes = dates.map((date) => focusLog.filter((item) => item.date === date).reduce((sum, item) => sum + item.minutes, 0));
    const categoryItems = categories.map((category) => ({ category, count: active.filter((task) => task.categoryId === category.id).length })).filter((item) => item.count > 0);
    const workStudy = active.filter((task) => ["trabalho", "estudos"].includes(task.categoryId)).length;
    return { dates, active, done, weeklyDone, monthlyDone, daily, weekly, backlog, weeklyActivity, focusMinutes, categoryItems, workStudy };
  }, [tasks, categories, focusLog]);

  const emotional = useMemo(() => {
    const dates = Object.keys(checkIns).filter((date) => Object.keys(checkIns[date]).length).sort();
    const recent = dates.slice(-7);
    const values = recent.map((date) => {
      const answers = Object.values(checkIns[date]);
      const average = answers.reduce<number>((sum, value) => sum + value, 0) / Math.max(answers.length, 1);
      return Math.round(100 - average * 50);
    });
    const latestDate = dates.at(-1);
    return { hasData: dates.length > 0, dates: recent, values, latest: latestDate ? checkIns[latestDate] : {}, latestDate };
  }, [checkIns]);

  const recommendations = useMemo(() => {
    const output: { title: string; text: string; tone?: "navy" | "amber" | "teal" }[] = [];
    const latest = emotional.latest;
    if (!emotional.hasData) {
      output.push(copy.recommendations.noData);
    } else if (latest.sleep === 2 && latest.frustration === 2) {
      output.push(copy.recommendations.sleepFrustration);
    } else if (latest.energy === 2 && latest.selfCriticism === 2) {
      output.push(copy.recommendations.energySelfCriticism);
    } else if (latest.thoughts === 2 && latest.tension === 2) {
      output.push(copy.recommendations.thoughtsTension);
    } else {
      const strongest = (Object.entries(latest) as [QuestionId, Answer][]).sort((a, b) => b[1] - a[1])[0];
      if (strongest?.[1] === 2) {
        output.push(copy.recommendations.highSignal);
      } else {
        output.push(copy.recommendations.stable);
      }
    }
    if (metrics.daily.length > 5) output.push(copy.recommendations.tooManyDaily);
    else if (metrics.daily.length < 2) output.push(copy.recommendations.tooFewDaily);
    if (metrics.weekly.length > 10) output.push(copy.recommendations.tooManyWeekly);
    else if (metrics.weekly.length < 3) output.push(copy.recommendations.tooFewWeekly);
    if (metrics.backlog.length > 20) output.push(copy.recommendations.backlog);
    if (metrics.active.length && metrics.workStudy / metrics.active.length > .85) output.push(copy.recommendations.categoryBalance);
    if (!metrics.active.some((task) => task.categoryId === "saude")) output.push(copy.recommendations.noHealth);
    return output.slice(0, 4);
  }, [copy, emotional, metrics]);

  if (!ready) return <div className="h-[70vh] rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />;

  const weeklyFocus = metrics.focusMinutes.reduce((sum, value) => sum + value, 0);
  const emotionalValues = emotional.hasData ? emotional.values : [60, 60, 60, 60, 60, 60, 60];
  const emotionalLabels = emotional.hasData ? emotional.dates.map((date) => dateLabel(date, dateLocale)) : dayLabels(dateLocale);

  return <main className="insights-page mx-auto max-w-7xl pb-10">
    <style>{`
      .dark .insights-page { color: #dbe7f5; }
      .dark .insights-page .border-slate-200 { border-color: #29384d; }
      .dark .insights-page .bg-white { background-color: #162033; }
      .dark .insights-page .bg-slate-50 { background-color: #111b2d; }
      .dark .insights-page .bg-slate-100 { background-color: #26364b; }
      .dark .insights-page .bg-slate-950 { background-color: #080f1e; }
      .dark .insights-page .text-slate-950,
      .dark .insights-page .text-slate-900 { color: #f8fafc; }
      .dark .insights-page .text-slate-700 { color: #d6e0ee; }
      .dark .insights-page .text-slate-500 { color: #9aabc2; }
      .dark .insights-page .text-slate-400 { color: #7f91aa; }
      .dark .insights-page .text-slate-300 { color: #62748d; }
      .dark .insights-page .border-teal-100 { border-color: rgba(45, 212, 191, .26); }
      .dark .insights-page .bg-teal-50 { background-color: rgba(20, 184, 166, .12); }
      .dark .insights-page .text-teal-950 { color: #ccfbf1; }
      .dark .insights-page .text-teal-700,
      .dark .insights-page .text-teal-600 { color: #5eead4; }
      .dark .insights-page .bg-blue-50 { background-color: rgba(96, 165, 250, .12); }
      .dark .insights-page .text-blue-700 { color: #93c5fd; }
      .dark .insights-page .bg-violet-50 { background-color: rgba(167, 139, 250, .12); }
      .dark .insights-page .text-violet-700 { color: #c4b5fd; }
      .dark .insights-page [class*="bg-amber-50"] { background-color: rgba(245, 158, 11, .12); }
      .dark .insights-page [class*="border-amber-200"] { border-color: rgba(251, 191, 36, .32); }
      .dark .insights-page [class*="text-amber-950"] { color: #fef3c7; }
      .dark .insights-page [class*="bg-teal-50/"] { background-color: rgba(20, 184, 166, .12); }
      .dark .insights-page [class*="border-teal-200"] { border-color: rgba(45, 212, 191, .28); }
      .dark .insights-page [class*="text-teal-950"] { color: #ccfbf1; }
      .dark .insights-page line[stroke="#e2e8f0"] { stroke: #334155; }
      .dark .insights-page circle[fill="white"] { fill: #162033; }
    `}</style>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-600">{copy.eyebrow}</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Insights</h1><p className="mt-1 text-sm text-slate-500">{copy.intro}</p></div><div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-right"><p className="text-xs font-semibold text-teal-700">{copy.currentWeek}</p><p className="mt-1 text-2xl font-bold text-teal-950">{metrics.weeklyDone} <span className="text-sm font-medium">{copy.completed}</span></p></div></div>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={<CheckCircle2 />} label={copy.weeklyCompleted} value={String(metrics.weeklyDone)} detail={`${metrics.done.length} ${copy.completedTotal}`} accent="teal" />
      <MetricCard icon={<TrendingUp />} label={copy.monthlyCompleted} value={String(metrics.monthlyDone)} detail={copy.completionDate} accent="blue" />
      <MetricCard icon={<Focus />} label={copy.focusTime} value={`${weeklyFocus} ${copy.minutes}`} detail={weeklyFocus ? copy.focusRecorded : copy.focusEmpty} accent="violet" />
      <MetricCard icon={<ListTodo />} label={copy.openTasks} value={String(metrics.active.length - metrics.done.length)} detail={`${metrics.backlog.length} ${copy.backlog}`} accent="slate" />
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">{copy.completedActivity}</p><p className="mt-1 text-sm text-slate-500">{copy.completedActivityDescription}</p></div><Activity className="text-teal-600" size={22} /></div><TrendChart values={metrics.weeklyActivity} labels={metrics.dates.map((date) => dateLabel(date, dateLocale))} dark={dark} reducedMotion={reducedMotion} /><div className="mt-5 flex items-center gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-teal-500" /> {copy.completions}</span><span>{metrics.weeklyActivity.reduce((sum, value) => sum + value, 0)} {copy.inPeriod}</span></div></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-900">{copy.focusRhythm}</p><p className="mt-1 text-sm text-slate-500">{copy.minutesPerDay}</p></div><Clock3 className="text-teal-600" size={22} /></div><FocusChart values={metrics.focusMinutes} labels={metrics.dates.map((date) => dateLabel(date, dateLocale))} dark={dark} reducedMotion={reducedMotion} /><p className="mt-5 text-3xl font-bold text-slate-950">{weeklyFocus}<span className="ml-1 text-sm font-medium text-slate-500">{copy.minutes}</span></p></div>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">{copy.emotionalTrend}</p><p className="mt-1 text-sm text-slate-500">{copy.emotionalDescription}</p></div><HeartPulse className="text-rose-500" size={22} /></div>{emotional.hasData ? <><TrendChart values={emotionalValues} labels={emotionalLabels} color="#ea5b83" dark={dark} reducedMotion={reducedMotion}/><p className="mt-5 text-xs leading-5 text-slate-500">{copy.latestRecord}: {emotional.latestDate ? new Intl.DateTimeFormat(dateLocale, { day: "2-digit", month: "short" }).format(new Date(`${emotional.latestDate}T12:00:00`)) : "—"}. {copy.scoreNotice}</p></> : <div className="grid min-h-52 place-items-center rounded-2xl bg-slate-50 px-8 text-center"><div><Brain className="mx-auto text-slate-300" size={32}/><p className="mt-3 font-semibold text-slate-700">{copy.noReferencesTitle}</p><p className="mt-1 text-sm leading-6 text-slate-500">{copy.noReferencesDescription}</p></div></div>}</div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">{copy.areasBalance}</p><p className="mt-1 text-sm text-slate-500">{copy.areasDescription}</p></div><Sparkles className="text-teal-600" size={21}/></div><div className="space-y-4">{metrics.categoryItems.length ? metrics.categoryItems.map(({ category, count }) => <div key={category.id}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-700">{category.name}</span><span className="text-slate-400">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${toPercent(count, Math.max(...metrics.categoryItems.map((item) => item.count)))}%` }}/></div></div>) : <p className="py-10 text-center text-sm text-slate-500">{copy.noCategories}</p>}</div></div>
    </section>

    <section className="mt-6"><div className="mb-4 flex items-center gap-2"><Info size={18} className="text-teal-600"/><div><h2 className="font-bold text-slate-900">{copy.recommendationsTitle}</h2><p className="text-sm text-slate-500">{copy.recommendationsDescription}</p></div></div><div className="grid gap-4 lg:grid-cols-2">{recommendations.map((item) => <Recommendation key={item.title} {...item} />)}</div><p className="mt-4 text-xs leading-5 text-slate-400">{copy.disclaimer}</p></section>
  </main>;
}

function MetricCard({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string; detail: string; accent: "teal" | "blue" | "violet" | "slate" }) {
  const accents = { teal: "bg-teal-50 text-teal-700", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", slate: "bg-slate-100 text-slate-700" };
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-2xl ${accents[accent]}`}>{icon}</div><p className="mt-5 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></article>;
}
