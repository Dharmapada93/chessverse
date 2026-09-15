export type EngineLine = {
  depth: number;
  score: number;
  mate?: number;
  bestMove?: string;
};

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private listeners = new Set<(line: EngineLine) => void>();

  async init() {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(
      "/stockfish/stockfish-18-lite-single.js",
    );

    this.worker.onmessage = (event) => {
      this.handleMessage(String(event.data));
    };

    this.send("uci");

    await new Promise<void>((resolve) => {
      const check = () => {
        if (this.ready) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  analyze(fen: string, depth = 16) {
    if (!this.worker) {
      throw new Error("Stockfish is not initialized");
    }

    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
  }

  stop() {
    this.send("stop");
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }

  onLine(listener: (line: EngineLine) => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private send(command: string) {
    this.worker?.postMessage(command);
  }

  private handleMessage(message: string) {
    if (message === "uciok") {
      this.send("isready");
      return;
    }

    if (message === "readyok") {
      this.ready = true;
      return;
    }

    if (!message.startsWith("info")) {
      return;
    }

    const depthMatch = message.match(/\bdepth\s+(\d+)/);
    const scoreMatch = message.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
    const pvMatch = message.match(/\bpv\s+(.+)/);

    if (!depthMatch || !scoreMatch) {
      return;
    }

    const type = scoreMatch[1];
    const value = Number(scoreMatch[2]);

    const line: EngineLine = {
      depth: Number(depthMatch[1]),
      score: type === "cp" ? value : 0,
      mate: type === "mate" ? value : undefined,
      bestMove: pvMatch?.[1]?.split(" ")[0],
    };

    for (const listener of this.listeners) {
      listener(line);
    }
  }
}
