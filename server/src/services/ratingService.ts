export function expectedScore(
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

export function calculateRating(
  rating: number,
  opponentRating: number,
  actualScore: number,
  k = 32,
): number {
  const expected = expectedScore(
    rating,
    opponentRating,
  );

  return Math.round(
    rating + k * (actualScore - expected),
  );
}

export function getTimeControlCategory(
  timeMs: number,
  incrementMs = 0,
): "bullet" | "blitz" | "rapid" | "classical" {
  // Standard FIDE/Lichess estimated time = time + 40 * increment
  const totalEstimatedSec = (timeMs + 40 * incrementMs) / 1000;
  if (totalEstimatedSec < 180) return "bullet";     // < 3 min
  if (totalEstimatedSec < 600) return "blitz";      // < 10 min
  if (totalEstimatedSec < 1800) return "rapid";     // < 30 min
  return "classical";
}
