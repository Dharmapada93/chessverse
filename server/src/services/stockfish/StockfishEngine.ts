import { createRequire } from "node:module";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

const require = createRequire(import.meta.url);

export type EngineOutputHandler = (line: string) => void;

export class StockfishEngine {
  private childProcess: ChildProcessWithoutNullStreams | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private lineListeners: EngineOutputHandler[] = [];

  constructor(private customBinaryPath?: string) {}

  public async init(): Promise<void> {
    if (this.isInitialized && this.childProcess) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        let executable = process.execPath;
        let args: string[] = [];

        if (this.customBinaryPath) {
          executable = this.customBinaryPath;
          args = [];
        } else {
          // Resolve bundled stockfish binary script
          let stockfishScript = "";
          try {
            stockfishScript = require.resolve("stockfish/bin/stockfish.js");
          } catch {
            stockfishScript = require.resolve("stockfish/bin/stockfish-18.js");
          }
          executable = process.execPath;
          args = [stockfishScript];
        }

        const proc = spawn(executable, args);
        this.childProcess = proc;

        const timer = setTimeout(() => {
          this.terminate();
          reject(new Error("Stockfish initialization timed out"));
        }, 8000);

        let uciOk = false;

        proc.stdout.on("data", (chunk: Buffer) => {
          const lines = chunk.toString().split("\n");
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            this.notifyListeners(line);
            if (line === "uciok" && !uciOk) {
              uciOk = true;
              clearTimeout(timer);
              this.isInitialized = true;
              resolve();
            }
          }
        });

        proc.stderr.on("data", (errChunk: Buffer) => {
          console.warn("Stockfish stderr:", errChunk.toString());
        });

        proc.on("error", (err) => {
          clearTimeout(timer);
          this.terminate();
          reject(err);
        });

        proc.on("exit", () => {
          this.isInitialized = false;
          this.childProcess = null;
        });

        proc.stdin.write("uci\n");
      } catch (err) {
        this.terminate();
        reject(err);
      }
    });

    return this.initPromise;
  }

  public sendCommand(cmd: string): void {
    if (!this.childProcess || !this.childProcess.stdin) {
      throw new Error("Stockfish engine not running. Call init() first.");
    }
    this.childProcess.stdin.write(`${cmd}\n`);
  }

  private notifyListeners(line: string): void {
    for (const listener of [...this.lineListeners]) {
      try {
        listener(line);
      } catch (e) {
        console.error("Error in engine listener:", e);
      }
    }
  }

  public async evaluatePosition(
    fen: string,
    depth = 18,
    timeoutMs = 15000,
  ): Promise<string[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const outputLines: string[] = [];
      let timer: NodeJS.Timeout | null = null;

      const listener: EngineOutputHandler = (line: string) => {
        outputLines.push(line);
        if (line.startsWith("bestmove")) {
          cleanup();
          resolve(outputLines);
        }
      };

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        this.lineListeners = this.lineListeners.filter((l) => l !== listener);
      };

      timer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `Stockfish evaluation timed out after ${timeoutMs}ms for FEN: ${fen}`,
          ),
        );
      }, timeoutMs);

      this.lineListeners.push(listener);

      this.sendCommand("isready");
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
    });
  }

  public terminate(): void {
    if (this.childProcess) {
      try {
        this.sendCommand("quit");
        this.childProcess.kill();
      } catch {}
      this.childProcess = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
    this.lineListeners = [];
  }
}

// Global shared instance for application-wide use
let globalEngineInstance: StockfishEngine | null = null;

export function getSharedStockfishEngine(): StockfishEngine {
  if (!globalEngineInstance) {
    globalEngineInstance = new StockfishEngine(process.env.STOCKFISH_PATH);
  }
  return globalEngineInstance;
}
