import type { Request, Response, NextFunction } from "express";

interface RequestSample {
  timestamp: number;
  durationMs: number;
  statusCode: number;
  path: string;
}

const MAX_SAMPLES = 200;
const samples: RequestSample[] = [];
let totalRequestCount = 0;

/**
 * Lightweight Express telemetry middleware.
 * Records request latencies and response statuses in a bounded sliding window
 * to compute real P95 latency, request rates, and error percentages.
 */
export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    totalRequestCount++;

    samples.push({
      timestamp: Date.now(),
      durationMs,
      statusCode: res.statusCode,
      path: req.baseUrl + req.path,
    });

    if (samples.length > MAX_SAMPLES) {
      samples.shift();
    }
  });

  next();
}

/**
 * Calculates current real-time API telemetry metrics based on actual traffic.
 */
export function getApiTelemetry() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  const recentOneMinute = samples.filter((s) => s.timestamp >= oneMinuteAgo);
  const requestsPerMin = recentOneMinute.length;

  if (samples.length === 0) {
    return {
      requestsPerMin: 0,
      p95LatencyMs: 0,
      avgLatencyMs: 0,
      errorRatePct: 0,
      totalRequests: totalRequestCount,
    };
  }

  // Calculate P95 latency from samples
  const sortedDurations = samples.map((s) => s.durationMs).sort((a, b) => a - b);
  const p95Index = Math.min(
    sortedDurations.length - 1,
    Math.floor(sortedDurations.length * 0.95),
  );
  const p95LatencyMs = sortedDurations[p95Index] ?? 0;
  const avgLatencyMs = Math.round(
    sortedDurations.reduce((sum, d) => sum + d, 0) / sortedDurations.length,
  );

  // Calculate error rate (% of status >= 400)
  const errorCount = samples.filter((s) => s.statusCode >= 400).length;
  const errorRatePct = Number(((errorCount / samples.length) * 100).toFixed(2));

  return {
    requestsPerMin,
    p95LatencyMs,
    avgLatencyMs,
    errorRatePct,
    totalRequests: totalRequestCount,
  };
}
