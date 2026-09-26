export type ClockState = {
  whiteRemaining: number;
  blackRemaining: number;
  turn: "w" | "b";
  turnStartedAt: number;
};

export function getCurrentClock(clock: ClockState) {
  const elapsed = Math.max(0, Date.now() - clock.turnStartedAt);

  if (clock.turn === "w") {
    return {
      whiteRemaining: Math.max(0, clock.whiteRemaining - elapsed),
      blackRemaining: clock.blackRemaining,
    };
  }

  return {
    whiteRemaining: clock.whiteRemaining,
    blackRemaining: Math.max(0, clock.blackRemaining - elapsed),
  };
}
