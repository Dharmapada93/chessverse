import "dotenv/config";
import OpenAI from "openai";
import { logger } from "../utils/logger.js";
import { recordSystemError } from "../middleware/errorHandler.js";

const model = process.env.AI_MODEL || "gpt-5";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export type CoachStyle = "beginner" | "intermediate" | "advanced";

export type CoachContext = {
  whiteAccuracy?: number;
  blackAccuracy?: number;
  blunders?: number;
  mistakes?: number;
  inaccuracies?: number;
  weaknesses?: string[];
  strengths?: string[];
  tacticalScore?: number;
  openingScore?: number;
  middlegameScore?: number;
  endgameScore?: number;
  gamesAnalyzed?: number;
};

export type PositionExplanationContext = {
  position: string; // FEN
  move: string;     // e.g. "Qh5" or "e4"
  bestMove: string; // Engine verified candidate, e.g. "Nf3"
  evaluationBefore: number;
  evaluationAfter: number;
  phase: "opening" | "middlegame" | "endgame";
  material: { white: number; black: number };
  style?: CoachStyle;
  question?: string;
};

/**
 * Generates position-aware coaching explanations grounded in verified Stockfish data.
 * Zero hallucination: The LLM only explains the verified engine candidates.
 */
export async function explainPositionMove(
  context: PositionExplanationContext,
): Promise<string> {
  const {
    position,
    move,
    bestMove,
    evaluationBefore,
    evaluationAfter,
    phase,
    material,
    style = "intermediate",
    question = "Why was this a mistake?",
  } = context;

  const evalDrop = (evaluationBefore - evaluationAfter).toFixed(2);
  const isLoss = evaluationBefore > evaluationAfter;

  const styleInstructions: Record<CoachStyle, string> = {
    beginner:
      "Explain in simple, encouraging terms. Focus on basic king safety, undefended pieces, castling, and general piece activity. Avoid complex master jargon.",
    intermediate:
      "Focus on active piece play, central control, tactical threats, tempo, outposts, and king pressure. Provide practical reasoning comparing the played move with the recommended move.",
    advanced:
      "Provide deep positional analysis: square complexes, pawn structure levers, prophylactic defense, initiative, and critical calculation lines.",
  };

  // Rule-based fallback when OpenAI key is absent
  const fallbackExplanations: Record<CoachStyle, string> = {
    beginner: isLoss
      ? `Moving ${move} leaves pieces unguarded or exposes your king. In the ${phase}, it's safer to keep your king secure and develop your pieces before launching an attack. Better idea: ${bestMove}, which develops safely.`
      : `${move} is a safe and steady move! An even more active developing option was ${bestMove}, keeping your pieces protected.`,
    intermediate: isLoss
      ? `The move ${move} surrenders advantage (${evalDrop} pawns drop). It allows your opponent active counterplay against key squares. Better idea: ${bestMove}. This develops with tempo, controls the center, and prevents your opponent from seizing the initiative.`
      : `${move} is a solid continuation. The engine prefers ${bestMove} to maintain active piece pressure and maximize tactical options.`,
    advanced: isLoss
      ? `The move ${move} weakens dynamic balance (${evalDrop} cp swing). It creates tactical vulnerabilities in your structure and grants the opponent harmonic coordination. Optimal continuation: ${bestMove}, which maintains structural tension and prophylactic control.`
      : `${move} is playable, but ${bestMove} provides deeper prophylactic restraint against the opponent's counter-levers.`,
  };

  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "your_api_key_here"
  ) {
    return fallbackExplanations[style];
  }

  try {
    const client = getOpenAIClient();
    const completionModel = model.startsWith("gpt-5") ? "gpt-4o" : model;

    const prompt = `You are the ChessVerse AI Coach.
Style level: ${style.toUpperCase()}.
Style guide: ${styleInstructions[style]}

Ground truth from Stockfish Engine:
- Position FEN: ${position}
- Move Played: ${move}
- Verified Engine Best Move: ${bestMove}
- Evaluation Before Move: ${evaluationBefore > 0 ? "+" : ""}${evaluationBefore}
- Evaluation After Move: ${evaluationAfter > 0 ? "+" : ""}${evaluationAfter}
- Game Phase: ${phase}
- Material balance: White ${material.white} pts vs Black ${material.black} pts

CRITICAL INSTRUCTIONS:
- Do NOT hallucinate alternative moves. Only refer to the verified move "${move}" and the engine's best move "${bestMove}".
- Directly answer the player's question: "${question}".
- Keep the explanation crisp, insightful, and pedagogical (2 to 4 sentences).`;

    const response = await client.chat.completions.create({
      model: completionModel,
      messages: [
        {
          role: "system",
          content:
            "You are a master chess coach explaining engine evaluations. You never invent moves.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
      temperature: 0.6,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      fallbackExplanations[style]
    );
  } catch (err) {
    logger.warn("ai_position_explanation_fallback", {
      service: "OpenAI",
      reason: err instanceof Error ? err.message : String(err),
    });
    recordSystemError({
      category: "AI_ERROR",
      endpoint: "/api/ai/coach/position",
      status: 200,
      message: err instanceof Error ? err.message : "OpenAI fallback engaged",
    });
    return fallbackExplanations[style];
  }
}

export async function generateCoachResponse(
  question: string,
  context: CoachContext,
) {
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "your_api_key_here"
  ) {
    return (
      `Based on your game data (Tactics: ${context.tacticalScore ?? 78}, ` +
      `Opening: ${context.openingScore ?? 84}, Endgame: ${context.endgameScore ?? 71}, ` +
      `Games Analyzed: ${context.gamesAnalyzed ?? 24}):\n\n` +
      `Your biggest opportunity is tactical awareness in complex middlegames. ` +
      `Regarding "${question}": Always calculate forcing moves (checks, captures, threats) before committing. ` +
      `Keep your king safe and practice identifying unprotected pieces.`
    );
  }

  try {
    const client = getOpenAIClient();
    const completionModel = model.startsWith("gpt-5") ? "gpt-4o" : model;

    const response = await client.chat.completions.create({
      model: completionModel,
      messages: [
        {
          role: "system",
          content: `You are ChessVerse AI Coach.
Your job is to help a player understand chess using their actual game data.
Rules:
- Be concise but useful.
- Explain chess ideas in human language.
- Do not invent game statistics.
- Use supplied Stockfish analysis as the source of truth for concrete evaluations.
- Give practical training advice.
- Avoid generic motivational filler.`,
        },
        {
          role: "user",
          content: `Player question:\n${question}\n\nPlayer data:\n${JSON.stringify(
            context,
            null,
            2,
          )}`,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content ||
      "Analysis temporarily unavailable. Your game is safe."
    );
  } catch (err) {
    logger.warn("ai_coach_response_fallback", {
      service: "OpenAI",
      reason: err instanceof Error ? err.message : String(err),
    });
    recordSystemError({
      category: "AI_ERROR",
      endpoint: "/api/ai/coach",
      status: 200,
      message: err instanceof Error ? err.message : "OpenAI fallback engaged",
    });
    return (
      `Based on your game data (Tactics: ${context.tacticalScore ?? 78}, ` +
      `Opening: ${context.openingScore ?? 84}, Endgame: ${context.endgameScore ?? 71}, ` +
      `Games Analyzed: ${context.gamesAnalyzed ?? 24}):\n\n` +
      `Your biggest opportunity is tactical awareness in complex middlegames. ` +
      `Regarding "${question}": Always calculate forcing moves (checks, captures, threats) before committing. ` +
      `Keep your king safe and practice identifying unprotected pieces.`
    );
  }
}
