import { themeAssetPaths, type FocusTheme, type ProceduralSound } from "./focus";

function noiseBuffer(ctx: AudioContext, type: "white" | "brown"): AudioBuffer {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "white") {
      data[i] = white * 0.4;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

function loopSource(ctx: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start();
  return src;
}

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private file: HTMLAudioElement | null = null;
  private timers: number[] = [];
  private osc: OscillatorNode[] = [];
  private sources: AudioBufferSourceNode[] = [];

  async start(theme: FocusTheme, volume: number) {
    await this.stop();
    if (theme.procedural === "none") return;

    const paths = themeAssetPaths(theme.id);
    const fileOk = await this.tryFile(paths.audioMp3, paths.audioOgg, volume);
    if (fileOk) return;

    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = volume;
    this.master.connect(ctx.destination);
    if (ctx.state === "suspended") await ctx.resume();
    this.patch(theme.procedural);
  }

  setVolume(volume: number) {
    if (this.file) this.file.volume = volume;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  async stop() {
    this.timers.forEach((id) => window.clearInterval(id));
    this.timers = [];
    this.osc.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
      o.disconnect();
    });
    this.osc = [];
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
      s.disconnect();
    });
    this.sources = [];
    if (this.file) {
      this.file.pause();
      this.file.src = "";
      this.file = null;
    }
    if (this.ctx) {
      await this.ctx.close().catch(() => undefined);
      this.ctx = null;
      this.master = null;
    }
  }

  private async tryFile(mp3: string, ogg: string, volume: number): Promise<boolean> {
    for (const url of [mp3, ogg]) {
      const ok = await this.canPlay(url);
      if (!ok) continue;
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = volume;
      try {
        await audio.play();
        this.file = audio;
        return true;
      } catch {
        audio.pause();
      }
    }
    return false;
  }

  private async canPlay(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  private patch(kind: ProceduralSound) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || kind === "none") return;

    const addNoise = (type: "white" | "brown", filterType: BiquadFilterType, freq: number, gainValue: number) => {
      const src = loopSource(ctx, noiseBuffer(ctx, type));
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gainValue;
      src.connect(filter);
      filter.connect(g);
      g.connect(master);
      this.sources.push(src);
      return { src, filter, g };
    };

    const addOsc = (freq: number, type: OscillatorType, gainValue: number) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gainValue;
      osc.connect(g);
      g.connect(master);
      osc.start();
      this.osc.push(osc);
      return { osc, g };
    };

    if (kind === "ocean") {
      const wave = addNoise("brown", "lowpass", 480, 0.55);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 0.25;
      lfo.connect(lfoGain);
      lfoGain.connect(wave.g.gain);
      lfo.start();
      this.osc.push(lfo);
    } else if (kind === "rain") {
      addNoise("white", "highpass", 1800, 0.18);
      addNoise("brown", "lowpass", 220, 0.2);
    } else if (kind === "car") {
      addOsc(52, "sawtooth", 0.03);
      addOsc(78, "sine", 0.04);
      addNoise("brown", "lowpass", 180, 0.35);
    } else if (kind === "birds") {
      addNoise("brown", "lowpass", 400, 0.08);
      const chirp = () => {
        if (!this.ctx || !this.master) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const startF = 1800 + Math.random() * 1400;
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 400, now + 0.16);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.2);
      };
      this.timers.push(window.setInterval(chirp, 2200));
      chirp();
    } else if (kind === "office") {
      addNoise("brown", "lowpass", 700, 0.22);
      addNoise("white", "bandpass", 1200, 0.04);
    } else if (kind === "cafe") {
      addNoise("brown", "lowpass", 800, 0.2);
      addNoise("white", "bandpass", 2500, 0.05);
      const clink = () => {
        if (!this.ctx || !this.master) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.frequency.value = 1800 + Math.random() * 900;
        osc.type = "triangle";
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.26);
      };
      this.timers.push(window.setInterval(clink, 4500));
    } else if (kind === "binaural") {
      const merge = ctx.createChannelMerger(2);
      const left = ctx.createOscillator();
      const right = ctx.createOscillator();
      const lg = ctx.createGain();
      const rg = ctx.createGain();
      left.frequency.value = 200;
      right.frequency.value = 240;
      lg.gain.value = 0.07;
      rg.gain.value = 0.07;
      left.connect(lg);
      right.connect(rg);
      lg.connect(merge, 0, 0);
      rg.connect(merge, 0, 1);
      merge.connect(master);
      left.start();
      right.start();
      this.osc.push(left, right);
      addNoise("brown", "lowpass", 300, 0.18);
    } else if (kind === "pad") {
      addOsc(130.81, "sine", 0.05);
      addOsc(164.81, "sine", 0.035);
      addOsc(196.0, "sine", 0.03);
    }
  }
}

export function playChime() {
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + i * 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + 0.8 + i * 0.12);
  });
  window.setTimeout(() => ctx.close().catch(() => undefined), 1200);
}
