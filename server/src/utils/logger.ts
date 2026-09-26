type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "jwt",
  "secret",
  "authorization",
  "cookie",
  "chessverse_session",
  "apikey",
  "api_key",
]);

function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      clean[key] = sanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

export class Logger {
  private formatLog(level: LogLevel, event: string, context?: Record<string, any>) {
    const payload = {
      level,
      event,
      timestamp: new Date().toISOString(),
      ...(context ? sanitize(context) : {}),
    };

    const output = JSON.stringify(payload);

    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "debug":
        if (process.env.LOG_LEVEL === "debug") {
          console.debug(output);
        }
        break;
      case "info":
      default:
        console.log(output);
        break;
    }
  }

  info(event: string, context?: Record<string, any>) {
    this.formatLog("info", event, context);
  }

  warn(event: string, context?: Record<string, any>) {
    this.formatLog("warn", event, context);
  }

  error(event: string, context?: Record<string, any>) {
    this.formatLog("error", event, context);
  }

  debug(event: string, context?: Record<string, any>) {
    this.formatLog("debug", event, context);
  }
}

export const logger = new Logger();
