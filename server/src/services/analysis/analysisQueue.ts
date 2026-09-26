import { analyzeGame } from "./analyzeGame.js";
import { logger } from "../../utils/logger.js";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface AnalysisJob {
  id: string;
  gameId: string;
  depth: number;
  userId?: string;
  status: JobStatus;
  result?: any;
  error?: string;
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;
}

const MAX_CONCURRENT_WORKERS = 2;

class AnalysisQueue {
  private queue: AnalysisJob[] = [];
  private jobs = new Map<string, AnalysisJob>();
  private activeWorkers = 0;

  enqueue(gameId: string, depth = 16, userId?: string): {
    jobId: string;
    status: JobStatus;
    position: number;
  } {
    // Check if an active or pending job already exists for this game
    const existing = Array.from(this.jobs.values()).find(
      (j) => j.gameId === gameId && (j.status === "pending" || j.status === "processing"),
    );

    if (existing) {
      const position = this.queue.findIndex((j) => j.id === existing.id) + 1;
      return {
        jobId: existing.id,
        status: existing.status,
        position: Math.max(1, position),
      };
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: AnalysisJob = {
      id: jobId,
      gameId,
      depth,
      userId,
      status: "pending",
      queuedAt: Date.now(),
    };

    this.jobs.set(jobId, job);
    this.queue.push(job);

    logger.info("analysis_job_enqueued", { jobId, gameId, depth, queueLength: this.queue.length });

    this.processNext();

    const position = this.queue.length;
    return { jobId, status: "pending", position };
  }

  getJob(jobIdOrGameId: string): AnalysisJob | null {
    if (this.jobs.has(jobIdOrGameId)) {
      return this.jobs.get(jobIdOrGameId) || null;
    }

    // Lookup by gameId
    const found = Array.from(this.jobs.values())
      .reverse()
      .find((j) => j.gameId === jobIdOrGameId);
    return found || null;
  }

  getStats() {
    return {
      activeWorkers: this.activeWorkers,
      maxWorkers: MAX_CONCURRENT_WORKERS,
      queueLength: this.queue.length,
      totalJobsTracked: this.jobs.size,
    };
  }

  private async processNext() {
    if (this.activeWorkers >= MAX_CONCURRENT_WORKERS || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;
    job.status = "processing";
    job.startedAt = Date.now();

    logger.info("analysis_job_started", { jobId: job.id, gameId: job.gameId });

    try {
      const result = await analyzeGame(job.gameId, job.depth);
      job.status = "completed";
      job.result = result;
      job.completedAt = Date.now();
      logger.info("analysis_job_completed", {
        jobId: job.id,
        gameId: job.gameId,
        durationMs: job.completedAt - (job.startedAt || job.queuedAt),
      });
    } catch (err: any) {
      job.status = "failed";
      job.error = err?.message || "Stockfish analysis failed";
      job.completedAt = Date.now();
      logger.error("analysis_job_failed", { jobId: job.id, gameId: job.gameId, error: job.error });
    } finally {
      this.activeWorkers--;
      // Keep memory bounded: retain last 200 jobs
      if (this.jobs.size > 200) {
        const oldestKey = this.jobs.keys().next().value;
        if (oldestKey) this.jobs.delete(oldestKey);
      }
      this.processNext();
    }
  }
}

export const analysisQueue = new AnalysisQueue();
