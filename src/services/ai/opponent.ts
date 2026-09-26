import type { AIDifficulty, AIOpponentConfig } from "@/types/ai";

export interface BotDifficultySetting {
  id: AIDifficulty;
  name: string;
  depth: number;
  timeLimitMs: number;
  description: string;
}

export const BOT_DIFFICULTIES: Record<AIDifficulty, BotDifficultySetting> = {
  beginner: {
    id: "beginner",
    name: "Beginner",
    depth: 3,
    timeLimitMs: 1200,
    description: "Plays fast, occasionally overlooks simple tactical threats",
  },
  intermediate: {
    id: "intermediate",
    name: "Intermediate",
    depth: 7,
    timeLimitMs: 2500,
    description: "Solid piece development and fundamental tactical awareness",
  },
  advanced: {
    id: "advanced",
    name: "Advanced",
    depth: 12,
    timeLimitMs: 4000,
    description: "Strong positional play, deep calculation, and endgame accuracy",
  },
  expert: {
    id: "expert",
    name: "Expert",
    depth: 18,
    timeLimitMs: 6000,
    description: "Full engine calculation with grandmaster-level precision",
  },
};

export interface CreateAiGameParams {
  difficulty: AIDifficulty;
  userColor?: "white" | "black" | "random";
  timeControlSeconds?: number;
  incrementSeconds?: number;
}

export interface AiGameResponse {
  gameId: string;
  roomId: string;
  playerColor: "white" | "black";
  aiColor: "white" | "black";
  difficulty: AIDifficulty;
}

/**
 * Creates an authoritative AI game persisted on the server (R5.28, R5.32)
 */
export async function createAiGame(
  params: CreateAiGameParams,
  token?: string,
): Promise<AiGameResponse> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiUrl}/api/ai/opponent/game`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create AI game");
  }

  return res.json();
}

/**
 * Request next AI move with safe upper timeout and retry logic (R5.31)
 */
export async function requestAiMove(
  gameId: string,
  fen: string,
  difficulty: AIDifficulty = "intermediate",
  onRetryNotice?: (message: string) => void,
): Promise<{ from: string; to: string; promotion?: string; san?: string }> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  const maxAttempts = 2;
  const timeoutMs = 8000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${apiUrl}/api/ai/opponent/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, fen, difficulty }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.move) {
          return data.move;
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (attempt < maxAttempts) {
        onRetryNotice?.("AI is taking longer than expected. Retrying...");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw new Error("AI calculation timed out. Please try again.");
    }
  }

  throw new Error("AI move calculation failed.");
}
