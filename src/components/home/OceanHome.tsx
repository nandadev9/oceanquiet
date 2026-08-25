"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookHeart,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  ListChecks,
  MoonStar,
  Sparkles,
  Sun,
  Sunrise,
  Target,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import WeatherCard from "./WeatherCard";

const DAILY_NOTES = [
  "Você não precisa resolver a semana inteira hoje. Escolha o próximo passo possível.",
  "Um ritmo gentil também é um ritmo produtivo. Deixe espaço entre uma coisa e outra.",
  "Quando tudo parecer urgente, volte ao corpo: água, ar, uma pausa e só então decida.",
  "Começar pequeno não diminui a importância do que você quer construir.",
  "Organizar a mente também pode ser tirar uma única tarefa da frente, sem pressa.",
  "Seu foco não precisa ser perfeito para ser valioso. Proteja alguns minutos de presença.",
  "Há dias de avançar e dias de sustentar. Os dois fazem parte da jornada.",
  "Uma lista curta pode ser mais acolhedora que uma lista completa.",
  "O que cabe em cinco minutos merece existir: pequenos começos criam movimento.",
  "Se o plano mudar, você não falhou. Apenas está encontrando outro caminho.",
  "Terminar uma pequena tarefa é uma forma de dizer ao seu cérebro: eu consigo continuar.",
  "Cuide do seu amanhã deixando uma coisa um pouco mais leve para a pessoa que você será.",
] as const;

type QuickLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  iconWrapClassName: string;
};

type DayPhase = "morning" | "afternoon" | "night";

