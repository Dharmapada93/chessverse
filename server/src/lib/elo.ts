export const RATING_FLOOR = 100;
export const DEFAULT_K_FACTOR = 32;
export const PROVISIONAL_K_FACTOR = 40;

export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number,
): number {
  return (
    1 /
    (1 +
      Math.pow(
        10,
        (opponentRating - playerRating) / 400,
      ))
  );
}

export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  score: number, // 1 for win, 0.5 for draw, 0 for loss
  kFactor = DEFAULT_K_FACTOR,
): number {
  const expected = calculateExpectedScore(playerRating, opponentRating);
  return Math.round(kFactor * (score - expected));
}

export interface MatchRatingResult {
  whiteDelta: number;
  blackDelta: number;
  newWhiteRating: number;
  newBlackRating: number;
}

/**
 * Calculates updated ratings for both players given game outcome.
 * score: 1 (White win), 0.5 (Draw), 0 (Black win)
 */
export function calculateMatchRatings(
  whiteRating: number,
  blackRating: number,
  score: number,
  isWhiteProvisional = false,
  isBlackProvisional = false,
  kFactorOverride?: number,
): MatchRatingResult {
  const whiteK = kFactorOverride ?? (isWhiteProvisional ? PROVISIONAL_K_FACTOR : DEFAULT_K_FACTOR);
  const blackK = kFactorOverride ?? (isBlackProvisional ? PROVISIONAL_K_FACTOR : DEFAULT_K_FACTOR);

  const whiteDelta = calculateRatingChange(whiteRating, blackRating, score, whiteK);
  const blackDelta = calculateRatingChange(blackRating, whiteRating, 1 - score, blackK);

  const newWhiteRating = Math.max(RATING_FLOOR, whiteRating + whiteDelta);
  const newBlackRating = Math.max(RATING_FLOOR, blackRating + blackDelta);

  return {
    whiteDelta,
    blackDelta,
    newWhiteRating,
    newBlackRating,
  };
}
