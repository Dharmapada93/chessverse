export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number,
) {
  return (
    1 /
    (1 +
      Math.pow(
        10,
        (opponentRating -
          playerRating) /
          400,
      ))
  );
}

export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  score: number,
  kFactor = 32,
) {
  const expected =
    calculateExpectedScore(
      playerRating,
      opponentRating,
    );

  return Math.round(
    kFactor * (score - expected),
  );
}