function getDayPhase(hour: number | null): DayPhase {
  if (hour === null || hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

function GreetingSkyScene({ phase }: { phase: DayPhase }) {
  const isNight = phase === "night";
  const isAfternoon = phase === "afternoon";

  return (
    <div
      className={`ocean-greeting-scene ocean-greeting-scene--${phase}`}
      role="img"
      aria-label={isNight ? "Uma lua crescente entre estrelas" : isAfternoon ? "Um sol alaranjado no entardecer" : "Um sol brilhante no céu da manhã"}
    >
      <div className="ocean-greeting-scene__glow" />
      {!isNight ? (
        <>
          <div className="ocean-greeting-scene__sun" />
          <div className="ocean-greeting-scene__rays" aria-hidden="true">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <span key={angle} style={{ transform: `rotate(${angle}deg) translateY(-55px)` }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="ocean-greeting-scene__moon" aria-hidden="true">
            <span />
          </div>
          <div className="ocean-greeting-scene__stars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </>
      )}
      <div className="ocean-greeting-scene__cloud ocean-greeting-scene__cloud--far" aria-hidden="true" />
      <div className="ocean-greeting-scene__cloud ocean-greeting-scene__cloud--near" aria-hidden="true" />
      <div className="ocean-greeting-scene__wave ocean-greeting-scene__wave--back" aria-hidden="true" />
      <div className="ocean-greeting-scene__wave ocean-greeting-scene__wave--front" aria-hidden="true" />
    </div>
  );
}

function getGreeting(hour: number | null) {
  if (hour === null) return "Olá";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(name?: string | null) {
  const value = name?.trim().split(/\s+/)[0];
  return value || "você";
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readableDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .replace(/^./, (letter) => letter.toUpperCase());
}

function TaskRow({ title, done, category }: { title: string; done: boolean; category?: string }) {
  return (
    <li className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.045]">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
          done
            ? "border-teal-500 bg-teal-500 text-white"
            : "border-slate-300 bg-white text-transparent group-hover:border-teal-400 dark:border-slate-600 dark:bg-slate-900"
        }`}
      >
        <CheckCircle2 size={13} strokeWidth={3} />
      </span>
      <span className={`min-w-0 flex-1 truncate text-sm font-medium ${done ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
        {title}
      </span>
      {category ? <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 sm:inline dark:bg-white/5 dark:text-slate-400">{category}</span> : null}
    </li>
  );
}

function QuickAccessCard({ item }: { item: QuickLink }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-950/[0.07] dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-teal-500/30 dark:hover:shadow-black/20"
    >
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.iconWrapClassName}`}>
        <Icon className={item.iconClassName} size={21} strokeWidth={1.9} />
      </span>
      <p className="mt-5 text-base font-bold text-slate-900 dark:text-white">{item.label}</p>
      <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
      <ArrowRight className="absolute bottom-5 right-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-teal-600 dark:text-slate-600 dark:group-hover:text-teal-300" size={19} />
    </Link>
  );
}

export default function OceanHome() {
  const { user } = useAuth();
  const { ready, activeTasks, categories, schedule } = useTasks();
  const [hour, setHour] = useState<number | null>(null);
  const [today, setToday] = useState("");
  const [todayLabel, setTodayLabel] = useState("Hoje");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = new Date();
      setHour(now.getHours());
      setToday(localDateKey(now));
      setTodayLabel(readableDate(now));
      setQuoteIndex(now.getDate() % DAILY_NOTES.length);
      setEntered(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const overview = useMemo(() => {
    const active = activeTasks.filter((task) => task.status !== "done");
    const done = activeTasks.filter((task) => task.status === "done");
    const daily = active.filter((task) => task.board === "daily");
    const scheduledToday = today ? schedule.filter((block) => block.date === today) : [];
    const categoryName = (categoryId: string) => categories.find((category) => category.id === categoryId)?.name;
    const visibleTasks = [...daily, ...active.filter((task) => task.board !== "daily")].slice(0, 4);
    const progressDone = done.filter((task) => task.completedAt?.slice(0, 10) === today).length;

    return {
      active,
      daily,
      done,
      scheduledToday,
      visibleTasks,
      progressDone,
      categoryName,
    };
  }, [activeTasks, categories, schedule, today]);

  const quickLinks: QuickLink[] = [
    {
      href: "/rotina",
      label: "Minha rotina",
      description: overview.daily.length ? `${overview.daily.length} prioridade${overview.daily.length === 1 ? "" : "s"} para hoje` : "Dê um ritmo gentil ao seu dia",
      icon: CalendarDays,
      iconClassName: "text-teal-700 dark:text-teal-300",
      iconWrapClassName: "bg-teal-50 dark:bg-teal-400/10",
    },
    {
      href: "/tasks",
      label: "Minhas tarefas",
      description: overview.active.length ? `${overview.active.length} tarefa${overview.active.length === 1 ? "" : "s"} aguardando você` : "Tudo tranquilo por aqui",
      icon: ListChecks,
      iconClassName: "text-blue-700 dark:text-blue-300",
      iconWrapClassName: "bg-blue-50 dark:bg-blue-400/10",
    },
    {
      href: "/foco",
      label: "Foco agora",
      description: "Reserve um bloco para o que importa",
      icon: Target,
      iconClassName: "text-violet-700 dark:text-violet-300",
      iconWrapClassName: "bg-violet-50 dark:bg-violet-400/10",
    },
    {
      href: "/jornada",
      label: "Minha jornada",
      description: "Escreva, respire e perceba seu dia",
      icon: BookHeart,
      iconClassName: "text-rose-700 dark:text-rose-300",
      iconWrapClassName: "bg-rose-50 dark:bg-rose-400/10",
    },
  ];

  const transitionClass = entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0";
  const greetingIcon =
    hour !== null && hour >= 18 ? (
      <MoonStar size={18} />
    ) : hour !== null && hour >= 12 ? (
      <Sun size={18} />
    ) : (
      <Sunrise size={18} />
    );
  const dayPhase = getDayPhase(hour);
  const heroTheme = {
    morning: "from-[#092d43] via-[#0b6476] to-[#2e92ab]",
    afternoon: "from-[#162b4d] via-[#9a514b] to-[#df8d4c]",
    night: "from-[#06162f] via-[#132d59] to-[#36386d]",
  }[dayPhase];

  return (
    <main className="mx-auto max-w-7xl pb-10">
      <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${heroTheme} px-6 py-7 text-white shadow-xl shadow-teal-950/15 transition-all duration-700 motion-reduce:transition-none md:px-8 md:py-8 ${transitionClass}`}>
        <GreetingSkyScene phase={dayPhase} />
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-2/3 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative z-10 max-w-xl py-1 pr-16 sm:pr-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
            {greetingIcon}
            <span>{todayLabel}</span>
          </div>
          <p className="mt-6 text-sm font-medium text-cyan-50/70">{getGreeting(hour)},</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {firstName(user?.name)} <span className="inline-block origin-bottom-left transition-transform duration-300 hover:rotate-12">✦</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-cyan-50/80 sm:text-base">
            Seu espaço para organizar o que importa e cuidar do seu ritmo, um dia de cada vez.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rotina" className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-slate-950/10 transition-all hover:-translate-y-0.5 hover:bg-cyan-50">
              Ver minha rotina
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/jornada" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.15]">
              <BookHeart size={17} />
              Abrir diário
            </Link>
          </div>
        </div>
      </section>

      <section className={`mt-6 grid gap-5 lg:grid-cols-12 ${transitionClass}`} style={{ transitionDelay: "100ms" }}>
        <div className="lg:col-span-4">
          <WeatherCard />
        </div>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">O seu dia, com calma</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Um retrato breve para ajudar você a começar.</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
              <CircleDot size={20} />
            </span>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/[0.045]">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{overview.daily.length}</p>
              <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-400">no foco de hoje</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/[0.045]">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{overview.scheduledToday.length}</p>
              <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-400">bloco{overview.scheduledToday.length === 1 ? "" : "s"} reservado{overview.scheduledToday.length === 1 ? "" : "s"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/[0.045]">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{overview.progressDone}</p>
              <p className="mt-1 text-[11px] font-medium leading-4 text-slate-500 dark:text-slate-400">feita{overview.progressDone === 1 ? "" : "s"} hoje</p>
            </div>
          </div>
          <Link href="/tasks" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition-colors hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            Organizar tarefas <ChevronRight size={16} />
          </Link>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-violet-400/15 dark:from-violet-500/10 dark:via-slate-900 dark:to-rose-500/10 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/75 text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-300">
              <Sparkles size={19} />
            </span>
            <button
              type="button"
              onClick={() => setQuoteIndex((index) => (index + 1) % DAILY_NOTES.length)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 transition-colors hover:bg-white/75 dark:text-violet-300 dark:hover:bg-white/10"
              aria-label="Ver outra dica"
            >
              Outra dica
            </button>
          </div>
          <p className="mt-7 text-sm font-bold text-slate-900 dark:text-white">Para lembrar agora</p>
          <p key={quoteIndex} className="mt-2 text-sm leading-6 text-slate-600 animate-in fade-in duration-300 dark:text-slate-300">
            “{DAILY_NOTES[quoteIndex]}”
          </p>
        </article>
      </section>

      <section className={`mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)] ${transitionClass}`} style={{ transitionDelay: "170ms" }}>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">Próximas a ganhar atenção</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Uma lista curta para não carregar tudo de uma vez.</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
              <Clock3 size={20} />
            </span>
          </div>

          {ready && overview.visibleTasks.length ? (
            <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {overview.visibleTasks.map((task) => (
                <TaskRow key={task.id} title={task.title} done={task.status === "done"} category={overview.categoryName(task.categoryId)} />
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-7 text-center dark:bg-white/[0.045]">
              <CheckCircle2 className="mx-auto text-teal-500" size={28} />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Sua lista está leve por enquanto.</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione uma tarefa quando algo pedir um lugar para existir.</p>
            </div>
          )}
          <Link href="/tasks" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition-colors hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            Ver todas as tarefas <ArrowRight size={16} />
          </Link>
        </article>

        <article className="relative overflow-hidden rounded-3xl bg-[#102f43] p-6 text-white shadow-lg shadow-slate-950/10 dark:bg-[#0b1c30]">
          <div className="pointer-events-none absolute -right-10 top-6 h-36 w-36 rounded-full bg-cyan-300/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-48 rounded-full bg-violet-400/15 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-cyan-100">
              <Brain size={20} />
            </span>
            <p className="mt-5 text-base font-bold">Seu bem-estar também tem espaço aqui.</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-cyan-50/75">
              Faça um check-in rápido no diário. Com o tempo, seus Insights transformam pequenos registros em padrões úteis.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/jornada" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-cyan-50">
                Fazer check-in <ArrowRight size={16} />
              </Link>
              <Link href="/insights" className="text-sm font-semibold text-cyan-50/85 underline-offset-4 transition-colors hover:text-white hover:underline">
                Ver meus Insights
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className={`mt-7 ${transitionClass}`} style={{ transitionDelay: "240ms" }}>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Aonde você quer ir agora?</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tudo o que você precisa, sem procurar demais.</p>
          </div>
          <Link href="/insights" className="hidden items-center gap-1 text-sm font-bold text-teal-700 transition-colors hover:text-teal-600 sm:inline-flex dark:text-teal-300 dark:hover:text-teal-200">
            Ver visão geral <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => <QuickAccessCard key={item.href} item={item} />)}
        </div>
      </section>

      <style>{`
        .ocean-greeting-scene {
          position: absolute;
          inset: 0;
          isolation: isolate;
          overflow: hidden;
          pointer-events: none;
        }

        .ocean-greeting-scene--morning {
          background: linear-gradient(150deg, rgba(85, 208, 224, 0.44), rgba(19, 107, 137, 0.3) 55%, rgba(5, 50, 77, 0.18));
        }

        .ocean-greeting-scene--afternoon {
          background: linear-gradient(150deg, rgba(255, 191, 102, 0.38), rgba(216, 108, 72, 0.28) 56%, rgba(42, 64, 102, 0.3));
        }

        .ocean-greeting-scene--night {
          background: linear-gradient(150deg, rgba(72, 107, 187, 0.32), rgba(24, 48, 104, 0.26) 56%, rgba(7, 16, 43, 0.16));
        }

        .ocean-greeting-scene__glow {
          position: absolute;
          top: -34px;
          right: 18px;
          width: 154px;
          height: 154px;
          border-radius: 999px;
          background: rgba(255, 232, 151, 0.36);
          filter: blur(23px);
          animation: ocean-home-glow 5.5s ease-in-out infinite;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__glow {
          top: 8px;
          right: 0;
          background: rgba(255, 157, 80, 0.43);
        }

        .ocean-greeting-scene--night .ocean-greeting-scene__glow {
          top: -42px;
          right: 34px;
          background: rgba(153, 183, 255, 0.26);
        }

        .ocean-greeting-scene__sun,
        .ocean-greeting-scene__moon {
          position: absolute;
          z-index: 2;
          width: 72px;
          height: 72px;
          border-radius: 999px;
        }

        .ocean-greeting-scene__sun {
          top: 30px;
          right: 54px;
          background: radial-gradient(circle at 36% 32%, #fffde1 0 9%, #ffe36d 35%, #ffc242 70%, #ff9f2e 100%);
          box-shadow: 0 0 0 9px rgba(255, 231, 119, 0.12), 0 0 38px 8px rgba(255, 218, 94, 0.45);
          animation: ocean-home-sun-float 5.4s ease-in-out infinite;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__sun {
          top: 57px;
          right: 51px;
          background: radial-gradient(circle at 36% 32%, #fff3c4 0 7%, #ffd35c 29%, #ff9b38 66%, #ef6f43 100%);
          box-shadow: 0 0 0 9px rgba(255, 180, 92, 0.11), 0 0 38px 8px rgba(255, 133, 68, 0.42);
        }

        .ocean-greeting-scene__rays {
          position: absolute;
          z-index: 1;
          top: 66px;
          right: 89px;
          width: 0;
          height: 0;
          animation: ocean-home-rays-turn 16s linear infinite;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__rays {
          top: 93px;
          right: 87px;
        }

        .ocean-greeting-scene__rays span {
          position: absolute;
          width: 2px;
          height: 14px;
          border-radius: 999px;
          background: rgba(255, 246, 183, 0.92);
          box-shadow: 0 0 8px rgba(255, 235, 128, 0.75);
          animation: ocean-home-ray-pulse 2.6s ease-in-out infinite;
        }

        .ocean-greeting-scene__rays span:nth-child(2n) {
          animation-delay: -1.2s;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__rays span {
          background: rgba(255, 229, 175, 0.9);
          box-shadow: 0 0 8px rgba(255, 179, 100, 0.75);
        }

        .ocean-greeting-scene__moon {
          top: 27px;
          right: 57px;
          background: linear-gradient(135deg, #fffde9, #d6e8ff);
          box-shadow: 0 0 0 9px rgba(197, 219, 255, 0.08), 0 0 38px 8px rgba(161, 188, 255, 0.28);
          animation: ocean-home-moon-float 6.2s ease-in-out infinite;
        }

        .ocean-greeting-scene__moon span {
          position: absolute;
          top: -8px;
          right: -14px;
          width: 66px;
          height: 66px;
          border-radius: 999px;
          background: #173463;
          box-shadow: inset 0 0 18px rgba(18, 42, 86, 0.45);
        }

        .ocean-greeting-scene__stars i {
          position: absolute;
          z-index: 1;
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #f7fbff;
          box-shadow: 0 0 9px 2px rgba(199, 220, 255, 0.78);
          animation: ocean-home-twinkle 2.8s ease-in-out infinite;
        }

        .ocean-greeting-scene__stars i:nth-child(1) { top: 28px; left: 45px; }
        .ocean-greeting-scene__stars i:nth-child(2) { top: 67px; left: 94px; width: 3px; height: 3px; animation-delay: -1.3s; }
        .ocean-greeting-scene__stars i:nth-child(3) { top: 34px; left: 151px; width: 3px; height: 3px; animation-delay: -0.7s; }
        .ocean-greeting-scene__stars i:nth-child(4) { top: 101px; left: 43px; width: 2px; height: 2px; animation-delay: -1.8s; }
        .ocean-greeting-scene__stars i:nth-child(5) { top: 107px; right: 50px; width: 3px; height: 3px; animation-delay: -0.35s; }

        .ocean-greeting-scene__cloud {
          position: absolute;
          z-index: 3;
          height: 14px;
          border-radius: 999px;
          background: rgba(237, 251, 255, 0.34);
          filter: blur(0.2px);
        }

        .ocean-greeting-scene__cloud::before,
        .ocean-greeting-scene__cloud::after {
          position: absolute;
          bottom: 0;
          border-radius: 999px 999px 0 0;
          background: inherit;
          content: "";
        }

        .ocean-greeting-scene__cloud::before {
          left: 17%;
          width: 31%;
          height: 19px;
        }

        .ocean-greeting-scene__cloud::after {
          right: 14%;
          width: 40%;
          height: 26px;
        }

        .ocean-greeting-scene__cloud--far {
          top: 79px;
          left: -23px;
          width: 92px;
          opacity: 0.45;
          animation: ocean-home-cloud-drift 15s ease-in-out infinite alternate;
        }

        .ocean-greeting-scene__cloud--near {
          right: -20px;
          bottom: 62px;
          width: 122px;
          opacity: 0.58;
          animation: ocean-home-cloud-drift 18s ease-in-out -5s infinite alternate-reverse;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__cloud {
          background: rgba(255, 229, 211, 0.35);
        }

        .ocean-greeting-scene--night .ocean-greeting-scene__cloud {
          background: rgba(181, 205, 255, 0.2);
        }

        .ocean-greeting-scene__wave {
          position: absolute;
          z-index: 4;
          left: -11%;
          width: 124%;
          height: 86px;
          border-radius: 50% 50% 0 0 / 34% 34% 0 0;
          transform-origin: center bottom;
        }

        .ocean-greeting-scene__wave--back {
          bottom: -49px;
          background: rgba(30, 182, 192, 0.25);
          transform: rotate(-3deg);
          animation: ocean-home-wave-back 8.5s ease-in-out infinite;
        }

        .ocean-greeting-scene__wave--front {
          bottom: -60px;
          background: linear-gradient(90deg, rgba(7, 75, 108, 0.6), rgba(48, 193, 190, 0.42), rgba(9, 84, 131, 0.6));
          transform: rotate(2.5deg);
          animation: ocean-home-wave-front 7s ease-in-out infinite;
        }

        .ocean-greeting-scene--afternoon .ocean-greeting-scene__wave--back { background: rgba(44, 172, 180, 0.24); }
        .ocean-greeting-scene--afternoon .ocean-greeting-scene__wave--front { background: linear-gradient(90deg, rgba(21, 71, 107, 0.62), rgba(39, 163, 177, 0.42), rgba(30, 85, 125, 0.66)); }
        .ocean-greeting-scene--night .ocean-greeting-scene__wave--back { background: rgba(73, 119, 207, 0.22); }
        .ocean-greeting-scene--night .ocean-greeting-scene__wave--front { background: linear-gradient(90deg, rgba(6, 37, 91, 0.72), rgba(51, 112, 184, 0.42), rgba(12, 45, 102, 0.74)); }

        @keyframes ocean-home-glow {
          0%, 100% { opacity: 0.65; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes ocean-home-sun-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes ocean-home-moon-float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }

        @keyframes ocean-home-rays-turn {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ocean-home-ray-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }

        @keyframes ocean-home-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.35); }
        }

        @keyframes ocean-home-cloud-drift {
          from { transform: translateX(-7px); }
          to { transform: translateX(12px); }
        }

        @keyframes ocean-home-wave-back {
          0%, 100% { transform: rotate(-3deg) translateX(-2%); }
          50% { transform: rotate(-1deg) translateX(2%); }
        }

        @keyframes ocean-home-wave-front {
          0%, 100% { transform: rotate(2.5deg) translateX(1%); }
          50% { transform: rotate(0.5deg) translateX(-2%); }
        }

        @media (max-width: 1023px) {
          .ocean-greeting-scene__cloud--far { left: 8%; }
          .ocean-greeting-scene__cloud--near { right: 5%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ocean-greeting-scene *,
          .ocean-greeting-scene {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}
