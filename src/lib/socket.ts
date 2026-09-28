import { io } from "socket.io-client";

const PRODUCTION_RENDER_SOCKET = "https://chessverse-backend-g26z.onrender.com";

export function getSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (envUrl && !envUrl.includes("api.chessverse.app")) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return envUrl.replace(/\/+$/, "");
      }
      if (envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return PRODUCTION_RENDER_SOCKET;
      }
    }
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return PRODUCTION_RENDER_SOCKET;
    }
  }

  return process.env.NODE_ENV === "production" ? PRODUCTION_RENDER_SOCKET : "http://localhost:4000";
}

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 16000,
  randomizationFactor: 0.5,
  auth: {
    token:
      typeof window !== "undefined"
        ? localStorage.getItem(
            "chessverse-token",
          )
        : null,
  },
});

// Step R13.17: Re-authenticate on every reconnection attempt
if (typeof window !== "undefined") {
  socket.io.on("reconnect_attempt", () => {
    const token = localStorage.getItem("chessverse-token");
    socket.auth = { token };
  });
}

/**
 * Event Deduplication Buffer (R8.29)
 * Keeps a sliding window of recent event IDs to reject duplicate deliveries on flaky connections.
 */
class EventDeduplicator {
  private seen = new Set<string>();
  private order: string[] = [];
  private readonly max = 100;

  isDuplicate(eventId?: string): boolean {
    if (!eventId) return false;
    if (this.seen.has(eventId)) return true;

    this.seen.add(eventId);
    this.order.push(eventId);
    if (this.order.length > this.max) {
      const oldest = this.order.shift();
      if (oldest) this.seen.delete(oldest);
    }
    return false;
  }

  clear() {
    this.seen.clear();
    this.order = [];
  }
}

export const eventDeduplicator = new EventDeduplicator();
