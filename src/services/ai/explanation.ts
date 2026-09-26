import type { ExplanationLevel, MoveQuality, TacticalPattern } from "@/types/ai";

export interface ExplanationInput {
  playedMove: string;
  bestMove: string;
  alternativeMove?: string;
  evaluationBefore: number;
  evaluationAfter: number;
  classification: MoveQuality;
  level: ExplanationLevel;
  tacticalMotif?: TacticalPattern;
  gamePhase?: "opening" | "middlegame" | "endgame";
}

/**
 * Generates natural-language move explanations grounded strictly in engine facts (R5.9, R5.27, R5.53).
 */
export function generateMoveExplanation(input: ExplanationInput): string {
  const {
    playedMove,
    bestMove,
    evaluationBefore,
    evaluationAfter,
    classification,
    level,
    tacticalMotif,
    gamePhase = "middlegame",
  } = input;

  const swing = Math.abs(evaluationBefore - evaluationAfter);
  const swingStr = swing.toFixed(1);

  // 1. Tactical motif specific explanations
  if (tacticalMotif) {
    if (level === "beginner") {
      return `This position features a ${tacticalMotif.title.toLowerCase()}. ${tacticalMotif.description}`;
    }
    if (level === "advanced") {
      return `Exploits a tactical ${tacticalMotif.type}: ${tacticalMotif.description} The engine calculates a decisive initiative shift of ${swingStr} pawns.`;
    }
    return `${tacticalMotif.title}: ${tacticalMotif.description}`;
  }

  // 2. Classification based generation
  switch (classification) {
    case "brilliant":
      if (level === "beginner") {
        return `A brilliant sacrifice! ${playedMove} gives up a piece to launch a powerful attack on the opponent's king.`;
      }
      if (level === "advanced") {
        return `Profound intuitive piece sacrifice with ${playedMove}. Deflects key defenders, ruptures the opponent's pawn structure, and retains dynamic compensation.`;
      }
      return `Brilliant sacrifice! ${playedMove} gives up material to unleash an unstoppable attack and seize control.`;

    case "best":
      if (level === "beginner") {
        if (gamePhase === "opening") {
          return `${playedMove} is the best move! It develops your piece, helps control the center of the board, and keeps your king safe.`;
        }
        return `${playedMove} is the best move here. It keeps your pieces defended and actively placed.`;
      }
      if (level === "advanced") {
        return `${playedMove} is the engine's primary line. Maximizes piece harmonization, maintains central tension, and restricts opponent counter-levers.`;
      }
      return `Best move. ${playedMove} develops actively, reinforces central influence, and maintains a solid positional foundation.`;

    case "excellent":
    case "good":
      if (level === "beginner") {
        return `A solid move. ${playedMove} keeps things safe and steady, though ${bestMove} was slightly more active.`;
      }
      if (level === "advanced") {
        return `${playedMove} is structurally sound, conceding less than 0.25 pawns in dynamic equity compared to the optimal ${bestMove}.`;
      }
      return `${playedMove} is a good, reliable continuation. The engine slightly prefers ${bestMove} for greater central control.`;

    case "inaccuracy":
      if (level === "beginner") {
        return `${playedMove} is a little slow. It allows your opponent to get comfortable. Playing ${bestMove} would have been more active.`;
      }
      if (level === "advanced") {
        return `${playedMove} surrenders slight tempo (loss of ${swingStr} pawns). Better was ${bestMove}, maintaining harmonic piece coordination.`;
      }
      return `${playedMove} is slightly inaccurate. It allows your opponent counterplay. The preferred engine continuation is ${bestMove}.`;

    case "mistake":
      if (level === "beginner") {
        return `This move lets your opponent gain an advantage. You should have played ${bestMove} to keep your pieces safe and active.`;
      }
      if (level === "advanced") {
        return `Significant positional concession (${swingStr} pawns swing). ${playedMove} creates targetable weaknesses; ${bestMove} maintained structural integrity.`;
      }
      return `Mistake that swings the evaluation by ${swingStr} pawns. It surrenders initiative to the opponent. Better was ${bestMove}.`;

    case "blunder":
      if (level === "beginner") {
        return `A serious mistake! Moving ${playedMove} leaves an important piece unprotected or allows the opponent an immediate winning attack. Playing ${bestMove} was necessary.`;
      }
      if (level === "advanced") {
        return `Decisive blunder conceding ${swingStr} pawns. ${playedMove} succumbs to tactical vulnerability and unbalances the position; ${bestMove} was mandatory.`;
      }
      return `Blunder: Evaluation dropped from ${evaluationBefore >= 0 ? "+" : ""}${evaluationBefore.toFixed(1)} to ${evaluationAfter >= 0 ? "+" : ""}${evaluationAfter.toFixed(1)}. This allows a tactical sequence; better was ${bestMove}.`;

    case "missed_opportunity":
      if (level === "beginner") {
        return `You had a winning chance here! Instead of ${playedMove}, playing ${bestMove} would have won material or given a big attack.`;
      }
      if (level === "advanced") {
        return `Critical missed opportunity: squandered a winning advantage. ${bestMove} calculates as a forced tactical breakthrough.`;
      }
      return `Missed opportunity: You had a decisive continuation with ${bestMove}, but played ${playedMove} instead.`;
  }
}

