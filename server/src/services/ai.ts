type ExplainMoveInput = {
  fen: string;
  move: string;
  bestMove?: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
};

export async function explainMove(
  input: ExplainMoveInput,
) {
  const {
    fen,
    move,
    bestMove,
    evaluationBefore,
    evaluationAfter,
  } = input;

  return {
    explanation:
      `The move ${move} changes the position significantly. ` +
      `The engine's preferred continuation is ${
        bestMove ?? "not available"
      }. ` +
      `The evaluation changed from ${
        evaluationBefore ?? "unknown"
      } to ${
        evaluationAfter ?? "unknown"
      }.`,
    fen,
    move,
  };
}
