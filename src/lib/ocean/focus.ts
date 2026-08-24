export type FocusThemeId =
  | "oceano-quieto"
  | "canto-no-campo"
  | "companhia"
  | "estrada"
  | "cafeteria"
  | "chuva"
  | "onda-de-foco"
  | "classico"
  | "silencio";

export type ProceduralSound =
  | "ocean"
  | "birds"
  | "office"
  | "car"
  | "cafe"
  | "rain"
  | "binaural"
  | "pad"
  | "none";

export interface FocusTheme {
  id: FocusThemeId;
  name: string;
  tagline: string;
  soundHint: string;
  procedural: ProceduralSound;
}

export const FOCUS_THEMES: FocusTheme[] = [
  {
    id: "oceano-quieto",
    name: "Oceano quieto",
    tagline: "O mar no ritmo da respiração",
    soundHint: "ondas lentas",
    procedural: "ocean",
  },
  {
    id: "canto-no-campo",
    name: "Canto no campo",
    tagline: "Pássaros e manhã sem pressa",
    soundHint: "canto dos pássaros",
    procedural: "birds",
  },
  {
    id: "companhia",
    name: "Companhia",
    tagline: "Alguém trabalhando perto de você",
    soundHint: "mesa compartilhada",
    procedural: "office",
  },
  {
    id: "estrada",
    name: "Estrada sem pressa",
    tagline: "Motor baixo, paisagem passando",
    soundHint: "carro em viagem calma",
    procedural: "car",
  },
  {
    id: "cafeteria",
    name: "Cafeteria",
    tagline: "Xícaras, conversas ao fundo",
    soundHint: "café cheio",
    procedural: "cafe",
  },
  {
    id: "chuva",
    name: "Chuva na janela",
    tagline: "Gotas no vidro, mundo lá fora",
    soundHint: "chuva constante",
    procedural: "rain",
  },
  {
    id: "onda-de-foco",
    name: "Onda de foco",
    tagline: "Frequência suave para o cérebro TDAH",
    soundHint: "ruído marrom + 40 Hz",
    procedural: "binaural",
  },
  {
    id: "classico",
    name: "Clássico",
    tagline: "Sala vazia, instrumento à espera",
    soundHint: "piano / orquestra (arquivo)",
    procedural: "pad",
  },
  {
    id: "silencio",
    name: "Silêncio total",
    tagline: "Nada além do que você escolheu fazer",
    soundHint: "sem som",
    procedural: "none",
  },
];

export const FOCUS_PRESETS = [
  { id: "leve", label: "Leve", focus: 15, brk: 5, longBreak: 15 },
  { id: "classico", label: "Clássico", focus: 25, brk: 5, longBreak: 15 },
  { id: "fundo", label: "Fundo", focus: 50, brk: 10, longBreak: 20 },
] as const;

export const FOCUS_SETTINGS_KEY = "oceanquiet.focus.v1";
export const FOCUS_HISTORY_KEY = "oceanquiet.focus-history.v1";

export interface FocusSettings {
  themeId: FocusThemeId;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLong: number;
  volume: number;
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  themeId: "oceano-quieto",
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLong: 4,
  volume: 0.45,
};

export function themeAssetPaths(id: FocusThemeId) {
  const base = `/focus/themes/${id}`;
  return {
    cover: `${base}/cover.jpg`,
    video: `${base}/loop.webm`,
    audioMp3: `${base}/audio.mp3`,
    audioOgg: `${base}/audio.ogg`,
  };
}