/**
 * Answer position-aware questions from the AI coach with strict guardrails (R5.23, R5.24, R5.25).
 */
export function getCoachResponseForQuestion(
  question: string,
  context: {
    fen: string;
    playedMove?: string;
    bestMove?: string;
    evaluationBefore?: number;
    evaluationAfter?: number;
    classification?: MoveQuality;
    level?: ExplanationLevel;
    tacticalMotif?: TacticalPattern;
  },
): string {
  const q = question.toLowerCase();
  const {
    playedMove = "the played move",
    bestMove = "the best move",
    evaluationBefore = 0,
    evaluationAfter = 0,
    classification = "good",
    level = "intermediate",
    tacticalMotif,
  } = context;

  // Guardrail: If no context or missing crucial engine data (R5.24)
  if (!context.fen || !bestMove) {
    return "I don't have enough information to explain that position reliably.";
  }

  if (q.includes("why was this move bad") || q.includes("why was this a mistake") || q.includes("mistake")) {
    if (classification === "best" || classification === "brilliant") {
      return `Actually, ${playedMove} was an excellent move! It followed the engine's top choice and kept strong control.`;
    }
    const drop = Math.abs(evaluationBefore - evaluationAfter).toFixed(1);
    return `Playing ${playedMove} dropped the position evaluation by ${drop} pawns. It gave away key square control or left pieces vulnerable. Playing ${bestMove} was much stronger.`;
  }

  if (q.includes("what should i have played") || q.includes("better move")) {
    return `The engine's recommended move was ${bestMove}. It maintains active piece placement and coordinates better with your plans.`;
  }

  if (q.includes("key moment") || q.includes("turning point")) {
    if (classification === "blunder" || classification === "mistake" || classification === "missed_opportunity") {
      return `Yes, this move was a critical turning point! The evaluation shifted significantly here. Focusing on moves like ${bestMove} helps prevent these swings.`;
    }
    return `This was a steady moment in the game. Keep developing pieces toward central squares and preparing king safety.`;
  }

  if (q.includes("simply") || q.includes("simple")) {
    return generateMoveExplanation({
      playedMove,
      bestMove,
      evaluationBefore,
      evaluationAfter,
      classification,
      level: "beginner",
      tacticalMotif,
    });
  }

  if (q.includes("biggest mistake") || q.includes("how could i improve")) {
    return `To improve from positions like this, check all opponent checks, captures, and threats before making your move. In this position, ${bestMove} kept the initiative.`;
  }

  // General explanation
  return generateMoveExplanation({
    playedMove,
    bestMove,
    evaluationBefore,
    evaluationAfter,
    classification,
    level,
    tacticalMotif,
  });
}
