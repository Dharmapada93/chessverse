type ClockState = {
  white: number;
  black: number;
  increment: number;
  activeColor: "white" | "black" | null;
  lastUpdate: number;
  timer?: NodeJS.Timeout;
};

const clocks = new Map<string, ClockState>();

export function createClock(
  roomId: string,
  minutes: number,
  increment: number,
) {
  const existing = clocks.get(roomId);

  if (existing) {
    return existing;
  }

  const clock: ClockState = {
    white: minutes * 60 * 1000,
    black: minutes * 60 * 1000,
    increment: increment * 1000,
    activeColor: null,
    lastUpdate: Date.now(),
  };

  clocks.set(roomId, clock);

  return clock;
}

export function startClock(
  roomId: string,
  color: "white" | "black",
) {
  const clock = clocks.get(roomId);

  if (!clock) {
    return;
  }

  clock.activeColor = color;
  clock.lastUpdate = Date.now();

  if (clock.timer) {
    clearInterval(clock.timer);
  }

  clock.timer = setInterval(() => {
    if (!clock.activeColor) {
      return;
    }

    const now = Date.now();
    const elapsed =
      now - clock.lastUpdate;

    clock[clock.activeColor] -= elapsed;
    clock.lastUpdate = now;

    if (
      clock[clock.activeColor] <= 0
    ) {
      clock[clock.activeColor] = 0;

      clearInterval(clock.timer);
    }
  }, 100);
}

export function switchClock(
  roomId: string,
  nextColor: "white" | "black",
) {
  const clock = clocks.get(roomId);

  if (!clock) {
    return;
  }

  const now = Date.now();

  if (clock.activeColor) {
    const elapsed =
      now - clock.lastUpdate;

    clock[clock.activeColor] -= elapsed;

    if (
      clock[clock.activeColor] < 0
    ) {
      clock[clock.activeColor] = 0;
    }

    clock[clock.activeColor] +=
      clock.increment;
  }

  clock.activeColor = nextColor;
  clock.lastUpdate = now;
}

export function getClock(roomId: string) {
  const clock = clocks.get(roomId);

  if (!clock) {
    return null;
  }

  const now = Date.now();

  const result = {
    white: clock.white,
    black: clock.black,
    activeColor: clock.activeColor,
  };

  if (clock.activeColor) {
    const elapsed =
      now - clock.lastUpdate;

    result[clock.activeColor] = Math.max(
      0,
      result[clock.activeColor] - elapsed,
    );
  }

  return result;
}

export function removeClock(
  roomId: string,
) {
  const clock = clocks.get(roomId);

  if (!clock) {
    return;
  }

  if (clock.timer) {
    clearInterval(clock.timer);
  }

  clocks.delete(roomId);
}
