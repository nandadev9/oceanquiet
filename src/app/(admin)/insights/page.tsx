"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Activity, Brain, CheckCircle2, Clock3, Focus, HeartPulse, Info, ListTodo, Sparkles, TrendingUp } from "lucide-react";
import { useTasks } from "@/context/TasksContext";
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
const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function shiftDay(date: string, offset: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + offset);
  return next.toISOString().slice(0, 10);
}

function daysBack(total: number) {
  return Array.from({ length: total }, (_, index) => shiftDay(todayISO(), index - total + 1));
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(`${date}T12:00:00`)).replace(".", "");
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
      output.push({ title: "Ainda não há referências suficientes", text: "Responda o check-in no Diário para acompanhar seus padrões ao longo do tempo. Enquanto isso, os indicadores emocionais permanecem equilibrados e sem inferências.", tone: "teal" });
    } else if (latest.sleep === 2 && latest.frustration === 2) {
      output.push({ title: "Alerta de Sobrecarga Biológica", text: "A noite de sono ruim comprometeu diretamente seu filtro emocional. Não tome decisões cruciais hoje e reduza demandas que exijam alta resiliência; foque no básico e seja gentil com seus limites.", tone: "amber" });
    } else if (latest.energy === 2 && latest.selfCriticism === 2) {
      output.push({ title: "Alerta de Espiral de Cobrança", text: "Você está exausto e a mente pode transformar essa fadiga em cobrança. Pare de forçar produtividade: faça uma pausa ativa de 15 minutos longe de telas e, se for preciso continuar, use Body Doubling ou delegue tarefas burocráticas.", tone: "amber" });
    } else if (latest.thoughts === 2 && latest.tension === 2) {
      output.push({ title: "Alerta de Superaquecimento", text: "Mente acelerada e corpo tenso ao mesmo tempo pedem desaceleração antes de organizar tarefas. Caminhe por 3 minutos ou tome água fria; depois faça um despejo de pensamentos.", tone: "amber" });
    } else {
      const strongest = (Object.entries(latest) as [QuestionId, Answer][]).sort((a, b) => b[1] - a[1])[0];
      if (strongest?.[1] === 2) {
        const messages: Record<QuestionId, string> = {
          thoughts: "Seus pensamentos estão acelerados. Não force foco linear agora: silencie notificações e faça um despejo de pensamentos antes de iniciar uma tarefa.",
          energy: "Seu cansaço merece proteção. Faça uma pausa ativa de 15 minutos longe de telas e reduza a exigência do dia ao essencial.",
          selfCriticism: "A sensação de inadequação não é uma medida do seu valor. Pratique autocompaixão e retire da agenda o que não for estritamente urgente.",
          frustration: "Diante do travamento, execute apenas a menor ação física imaginável, com menos de três minutos. O primeiro passo reduz o alarme do cérebro.",
          tension: "Seu corpo está pedindo regulação. Alongue pescoço e ombros por três minutos e use respiração diafragmática antes de retomar algo exigente.",
          sleep: "Proteja seu dia após uma noite difícil: evite sobrecarregar a agenda e crie uma desaceleração noturna sem telas e estimulantes.",
        };
        output.push({ title: "Leitura do seu último check-in", text: messages[strongest[0]], tone: "navy" });
      } else {
        output.push({ title: "Sinal de estabilidade", text: "Seu último check-in está em uma faixa administrável. Preserve o ritmo e aproveite a clareza para uma prioridade de maior valor.", tone: "teal" });
      }
    }
    if (metrics.daily.length > 5) output.push({ title: "Rotina diária sobrecarregada", text: "Há mais de cinco tarefas no foco de hoje. Reduza para três prioridades essenciais e proteja sua energia de decisões demais.", tone: "amber" });
    else if (metrics.daily.length < 2) output.push({ title: "Dê estrutura ao dia", text: "Escolha de duas a três tarefas simples para criar um roteiro externo sem pressionar sua mente.", tone: "navy" });
    if (metrics.weekly.length > 10) output.push({ title: "Prioridades semanais em excesso", text: "Mais de dez prioridades aumenta o risco de cegueira temporal e frustração. Escolha apenas o que é realmente crucial.", tone: "amber" });
    else if (metrics.weekly.length < 3) output.push({ title: "Planejamento semanal aberto", text: "Defina três conquistas que fariam sua semana valer a pena e transforme-as em pequenos marcos fáceis de começar.", tone: "navy" });
    if (metrics.backlog.length > 20) output.push({ title: "Backlog pedindo triagem", text: "O acúmulo de pendências pode se tornar uma fonte de estresse visual. Arquive o que perdeu sentido e mantenha fora de vista o que não cabe nesta semana.", tone: "amber" });
    if (metrics.active.length && metrics.workStudy / metrics.active.length > .85) output.push({ title: "Equilíbrio de categorias", text: "Quase todas as tarefas ativas estão em Trabalho ou Estudos. Inclua uma tarefa simples de autocuidado ou lazer para sustentar sua energia.", tone: "amber" });
    if (!metrics.active.some((task) => task.categoryId === "saude")) output.push({ title: "Autocuidado sem espaço", text: "Não há tarefa de Saúde ou Autocuidado ativa. Sono, alimentação e movimento são parte da base de autorregulação.", tone: "navy" });
    return output.slice(0, 4);
  }, [emotional, metrics]);

  if (!ready) return <div className="h-[70vh] rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />;

  const weeklyFocus = metrics.focusMinutes.reduce((sum, value) => sum + value, 0);
  const emotionalValues = emotional.hasData ? emotional.values : [60, 60, 60, 60, 60, 60, 60];
  const emotionalLabels = emotional.hasData ? emotional.dates.map(dateLabel) : DAY_LABELS;

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
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-600">Visão de bem-estar</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Insights</h1><p className="mt-1 text-sm text-slate-500">Padrões de organização, foco e autocuidado </p></div><div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-right"><p className="text-xs font-semibold text-teal-700">Semana atual</p><p className="mt-1 text-2xl font-bold text-teal-950">{metrics.weeklyDone} <span className="text-sm font-medium">concluídas</span></p></div></div>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={<CheckCircle2 />} label="Concluídas na semana" value={String(metrics.weeklyDone)} detail={`${metrics.done.length} concluídas no total`} accent="teal" />
      <MetricCard icon={<TrendingUp />} label="Concluídas no mês" value={String(metrics.monthlyDone)} detail="com data de conclusão" accent="blue" />
      <MetricCard icon={<Focus />} label="Tempo de foco" value={`${weeklyFocus} min`} detail={weeklyFocus ? "blocos concluídos nesta semana" : "conclua um bloco de foco para registrar"} accent="violet" />
      <MetricCard icon={<ListTodo />} label="Tarefas em aberto" value={String(metrics.active.length - metrics.done.length)} detail={`${metrics.backlog.length} no backlog`} accent="slate" />
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">Atividade concluída</p><p className="mt-1 text-sm text-slate-500">Tarefas finalizadas nos últimos sete dias.</p></div><Activity className="text-teal-600" size={22} /></div><TrendChart values={metrics.weeklyActivity} labels={metrics.dates.map(dateLabel)} dark={dark} reducedMotion={reducedMotion} /><div className="mt-5 flex items-center gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-teal-500" /> Conclusões</span><span>{metrics.weeklyActivity.reduce((sum, value) => sum + value, 0)} no período</span></div></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-900">Ritmo de foco</p><p className="mt-1 text-sm text-slate-500">Minutos por dia.</p></div><Clock3 className="text-teal-600" size={22} /></div><FocusChart values={metrics.focusMinutes} labels={metrics.dates.map(dateLabel)} dark={dark} reducedMotion={reducedMotion} /><p className="mt-5 text-3xl font-bold text-slate-950">{weeklyFocus}<span className="ml-1 text-sm font-medium text-slate-500">min</span></p></div>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">Tendência emocional</p><p className="mt-1 text-sm text-slate-500">Índice de leveza baseado nos check-ins do Diário.</p></div><HeartPulse className="text-rose-500" size={22} /></div>{emotional.hasData ? <><TrendChart values={emotionalValues} labels={emotionalLabels} color="#ea5b83" dark={dark} reducedMotion={reducedMotion}/><p className="mt-5 text-xs leading-5 text-slate-500">Último registro: {emotional.latestDate ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${emotional.latestDate}T12:00:00`)) : "—"}. O índice é um retrato do check-in, não um diagnóstico.</p></> : <div className="grid min-h-52 place-items-center rounded-2xl bg-slate-50 px-8 text-center"><div><Brain className="mx-auto text-slate-300" size={32}/><p className="mt-3 font-semibold text-slate-700">Ainda não há referências suficientes.</p><p className="mt-1 text-sm leading-6 text-slate-500">Responda o check-in no Diário para acompanhar seus padrões ao longo do tempo.</p></div></div>}</div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-bold text-slate-900">Equilíbrio de áreas</p><p className="mt-1 text-sm text-slate-500">Tarefas ativas por categoria.</p></div><Sparkles className="text-teal-600" size={21}/></div><div className="space-y-4">{metrics.categoryItems.length ? metrics.categoryItems.map(({ category, count }) => <div key={category.id}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-700">{category.name}</span><span className="text-slate-400">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${toPercent(count, Math.max(...metrics.categoryItems.map((item) => item.count)))}%` }}/></div></div>) : <p className="py-10 text-center text-sm text-slate-500">Crie tarefas com categorias para visualizar o equilíbrio.</p>}</div></div>
    </section>

    <section className="mt-6"><div className="mb-4 flex items-center gap-2"><Info size={18} className="text-teal-600"/><div><h2 className="font-bold text-slate-900">Leituras e próximos passos</h2><p className="text-sm text-slate-500">Prioridade para sinais cruzados do seu check-in, seguida da organização das tarefas.</p></div></div><div className="grid gap-4 lg:grid-cols-2">{recommendations.map((item) => <Recommendation key={item.title} {...item} />)}</div><p className="mt-4 text-xs leading-5 text-slate-400">Insights de bem-estar e organização; não substituem avaliação profissional.</p></section>
  </main>;
}

function MetricCard({ icon, label, value, detail, accent }: { icon: ReactNode; label: string; value: string; detail: string; accent: "teal" | "blue" | "violet" | "slate" }) {
  const accents = { teal: "bg-teal-50 text-teal-700", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", slate: "bg-slate-100 text-slate-700" };
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-2xl ${accents[accent]}`}>{icon}</div><p className="mt-5 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></article>;
}
