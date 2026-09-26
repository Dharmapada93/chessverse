"use client";

// Sound Engine with dual playback:
// 1. Plays physical sound files from /sounds/{type}.mp3
// 2. Synthesizes via Web Audio API as instantaneous fallback
// 3. Granular sound settings: Move, Capture, Check, Game events (Step 79.5)
// 4. Autoplay compliant via gesture listener (Step 79.6)

export type SoundType =
  | "move"
  | "capture"
  | "check"
  | "castle"
  | "promote"
  | "gameStart"
  | "gameEnd";

export type SoundCategorySettings = {
  move: boolean;
  capture: boolean;
  check: boolean;
  gameEvents: boolean;
};

const DEFAULT_SETTINGS: SoundCategorySettings = {
  move: true,
  capture: true,
  check: true,
  gameEvents: true,
};

const SOUND_FILE_MAP: Record<SoundType, string> = {
  move: "/sounds/move.mp3",
  capture: "/sounds/capture.mp3",
  check: "/sounds/check.mp3",
  castle: "/sounds/castle.mp3",
  promote: "/sounds/promote.mp3",
  gameStart: "/sounds/game-start.mp3",
  gameEnd: "/sounds/game-end.mp3",
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private enabled = true;
  private categorySettings: SoundCategorySettings = { ...DEFAULT_SETTINGS };
  private audioCache = new Map<SoundType, HTMLAudioElement>();

  constructor() {
    if (typeof window !== "undefined") {
      const storedEnabled = localStorage.getItem("chessverse-sound");
      if (storedEnabled !== null) {
        this.enabled = storedEnabled === "true";
      }

      const storedCategories = localStorage.getItem("chessverse-sound-categories");
      if (storedCategories) {
        try {
          this.categorySettings = {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(storedCategories),
          };
        } catch {}
      }

      // Initialize on first user gesture for browser autoplay compliance (Step 79.6)
      const handleFirstGesture = () => {
        this.init();
        window.removeEventListener("pointerdown", handleFirstGesture);
        window.removeEventListener("keydown", handleFirstGesture);
      };

      window.addEventListener("pointerdown", handleFirstGesture, { once: true });
      window.addEventListener("keydown", handleFirstGesture, { once: true });
    }
  }

  private preloadAudio() {
    if (typeof window === "undefined") return;
    try {
      (Object.keys(SOUND_FILE_MAP) as SoundType[]).forEach((type) => {
        const src = SOUND_FILE_MAP[type];
        if (src && !this.audioCache.has(type)) {
          const audio = new Audio(src);
          audio.preload = "auto";
          audio.volume = 0.6;
          this.audioCache.set(type, audio);
        }
      });
    } catch {
      // Audio element preloading unsupported
    }
  }

  private init() {
    if (this.initialized || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        this.initialized = true;
      }
      this.preloadAudio();
    } catch {
      // AudioContext unavailable
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-sound", String(val));
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getSettings(): SoundCategorySettings {
    return { ...this.categorySettings };
  }

  public setCategoryEnabled(category: keyof SoundCategorySettings, val: boolean) {
    this.categorySettings[category] = val;
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-sound-categories", JSON.stringify(this.categorySettings));
    }
  }

  public setSettings(settings: Partial<SoundCategorySettings>) {
    this.categorySettings = { ...this.categorySettings, ...settings };
    if (typeof window !== "undefined") {
      localStorage.setItem("chessverse-sound-categories", JSON.stringify(this.categorySettings));
    }
  }

  private shouldPlay(type: SoundType): boolean {
    if (!this.enabled) return false;
    switch (type) {
      case "move":
      case "castle":
        return this.categorySettings.move;
      case "capture":
        return this.categorySettings.capture;
      case "check":
        return this.categorySettings.check;
      case "promote":
      case "gameStart":
      case "gameEnd":
        return this.categorySettings.gameEvents;
      default:
        return true;
    }
  }

  public play(type: SoundType) {
    if (!this.shouldPlay(type)) return;

    if (!this.initialized) {
      this.init();
    }

    // Reuse preloaded audio resource (R8.70)
    if (typeof window !== "undefined") {
      let audio = this.audioCache.get(type);
      if (!audio) {
        const src = SOUND_FILE_MAP[type];
        if (src) {
          audio = new Audio(src);
          audio.volume = 0.6;
          this.audioCache.set(type, audio);
        }
      }

      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // If browser policy or network issues prevent Audio element playback, fallback to Web Audio synthesis
          this.synthesizeFallback(type);
        });
        return;
      }
    }

    this.synthesizeFallback(type);
  }

  private synthesizeFallback(type: SoundType) {
    if (!this.ctx) return;

    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      switch (type) {
        case "move":
          this.synthesizeWoodTap(now, 260, 0.08, 0.25);
          break;
        case "capture":
          this.synthesizeImpact(now, 160, 0.14, 0.4);
          break;
        case "check":
          this.synthesizeChime(now, 620, 0.25, 0.3);
          break;
        case "castle":
          this.synthesizeWoodTap(now, 240, 0.07, 0.25);
          this.synthesizeWoodTap(now + 0.08, 290, 0.09, 0.25);
          break;
        case "promote":
          this.synthesizeFanfare(now);
          break;
        case "gameStart":
          this.synthesizeChord(now, [440, 554, 659], 0.3, 0.2);
          break;
        case "gameEnd":
          this.synthesizeChord(now, [392, 493.88, 587.33], 0.45, 0.25);
          break;
      }
    } catch {
      // Audio synthesis unavailable
    }
  }

  private synthesizeWoodTap(startTime: number, freq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + duration);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeImpact(startTime: number, baseFreq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + duration);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeChime(startTime: number, freq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private synthesizeFanfare(startTime: number) {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((note, index) => {
      this.synthesizeChime(startTime + index * 0.08, note, 0.2, 0.25);
    });
  }

  private synthesizeChord(startTime: number, freqs: number[], duration: number, gainPerNote: number) {
    freqs.forEach((freq) => {
      this.synthesizeChime(startTime, freq, duration, gainPerNote);
    });
  }
}

export const soundEngine = new SoundEngine();
